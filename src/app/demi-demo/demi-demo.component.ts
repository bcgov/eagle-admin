import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, signal, computed, inject } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { interval, Subject, Subscription, switchMap, debounceTime, retry, timer, tap, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { DemiService, AgendaJob } from '../services/demi.service';
import { DocumentService } from '../services/document.service';
import { ConfigService } from '../services/config.service';
import { LoggingService } from '../services/logging.service';
import { KeycloakService } from '../services/keycloak.service';
import { Document } from '../models/document';
import { ExtractionProgressComponent, ExtractionPhase } from '../shared/extraction-progress/extraction-progress.component';
import { sanitizeHighlight } from '../shared/utils/sanitize-highlight';

const STORAGE_KEY = 'demi-active-job';

interface PersistedJob {
  jobId: string;
  fileName: string;
  fileSize?: number;
  docId?: string;
  projectId?: string;
  /** ISO string of when the job started (Agenda lockedAt). Survives page refresh. */
  startedAt?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-demi-demo',
  templateUrl: './demi-demo.component.html',
  styleUrl: './demi-demo.component.css',
  imports: [DatePipe, ExtractionProgressComponent, RouterLink],
  animations: [
    trigger('collapseAnimation', [
      state('expanded', style({ height: '*', opacity: 1, overflow: 'hidden' })),
      state('collapsed', style({ height: '0px', opacity: 0, overflow: 'hidden' })),
      transition('expanded <=> collapsed', animate('250ms cubic-bezier(0.4, 0, 0.2, 1)')),
    ])
  ]
})
export class DemiDemoComponent implements OnInit {
  private demiService = inject(DemiService);
  private docService = inject(DocumentService);
  private configService = inject(ConfigService);
  private keycloakService = inject(KeycloakService);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  phase = signal<ExtractionPhase>('idle');
  /** Required EPIC project ObjectId the uploaded document is filed under. */
  projectId = signal<string>('');
  /** docId of the Document created by the last submission. */
  docId = signal<string | null>(null);
  /** Fetched metadata for the active document. */
  documentMeta = signal<Document | null>(null);
  uploadProgress = signal(0);
  queuePosition = signal<number | null>(null);
  error = signal<string | null>(null);
  fileName = signal<string | null>(null);
  fileSize = signal<number | null>(null);
  taskMeta = signal<Record<string, unknown> | null>(null);
  jobProgress = signal<{ batch?: number; totalBatches?: number; done?: boolean } | null>(null);
  /** ISO timestamp from Agenda lockedAt — used to keep elapsed accurate across refreshes. */
  startedAt = signal<string | null>(null);
  /** Active job ID being polled — excluded from the list when in-flight. */
  activeJobId = signal<string | null>(null);
  /** All demi-extract jobs from GET /api/jobs, refreshed every 10s. */
  allJobs = signal<AgendaJob[]>([]);

  searchQuery = signal<string>('');
  searchResults = signal<any[]>([]);
  isSearching = signal(false);
  private searchSubject = new Subject<string>();

  isCollapsed = signal(false);

  resolvedDocumentType = computed(() => {
    const doc = this.documentMeta();
    if (!doc) return 'Not Categorized';
    
    // 1. Prioritize string label if returned by API
    if (doc.documentType && doc.documentType !== '-') return doc.documentType;

    // 2. Resolve ObjectId via lists
    const typeId = doc.type;
    if (!typeId) return 'Not Categorized';

    const lists = this.configService.listsSignal();

    const match = lists.find(item => {
      // Robust comparison — handle possible ObjectId strings
      const itemId = String(item._id);
      const targetId = String(typeId);
      return itemId === targetId || item.guid === targetId;
    });

    return match?.name || 'Not Categorized';
  });

  resolvedExtractedDate = computed(() => {
    const doc = this.documentMeta();
    if (!doc) return null;
    return doc.contentExtractedAt || doc.dateUploaded || doc.datePosted;
  });

  badgeLabel = computed(() => {
    switch (this.phase()) {
      case 'initializing': return 'Initializing...';
      case 'uploading':  return `Uploading ${this.uploadProgress()}%`;
      case 'queued':     return 'Queued';
      case 'processing': return 'Processing';
      case 'streaming':  return 'Finalizing';
      case 'done':       return 'Extraction Complete';
      default:           return '';
    }
  });

  badgeClass = computed(() => {
    switch (this.phase()) {
      case 'initializing': return 'text-bg-secondary';
      case 'uploading':  return 'text-bg-primary';
      case 'queued':     return 'text-bg-secondary';
      case 'processing': return 'text-bg-info';
      case 'streaming':  return 'text-bg-info';
      case 'done':       return 'text-bg-success';
      default:           return 'text-bg-secondary';
    }
  });

