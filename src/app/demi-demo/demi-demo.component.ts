import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, signal, computed, inject } from '@angular/core';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { interval, Subject, Subscription, switchMap, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { RouterLink } from '@angular/router';
import { DemiService, AgendaJob } from '../services/demi.service';
import { ExtractionProgressComponent, ExtractionPhase } from '../shared/extraction-progress/extraction-progress.component';

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
  imports: [DatePipe, DecimalPipe, ExtractionProgressComponent, RouterLink, SlicePipe],
})
export class DemiDemoComponent implements OnInit {
  private demiService = inject(DemiService);
  private destroyRef = inject(DestroyRef);

  phase = signal<ExtractionPhase>('idle');
  /** Required EPIC project ObjectId the uploaded document is filed under. */
  projectId = signal<string>('');
  /** docId of the Document created by the last submission. */
  docId = signal<string | null>(null);
  uploadProgress = signal(0);
  queuePosition = signal<number | null>(null);
  error = signal<string | null>(null);
  markdown = signal<string | null>(null);
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
  private searchSubject = new Subject<string>();

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
  /** Emitting stops the polling interval. */
  private stopPolling$ = new Subject<void>();
  /** Stops the background job-list refresh loop. */
  private stopRefresh$ = new Subject<void>();

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.cancel();
      this.stopRefresh$.next();
    });
    this.resumeFromStorage();
  }

  ngOnInit(): void {
    this.refreshJobList();
    // Refresh list every 10s so running/queued jobs update without page reload.
    interval(10_000)
      .pipe(takeUntil(this.stopRefresh$))
      .subscribe(() => this.refreshJobList());

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.stopRefresh$)
    ).subscribe(query => {
      this.searchQuery.set(query);
      const doc = this.docId();
      if (!query || !doc) {
        this.searchResults.set([]);
        return;
      }
      this.demiService.searchDocument(doc, query).subscribe({
        next: (res) => {
          this.searchResults.set(res?.hits || []);
        },
        error: (err) => {
          console.error('Search failed', err);
          this.searchResults.set([]);
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
      next: jobs => this.allJobs.set(jobs),
      error: () => { /* silently ignore — list is best-effort */ },
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
      
      // Skip 'queued' if we know the job was already running — avoids 'Waiting for worker' flash
      this.phase.set(startedAt ? 'processing' : 'queued');
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
    this.stopPolling$.next();
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
    this.markdown.set(null);
    this.fileName.set(job.originalFilename ?? null);
    this.fileSize.set(job.fileSize ?? null);
    this.docId.set(job.docId ?? null);
    this.projectId.set(job.projectId ?? '');
    this.activeJobId.set(job.jobId);
    this.phase.set('done');
    this.fetchMarkdown(job.jobId);
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
    this.markdown.set(null);
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

  /** Phase 2: Poll every 2.5s until done, then fetch markdown. */
  private startPolling(jobId: string): void {
    this.sub = interval(2500).pipe(
      switchMap(() => this.demiService.pollJob(jobId)),
      takeUntil(this.stopPolling$),
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
          this.stopPolling$.next();
          // Keep activeJobId set so the success card shows the results
          this.phase.set('streaming');
          this.fetchMarkdown(jobId);
          this.sub = null;
        } else if (result.status === 'failure') {
          this.clearJob();
          this.activeJobId.set(null);
          this.refreshJobList();
          const reason = result.error ?? 'The document may be corrupted, password-protected, or too complex.';
          this.error.set(`Extraction failed: ${reason}`);
          this.phase.set('idle');
          this.stopPolling$.next();
          this.sub = null;
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

  private fetchMarkdown(jobId: string): void {
    this.demiService.downloadMarkdown(jobId).subscribe({
      next: (text) => {
        this.markdown.set(text || '(No text extracted)');
        this.phase.set('done');
        this.refreshJobList();
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
        this.phase.set('idle');
      },
    });
  }

  onDownloadJob(job: AgendaJob): void {
    if (!job.hasResult) return;
    this.executeDownload(job.jobId, job.filename || `${job.jobId}.md`);
  }

  onDownloadActiveJob(): void {
    const jobId = this.activeJobId();
    if (!jobId) return;
    this.executeDownload(jobId, `${this.fileName() || jobId}.md`);
  }

  onDownloadOriginal(job: AgendaJob | null): void {
    const docId = job ? job.docId : this.docId();
    const filename = job ? job.originalFilename : this.fileName();
    if (!docId || !filename) return;

    this.demiService.downloadOriginalDocument(docId, filename).subscribe({
      next: (blob) => {
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

  private executeDownload(jobId: string, filename: string): void {
    this.demiService.downloadMarkdown(jobId).subscribe({
      next: (text) => {
        const blob = new Blob([text], { type: 'text/markdown; charset=utf-8' });
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
