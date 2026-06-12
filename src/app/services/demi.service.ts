import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api';

export interface DemiJobStatus {
  status: 'pending' | 'started' | 'success' | 'failure';
  queuePosition: number | null;
  taskMeta?: Record<string, unknown> | null;
  fileSize?: number | null;
  originalFilename?: string | null;
  /** Agenda failReason — present when status is 'failure'. */
  error?: string | null;
  /** ISO timestamp of when the job started processing (a.lockedAt from Agenda). */
  startedAt?: string | null;
  progress?: {
    batch?: number;
    totalBatches?: number;
    done?: boolean;
  } | null;
}

/** Shape returned by GET /api/jobs and GET /api/jobs/:jobId */
export interface AgendaJob {
  jobId: string;
  type: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  requestedBy?: string;
  createdAt?: string;
  startedAt?: string | null;
  completedAt?: string | null;
  progress?: {
    doclingStatus?: string;
    queuePosition?: number | null;
    taskMeta?: Record<string, unknown> | null;
    batch?: number;
    totalBatches?: number;
    done?: boolean;
  } | null;
  hasResult: boolean;
  docId?: string;
  projectId?: string;
  originalFilename?: string;
  filename?: string;
  fileSize?: number;
  error?: string | null;
}

@Injectable({ providedIn: 'root' })
export class DemiService {
  private api = inject(ApiService);
  private http = inject(HttpClient);

  /**
   * Submit a file for DEMI intake + extraction.
   * Uploads the file to MinIO, creates a staff-only Document under `projectId`,
   * and queues extraction. Returns an HttpEvent stream for upload progress.
   * Response event body is { jobId, docId } — pass jobId to pollJob().
   */
  submitExtraction(file: File, projectId: string): Observable<HttpEvent<{ jobId: string; docId: string }>> {
    const formData = new FormData();
    formData.append('upfile', file);
    formData.append('project', projectId);
    const req = new HttpRequest<FormData>(
      'POST',
      `${this.api.pathAPI}/demi/extract`,
      formData,
      { reportProgress: true }
    );
    return this.http.request<{ jobId: string; docId: string }>(req);
  }

  /**
   * Poll extraction job status via the universal /api/jobs endpoint.
   * Maps Agenda job shape → DemiJobStatus for component consumption.
   * Call on an interval until status is 'success' or 'failure'.
   */
  pollJob(jobId: string): Observable<DemiJobStatus> {
    return this.http.get<AgendaJob>(`${this.api.pathAPI}/jobs/${jobId}`).pipe(
      map(job => {
        const doclingStatus = job.progress?.doclingStatus;
        // Map Agenda status + docling status → DemiJobStatus.status
        let status: DemiJobStatus['status'];
        if (job.status === 'failed' || doclingStatus === 'failure') {
          status = 'failure';
        } else if (job.status === 'completed' || doclingStatus === 'success') {
          status = 'success';
        } else if (job.status === 'running' || doclingStatus === 'started') {
          status = 'started';
        } else {
          status = 'pending';
        }
        return {
          status,
          queuePosition:    job.progress?.queuePosition ?? null,
          taskMeta:         job.progress?.taskMeta ?? null,
          fileSize:         job.fileSize ?? null,
          originalFilename: job.originalFilename ?? null,
          error:            job.error ?? null,
          startedAt:        job.startedAt ?? null,
          progress:         job.progress ?? null,
        };
      })
    );
  }

  /**
   * Search within a specific document using the Typesense proxy.
   */
  searchDocument(docId: string, query: string): Observable<any> {
    const params = new HttpParams()
      .set('q', query)
      .set('query_by', 'content')
      .set('filter_by', `documentId:=${docId}`);
    return this.http.get(`${this.api.pathAPI}/typesense/collections/document_chunks/documents/search`, { params });
  }

  /**
   * Download the extracted markdown for a completed job.
   * Returns the raw text/markdown content.
   */
  downloadMarkdown(jobId: string): Observable<string> {
    return this.http.get(`${this.api.pathAPI}/jobs/${jobId}/download`, { responseType: 'text' });
  }

  /**
   * Download the original source document from MinIO.
   * Returns a Blob.
   */
  downloadOriginalDocument(docId: string, filename: string): Observable<Blob> {
    const encodedFilename = encodeURIComponent(filename).replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\\/g, '%5C').replace(/\//g, '%2F').replace(/\'/g, '%27');
    return this.http.get(`${this.api.pathAPI}/document/${docId}/fetch/${encodedFilename}`, { responseType: 'blob' });
  }

  /**
   * List recent demi-extract jobs (sysadmin: all users; others: own only).
   * API returns up to 20 most recent jobs across all types; we filter client-side.
   */
  listJobs(): Observable<AgendaJob[]> {
    return this.http
      .get<AgendaJob[]>(`${this.api.pathAPI}/jobs`)
      .pipe(map(jobs => jobs.filter(j => j.type === 'demi-extract')));
  }
}
