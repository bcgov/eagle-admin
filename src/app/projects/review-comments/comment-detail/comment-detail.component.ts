import { Component, OnChanges, OnDestroy, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/toPromise';

import { Comment } from 'app/models/comment';
import { ApiService } from 'app/services/api';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';

interface SaveParameters {
  doPublish?: boolean;
  doUnpublish?: boolean;
}

@Component({
  selector: 'app-comment-detail',
  templateUrl: './comment-detail.component.html',
  styleUrls: ['./comment-detail.component.scss']
})

export class CommentDetailComponent implements OnChanges, OnDestroy {
  @Input() comment: Comment;
  @Output() commentChange = new EventEmitter<Comment>();

  public internalNotes: string; // working version
  public networkMsg: string;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    public api: ApiService, // used in template
    private commentService: CommentService,
    private documentService: DocumentService
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    // console.log('changes.comment =', changes.comment);

    // guard against null comment
    if (changes.comment.currentValue) {
      // save copy of notes for possible reset
      this.internalNotes = this.comment.review.reviewerNotes;
    }
  }

  private doAccept(comment: Comment) {
    if (!this.commentService.isAccepted(comment)) {
      this.commentService.doAccept(comment);
      this.save({ doPublish: true });
    }
  }

  private doPending(comment: Comment) {
    if (!this.commentService.isPending(comment)) {
      this.commentService.doPending(comment);
      this.save({ doUnpublish: true });
    }
  }

  private doReject(comment: Comment) {
    if (!this.commentService.isRejected(comment)) {
      this.commentService.doReject(comment);
      this.save({ doUnpublish: true });
    }
  }

  private saveNotes() {
    if (!this.isNotesPristine()) {
      this.comment.review.reviewerNotes = this.internalNotes;
      this.save({});
    }
  }

  private isNotesPristine(): boolean {
    // TODO: debounce this?
    // ref: https://stackoverflow.com/questions/32051273/angular-and-debounce
    // ref: https://ng-bootstrap.github.io/#/components/typeahead/examples
    return (this.comment.review.reviewerNotes === this.internalNotes);
  }

  private resetNotes() {
    this.internalNotes = this.comment.review.reviewerNotes;
  }

  private save({ doPublish = false, doUnpublish = false }: SaveParameters) {
    this.comment.review.reviewerDate = new Date();

    this.networkMsg = null;
    this.commentService.save(this.comment)
      .takeUntil(this.ngUnsubscribe)
      .toPromise()
      .then(
        () => {
          // save succeeded
          // don't bother reloading comment
        },
        reason => this.networkMsg += reason
      )
      .then(
        () => {
          if (doPublish && !this.comment.isPublished) {
            // publish comment
            this.commentService.publish(this.comment)
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
                () => {
                  // publish succeeded
                  this.comment.isPublished = true;
                },
                error => console.log('publish error =', error)
              );
            // publish comment documents
            this.comment.documents.forEach(document =>
              this.documentService.publish(document)
                .takeUntil(this.ngUnsubscribe)
                .subscribe(
                  () => {
                    // publish succeeded
                    document.isPublished = true;
                  },
                  error => console.log('publish error =', error)
                )
            );
          }
          if (doUnpublish && this.comment.isPublished) {
            // unpublish comment
            this.commentService.unPublish(this.comment)
              .takeUntil(this.ngUnsubscribe)
              .subscribe(
                () => {
                  // unpublish succeeded
                  this.comment.isPublished = false;
                },
                error => console.log('unpublish error =', error)
              );
            // unpublish comment documents
            this.comment.documents.forEach(document =>
              this.documentService.unPublish(document)
                .takeUntil(this.ngUnsubscribe)
                .subscribe(
                  () => {
                    // unpublish succeeded
                    document.isPublished = false;
                  },
                  error => console.log('unpublish error =', error)
                )
            );
          }
        },
        reason => this.networkMsg += reason
      )
      .then(
        () => {
          // update parent component
          this.commentChange.emit(this.comment);
        },
        reason => this.networkMsg += reason
      )
      .catch(reason => {
        this.networkMsg += reason;
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
