import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as _ from 'lodash';

import { ApiService } from './api';
import { DocumentService } from './document.service';
import { flatMap, mergeMap } from 'rxjs/operators';
import { of, forkJoin } from 'rxjs';

import { Comment } from '../models/comment';

@Injectable()
export class CommentService {

  public pendingCommentCount = 0;
  public nextCommentId = null;

  constructor(
    private api: ApiService,
    private documentService: DocumentService
  ) { }


  // get count of comments for the specified comment period id
  getCountByPeriodId(periodId: string): Observable<number> {
    return this.api.getCountCommentsByPeriodId(periodId)
      .catch(error => this.api.handleError(error));
  }

  getById(commentId: string, populateNextComment = false): Observable<Comment> {
    return this.api.getComment(commentId, populateNextComment)
      .pipe(
        flatMap(res => {
          this.pendingCommentCount = res.headers.get('x-pending-comment-count');
          this.nextCommentId = res.headers.get('x-next-comment-id');

          const comments = res.body;
          if (!comments || comments.length === 0) {
            return of(null as Comment);
          }
          // Safety check for null documents or an empty array of documents.
          if (comments[0].documents === null || comments[0].documents && comments[0].documents.length === 0) {
            return of(new Comment(comments[0]));
          }
          // now get the rest of the data for this project
          return this._getExtraAppData(new Comment(comments[0]));
        })
      )
      .catch(error => this.api.handleError(error));
  }

  add(comment: Comment, documentForms: Array<FormData> = []): Observable<Comment> {
    if (documentForms.length > 0) {
      let observables = [];
      observables = documentForms.map(documentForm => {
        return this.documentService.add(documentForm);
      });
      return forkJoin(observables)
        .pipe(
          mergeMap(payload => {
            payload.map((document: any) => {
              comment.documents.push(document._id);
            });
            return this.api.addComment(comment);
          })
        );
    } else {
      return this.api.addComment(comment)
        .catch(error => this.api.handleError(error));
    }
  }

  save(comment: Comment): Observable<Comment> {
    if (comment.documentsList && comment.documentsList.length > 0) {
      // Update documents publish status.
      const observables = [];
      comment.documentsList.map(document => {
        if (document.eaoStatus === 'Published') {
          observables.push(this.documentService.publish(document._id));
        } else if (document.eaoStatus === 'Rejected') {
          observables.push(this.documentService.unPublish(document._id));
        }
      });
      comment.documentsList = null;
      const newComment = _.cloneDeep(comment);
      observables.push(this.api.saveComment(newComment));
      return forkJoin(observables)
        .pipe(
          flatMap((payloads: any) => {
            return of(payloads.pop());
          })
        );

    } else {
      // So we don't send this to API.
      comment.documentsList = null;

      // make a (deep) copy of the passed-in comment so we don't change it
      const newComment = _.cloneDeep(comment);

      return this.api.saveComment(newComment)
        .catch(error => this.api.handleError(error));
    }
  }

  publish(comment: Comment): Observable<Comment> {
    return this.api.updateCommentStatus(comment, 'Published')
      .catch(error => this.api.handleError(error));
  }

  defer(comment: Comment): Observable<Comment> {
    return this.api.updateCommentStatus(comment, 'Deferred')
      .catch(error => this.api.handleError(error));
  }

  reject(comment: Comment): Observable<Comment> {
    return this.api.updateCommentStatus(comment, 'Rejected')
      .catch(error => this.api.handleError(error));
  }

  removeStatus(comment: Comment): Observable<Comment> {
    return this.api.updateCommentStatus(comment, 'Reset')
      .catch(error => this.api.handleError(error));
  }

  // get all comments for the specified comment period id
  getByPeriodId(periodId: string, pageNum: number = null, pageSize: number = null, sortBy = '', count = true, filter: Object = {}): Observable<Object> {
    return this.api.getCommentsByPeriodId(periodId, pageNum, pageSize, sortBy, count, filter)
      .map((res: any) => {
        if (res) {
          const comments: Array<Comment> = [];
          if (!res || res.length === 0) {
            return { totalCount: 0, data: [] };
          }
          res[0].results.forEach(c => {
            comments.push(new Comment(c));
          });
          return { totalCount: res[0].total_items, data: comments };
        }
        return {};
      })
      .catch(error => this.api.handleError(error));
  }

  private _getExtraAppData(comment: Comment): Observable<Comment> {
    return forkJoin(
      this.documentService.getByMultiId(comment.documents)
    ).map(payloads => {
      comment.documentsList = payloads[0];
      return comment;
    });
  }
}
