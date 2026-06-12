import { Component, ChangeDetectionStrategy, DestroyRef, OnInit, effect, inject, input, computed, signal } from '@angular/core';

/**
 * Extraction phase states:
 *  idle       — not started or complete; component is hidden
 *  uploading  — file bytes transferring to server (deterministic %)
 *  queued     — file received; waiting in docling-serve queue (indeterminate)
 *  processing — docling actively extracting (indeterminate)
 *  streaming  — future: server streams per-page/per-chunk progress (deterministic %)
 *  done       — extraction complete; component is hidden
 */
export type ExtractionPhase = 'idle' | 'uploading' | 'queued' | 'processing' | 'streaming' | 'done';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-extraction-progress',
  templateUrl: './extraction-progress.component.html',
})
export class ExtractionProgressComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  /** Current phase of the extraction pipeline. */
  phase = input<ExtractionPhase>('idle');

  /**
   * Progress percentage (0–100).
   * Used in 'uploading' phase (HTTP upload bytes).
   */
  progress = input<number>(0);

  /** Queue position reported during the 'queued' phase. null = unknown. */
  queuePosition = input<number | null>(null);

  /** Optional label override for the 'streaming' phase. */
  streamLabel = input<string | null>(null);

  /** File name shown in the job card. */
  fileName = input<string | null>(null);

  /** File size in bytes shown in the job card. */
  fileSize = input<number | null>(null);

  /** Raw task meta from docling (RQ engine); may contain page-level progress. */
  taskMeta = input<Record<string, unknown> | null>(null);

  /** Progress details from backend (batch processing). */
  jobProgress = input<{ batch?: number; totalBatches?: number; done?: boolean } | null>(null);

  /**
   * ISO timestamp of when the job started processing (Agenda lockedAt).
   * Passed from localStorage so elapsed survives page refresh.
   */
  jobStartedAt = input<string | null>(null);

  /** Seconds elapsed since the job started (or since phase became active). */
  protected elapsed = signal(0);
  private phaseStart = 0;
  private timerId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    effect(() => {
      const p = this.phase();
      if (p === 'idle' || p === 'done') {
        this.stopTimer();
      } else {
        this.startTimer();
      }
    });
  }

  protected isVisible = computed(() => {
    const p = this.phase();
    return p !== 'idle' && p !== 'done';
  });

  protected isDeterminate = computed(() => {
    const p = this.phase();
    if (p === 'uploading') return this.progress() < 100;
    if (p === 'processing') return !!this.jobProgress()?.totalBatches;
    return false;
  });

  protected currentProgress = computed(() => {
    const p = this.phase();
    if (p === 'uploading') return this.progress();
    if (p === 'processing') {
      const jp = this.jobProgress();
      if (jp && jp.totalBatches && jp.batch) {
        return Math.round((jp.batch / jp.totalBatches) * 100);
      }
    }
    return 0;
  });

  /** Material Icon name based on file extension. */
  protected fileIcon = computed(() => {
    const name = (this.fileName() ?? '').toLowerCase();
    if (name.endsWith('.pdf'))                               return 'picture_as_pdf';
    if (name.endsWith('.docx') || name.endsWith('.doc'))    return 'article';
    if (name.endsWith('.pptx') || name.endsWith('.ppt'))    return 'slideshow';
    if (name.endsWith('.xlsx') || name.endsWith('.xls'))    return 'table_chart';
    return 'insert_drive_file';
  });

  protected displayName = computed(() => this.fileName() ?? 'Document');

  protected formattedSize = computed(() => {
    const b = this.fileSize();
    if (!b) return null;
    if (b < 1_024)           return `${b} B`;
    if (b < 1_048_576)       return `${(b / 1_024).toFixed(1)} KB`;
    if (b < 1_073_741_824)   return `${(b / 1_048_576).toFixed(1)} MB`;
    return `${(b / 1_073_741_824).toFixed(2)} GB`;
  });

  protected elapsedLabel = computed(() => {
    const s = this.elapsed();
    if (s < 60)   return `${s}s`;
    if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`;
    return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`;
  });

  /** Bootstrap colour utility class for the status badge. */
  protected badgeClass = computed(() => {
    switch (this.phase()) {
      case 'uploading':  return 'text-bg-primary';
      case 'queued':     return 'text-bg-secondary';
      case 'processing': return 'text-bg-info';
      case 'streaming':  return 'text-bg-info';
      default:           return 'text-bg-secondary';
    }
  });

  protected badgeLabel = computed(() => {
    switch (this.phase()) {
      case 'uploading':  return `Uploading ${this.progress()}%`;
      case 'queued':     return 'Queued';
      case 'processing': return 'Processing';
      case 'streaming':  return 'Finalizing';
      default:           return '';
    }
  });

  /** Detail line shown under the progress bar. */
  protected stageLabel = computed(() => {
    const q    = this.queuePosition();
    const meta = this.taskMeta();

    switch (this.phase()) {
      case 'uploading':
        return this.progress() >= 100
          ? 'Upload complete — submitting to queue…'
          : 'Sending file to server…';
      case 'queued':
        return q != null
          ? `Waiting in queue · Position ${q + 1}`
          : 'Waiting for a worker to become available…';
      case 'processing': {
        const jp = this.jobProgress();
        if (jp && jp.totalBatches && jp.batch) {
          const pct = Math.round((jp.batch / jp.totalBatches) * 100);
          return `Processing batch ${jp.batch} of ${jp.totalBatches} (${pct}%)`;
        }

        // docling TaskProcessingMeta: num_docs, num_processed, num_succeeded, num_failed
        // NOTE: In RQ mode with a single document, num_docs stays 0 until the entire
        // document finishes. It is NOT a page counter. Use elapsed to infer pipeline stage.
        const numFailed    = meta?.['num_failed']    as number | undefined;
        const numProcessed = meta?.['num_processed'] as number | undefined;
        const numDocs      = meta?.['num_docs']      as number | undefined;
        if (numFailed && numFailed > 0) {
          return `Warning: ${numFailed} page(s) failed · ${numProcessed ?? 0} of ${numDocs ?? '?'} processed`;
        }
        // Multi-doc batch: num_docs > 1 means we have real document-level counters.
        if (numDocs != null && numDocs > 1) {
          const done = numProcessed ?? 0;
          const pct  = Math.round((done / numDocs) * 100);
          return `Extracting document ${done} of ${numDocs} (${pct}%)`;
        }
        // Single document (RQ mode): num_docs=0 throughout — use elapsed to infer stage.
        const secs = this.elapsed();
        if (secs < 120) return 'Loading models\u2026 (first-run may take 1\u20132 min)';
        return 'Extracting document text\u2026';
      }
      case 'streaming':
        return this.streamLabel() ?? 'Finalizing results…';
      default:
        return '';
    }
  });

  ngOnInit(): void {
    this.destroyRef.onDestroy(() => this.stopTimer());
  }

  private startTimer(): void {
    this.stopTimer();
    this.phaseStart = Date.now();
    // Use jobStartedAt as the elapsed base when available — keeps time accurate across refreshes.
    const base = () => {
      const s = this.jobStartedAt();
      return s ? new Date(s).getTime() : this.phaseStart;
    };
    this.elapsed.set(Math.floor((Date.now() - base()) / 1000));
    this.timerId = setInterval(() => {
      this.elapsed.set(Math.floor((Date.now() - base()) / 1000));
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