  /** Jobs other than the currently active one (avoids duplication with the card). */
  otherJobs = computed(() => {
    const active = this.activeJobId();
    return this.allJobs().filter(j => String(j.jobId) !== active);
  });

  busy = computed(() => {
    const p = this.phase();
    return p === 'uploading' || p === 'queued' || p === 'processing';
  });

  /** Active subscription (upload or polling). Replaced on each new file pick. */
  private sub: Subscription | null = null;

  constructor() {
    this.resumeFromStorage();
  }

  ngOnInit(): void {
    this.logger.debug('Current user:', 'DemiDemoComponent', {
      id: this.keycloakService.getId(),
      roles: this.keycloakService.getUserRoles()
    });
    this.configService.ensureListsLoaded();
    this.refreshJobList();
    // Refresh list every 10s so running/queued jobs update without page reload.
    interval(10_000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshJobList());

    this.searchSubject.pipe(
      tap(query => {
        this.searchQuery.set(query);
        if (query && this.docId()) {
          this.isSearching.set(true);
        } else {
          this.isSearching.set(false);
          this.searchResults.set([]);
        }
      }),
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(query => {
      const doc = this.docId();
      if (!query || !doc) return;

      this.demiService.searchDocument(doc, query).subscribe({
        next: (res) => {
          const hits = (res?.hits || []).map((hit: any) => {
            const raw = hit.highlights?.find((h: any) => h.field === 'content')?.value || hit.document?.content || '';
            return {
              ...hit,
              snippet: sanitizeHighlight(raw)
            };
          });
          this.searchResults.set(hits);
          this.isSearching.set(false);
        },
        error: (err) => {
          this.logger.error('Search failed', 'DemiDemoComponent', err);
          this.searchResults.set([]);
          this.isSearching.set(false);
        }
      });
    });
  }

  onSearchInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.searchSubject.next(input);
  }

  private refreshJobList(): void {
    this.demiService.listJobs().subscribe({
      next: jobs => {
        this.logger.debug(`Loaded ${jobs.length} demi jobs`, 'DemiDemoComponent', jobs);
        this.allJobs.set(jobs);
      },
      error: (err) => this.logger.error('Failed to list jobs', 'DemiDemoComponent', err),
    });
  }

  /** Resume polling for a job that was in-flight when the user navigated away. */
  private resumeFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const { jobId, fileName, fileSize, startedAt, docId, projectId } = JSON.parse(raw) as PersistedJob;
      if (!jobId) return;
      this.activeJobId.set(String(jobId));
      this.fileName.set(fileName ?? null);
      this.fileSize.set(fileSize ?? null);
      this.startedAt.set(startedAt ?? null);
      this.docId.set(docId ?? null);
      this.projectId.set(projectId ?? '');
      
