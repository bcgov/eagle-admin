import { Injectable, inject } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { mergeMap, map, catchError } from 'rxjs/operators';

import { ApiService } from './api';
import { DocumentService } from './document.service';
import { LoadingStateService } from './loading-state.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { withLoading } from 'src/app/shared/utils/rxjs-operators';

import { Comment } from '../models/comment';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private api = inject(ApiService);
  private documentService = inject(DocumentService);
  private loadingState = inject(LoadingStateService);
  private toast = inject(ToastService);
  private logger = inject(LoggingService);

  public pendingCommentCount = 0;
  public nextCommentId = null;

  private readonly commentFields = [
    '_id', 'author', 'comment', 'commentId', 'dateAdded', 'dateUpdated',
    'documents', 'isAnonymous', 'location', 'eaoStatus', 'submittedCAC', 'period', 'read'
  ];

  private readonly commentDetailFields = [
    '_id', 'author', 'comment', 'commentId', 'dateAdded', 'datePosted', 'dateUpdated',
    'documents', 'eaoNotes', 'eaoStatus', 'submittedCAC', 'isAnonymous', 'location',
    'period', 'proponentNotes', 'proponentStatus', 'publishedNotes', 'rejectedNotes',
    'rejectedReason', 'read', 'write', 'delete'
  ];

  getCountByPeriodId(periodId: string): Observable<number> {
    const qs = `comment?isDeleted=false&commentStatus='Pending'&_commentPeriod=${periodId}`;
    return this.api.head(qs, { observe: 'response' }).pipe(
      withLoading(this.loadingState, `comment-count-${periodId}`),
      map((res: any) => parseInt(res.headers.get('x-total-count'), 10)),
      catchError(error => {
        this.logger.error(`Failed to get comment count for period ${periodId}`, 'CommentService', error);
        this.toast.error('Failed to load comment count.');
        return of(0);
      })
    );
  }

  getById(commentId: string, populateNextComment = false): Observable<Comment> {
    let qs = `comment/${commentId}?fields=${this.api.buildValues(this.commentDetailFields)}`;
    if (populateNextComment) { qs += '&populateNextComment=true'; }
    return this.api.get<any>(qs, { observe: 'response' }).pipe(
      withLoading(this.loadingState, `comment-${commentId}`),
      mergeMap((res: any) => {
        this.pendingCommentCount = res.headers.get('x-pending-comment-count');
        this.nextCommentId = res.headers.get('x-next-comment-id');
        const comments = res.body;
        if (!comments || comments.length === 0) {
          return of(null as Comment);
        }
        if (comments[0].documents === null || comments[0].documents && comments[0].documents.length === 0) {
          return of(new Comment(comments[0]));
        }
        return this._getExtraAppData(new Comment(comments[0]));
      }),
      catchError(error => {
        this.logger.error(`Failed to get comment ${commentId}`, 'CommentService', error);
        this.toast.error('Failed to load comment.');
        return of(null as Comment);
      })
    );
  }

  add(comment: Comment, documentForms: Array<FormData> = []): Observable<Comment> {
    if (documentForms.length > 0) {
      const observables = documentForms.map(form => this.documentService.add(form));
      return forkJoin(observables).pipe(
        mergeMap((payload: any[]) => {
          payload.map((document: any) => comment.documents.push(document._id));
          return this.api.post<Comment>('comment/', comment);
        }),
        catchError(error => this.api.handleError(error))
      );
    } else {
      return this.api.post<Comment>('comment/', comment).pipe(
        catchError(error => this.api.handleError(error))
      );
    }
  }

  save(comment: Comment): Observable<Comment> {
    if (comment.documentsList && comment.documentsList.length > 0) {
      const observables = [];
      comment.documentsList.map(document => {
        if (document.eaoStatus === 'Published') {
          observables.push(this.documentService.publish(document._id));
        } else if (document.eaoStatus === 'Rejected') {
          observables.push(this.documentService.unPublish(document._id));
        }
      });
      comment.documentsList = null;
      const newComment = JSON.parse(JSON.stringify(comment));
      observables.push(this.api.put<Comment>(`comment/${newComment._id}`, newComment));
      return forkJoin(observables).pipe(
        mergeMap((payloads: any) => of(payloads.pop())),
        catchError(error => this.api.handleError(error))
      );
    } else {
      comment.documentsList = null;
      const newComment = JSON.parse(JSON.stringify(comment));
      return this.api.put<Comment>(`comment/${newComment._id}`, newComment).pipe(
        catchError(error => this.api.handleError(error))
      );
    }
  }

  publish(comment: Comment): Observable<Comment> {
    return this.api.put<Comment>(`comment/${comment._id}/status`, { status: 'Published' }).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  defer(comment: Comment): Observable<Comment> {
    return this.api.put<Comment>(`comment/${comment._id}/status`, { status: 'Deferred' }).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  reject(comment: Comment): Observable<Comment> {
    return this.api.put<Comment>(`comment/${comment._id}/status`, { status: 'Rejected' }).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  removeStatus(comment: Comment): Observable<Comment> {
    return this.api.put<Comment>(`comment/${comment._id}/status`, { status: 'Reset' }).pipe(
      catchError(error => this.api.handleError(error))
    );
  }

  getByPeriodId(periodId: string, pageNum: number = null, pageSize: number = null, sortBy = '', count = true, filter: object = {}): Observable<object> {
    let qs = `comment?&period=${periodId}`;
    if (pageNum !== null) { qs += `&pageNum=${pageNum - 1}`; }
    if (pageSize !== null) { qs += `&pageSize=${pageSize}`; }
    if (sortBy !== '' && sortBy !== null) { qs += `&sortBy=${sortBy}`; }
    if (count !== null) { qs += `&count=${count}`; }
    Object.keys(filter).forEach(key => { qs += `&${key}=${filter[key]}`; });
    qs += `&fields=${this.api.buildValues(this.commentFields)}`;
    return this.api.get<any>(qs).pipe(
      withLoading(this.loadingState, `comments-by-period-${periodId}`),
      map((res: any) => {
        if (!res || res.length === 0) { return { totalCount: 0, data: [] }; }
        const comments = res[0].results.map((c: any) => new Comment(c));
        return { totalCount: res[0].total_items, data: comments };
      }),
      catchError(error => this.api.handleError(error))
    );
  }

  private _getExtraAppData(comment: Comment): Observable<Comment> {
    return forkJoin(
      this.documentService.getByMultiId(comment.documents)
    ).pipe(
      map(payloads => {
        comment.documentsList = payloads[0];
        return comment;
      })
    );
  }
}