      this.phase.set('initializing');
      this.startPolling(jobId);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private saveJob(jobId: string, fileName: string, fileSize?: number, startedAt?: string, docId?: string, projectId?: string): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ 
      jobId, fileName, fileSize, startedAt, docId, projectId 
    } satisfies PersistedJob));
  }

  private clearJob(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  private cancel(): void {
    this.sub?.unsubscribe();
    this.sub = null;
  }

  onProjectInput(event: Event): void {
    this.projectId.set((event.target as HTMLInputElement).value.trim());
  }

  /** A valid-looking Mongo ObjectId is required before upload. */
  projectValid = computed(() => /^[a-f0-9]{24}$/i.test(this.projectId()));

  viewJob(job: AgendaJob): void {
    if (job.status !== 'completed') return;
    this.cancel();
    this.error.set(null);
    this.fileName.set(job.originalFilename ?? null);
    this.fileSize.set(job.fileSize ?? null);
    this.docId.set(job.docId ?? null);
    this.projectId.set(job.projectId ?? '');
    this.activeJobId.set(job.jobId);
    this.phase.set('done');
    this.fetchDocumentMeta();
  }

  private fetchDocumentMeta(): void {
    const id = this.docId();
    if (!id) return;
    this.docService.getById(id).subscribe({
      next: (doc) => this.documentMeta.set(doc),
      error: (err) => this.logger.error('Failed to fetch document metadata', 'DemiDemoComponent', err)
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;

    if (!this.projectValid()) {
      this.error.set('Enter a valid project id (24-character hex) before uploading.');
      input.value = '';
      return;
    }

    this.cancel();
    this.clearJob();

    this.fileName.set(file.name);
    this.fileSize.set(file.size);
    this.taskMeta.set(null);
    this.startedAt.set(null);
    this.error.set(null);
    this.uploadProgress.set(0);
    this.queuePosition.set(null);
    this.phase.set('uploading');

    // Phase 1: Upload file — track byte progress, get jobId from response.
    this.sub = this.demiService.submitExtraction(file, this.projectId()).subscribe({
      next: (httpEvent) => {
        if (httpEvent.type === HttpEventType.UploadProgress) {
          const pct = httpEvent.total
            ? Math.round((httpEvent.loaded / httpEvent.total) * 100)
            : 0;
          this.uploadProgress.set(pct);
          if (httpEvent.loaded === httpEvent.total) {
            // Bytes delivered — server is forwarding to docling queue
            this.phase.set('queued');
          }
        } else if (httpEvent.type === HttpEventType.Response) {
          const jobId = httpEvent.body?.jobId;
          const docId = httpEvent.body?.docId;
          const projId = this.projectId();
          
          this.docId.set(docId ?? null);
          if (jobId) {
            this.activeJobId.set(String(jobId));
            this.saveJob(jobId, file.name, file.size, undefined, docId, projId);
            this.phase.set('queued');
            this.startPolling(jobId);
          } else {
            this.error.set('No job ID returned from extraction service.');
            this.phase.set('idle');
          }
        }
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || `Upload failed (${err?.status ?? 'unknown'})`;
        this.error.set(msg);
        this.phase.set('idle');
        this.uploadProgress.set(0);
        this.sub = null;
      },
    });
  }

  /** Phase 2: Poll every 2.5s until done. */
  private startPolling(jobId: string): void {
    this.sub = timer(0, 2500).pipe(
      switchMap(() => this.demiService.pollJob(jobId)),
      retry(3),
    ).subscribe({
      next: (result) => {
        this.taskMeta.set(result.taskMeta ?? null);
        this.jobProgress.set(result.progress ?? null);
        if (result.docId) this.docId.set(result.docId);
        if (result.projectId) this.projectId.set(result.projectId);
        
        if (result.status === 'pending') {
          this.phase.set('queued');
          this.queuePosition.set(result.queuePosition);
        } else if (result.status === 'started') {
          this.phase.set('processing');
          this.queuePosition.set(null);
          if (result.startedAt && !this.startedAt()) {
            this.startedAt.set(result.startedAt);
            this.saveJob(jobId, this.fileName()!, this.fileSize() ?? undefined, result.startedAt, this.docId()!, this.projectId());
          }
        } else if (result.status === 'success') {
          this.cancel();
          // Keep activeJobId set so the success card shows the results
          this.phase.set('done');
          this.fetchDocumentMeta();
          this.refreshJobList();
        } else if (result.status === 'failure') {
          this.clearJob();
          this.activeJobId.set(null);
          this.refreshJobList();
          const reason = result.error ?? 'The document may be corrupted, password-protected, or too complex.';
          this.error.set(`Extraction failed: ${reason}`);
          this.phase.set('idle');
          this.cancel();
        }
      },
      error: (err) => {
        const msg = err?.error?.message || err?.message || `Polling failed (${err?.status ?? 'unknown'})`;
        this.error.set(msg);
        this.phase.set('idle');
        this.sub = null;
      },
    });
  }

  onDownloadJob(job: AgendaJob): void {
    if (!job.hasResult) return;
    this.triggerDownload(this.demiService.downloadMarkdown(job.jobId), job.filename || `${job.jobId}.md`);
  }

  onDownloadActiveJob(): void {
    const jobId = this.activeJobId();
    if (!jobId) return;
    this.triggerDownload(this.demiService.downloadMarkdown(jobId), `${this.fileName() || jobId}.md`);
  }

  onDownloadOriginal(job: AgendaJob | null): void {
    const docId = job ? job.docId : this.docId();
    const filename = job ? job.originalFilename : this.fileName();
    if (!docId || !filename) return;

    this.triggerDownload(this.demiService.downloadOriginalDocument(docId, filename), filename);
  }

  /**
   * Helper to trigger a browser file download from an observable.
   */
  private triggerDownload(downloadObs: Observable<Blob | string>, filename: string): void {
    downloadObs.subscribe({
      next: (data) => {
        const blob = typeof data === 'string' ? new Blob([data], { type: 'text/markdown; charset=utf-8' }) : data;
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        document.body.appendChild(a);
        a.style.display = 'none';
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      },
      error: (err) => {
        let errorBody = err?.error;
        if (typeof errorBody === 'string') {
          try {
            errorBody = JSON.parse(errorBody);
          } catch { /* not JSON */ }
        }
        const msg = errorBody?.message || err?.message || `Download failed (${err?.status ?? 'unknown'})`;
        this.error.set(msg);
      },
    });
  }
}
