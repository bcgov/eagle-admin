import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';

import { ApiService } from 'app/services/api';
import { CommentService } from 'app/services/comment.service';
import { StorageService } from 'app/services/storage.service';

import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentPeriod';
import { Document } from 'app/models/document';

import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-review-comment',
  templateUrl: './review-comment.component.html',
  styleUrls: ['./review-comment.component.scss']
})

export class ReviewCommentComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public currentProject;
  public baseRouteUrl: string;
  public comment: Comment;
  public commentPeriod: CommentPeriod;
  public loading = true;
  public isRejectedRequired = false;
  public commentReviewForm: FormGroup;
  public pendingCommentCount = 0;
  public nextCommentId;

  constructor(
    private api: ApiService,
    private commentService: CommentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private utils: Utils
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject;
    this.baseRouteUrl = this.currentProject.type === 'currentProjectNotification' ? '/pn' : '/p';
    this.storageService.state.selectedTab = 1;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(data => {
        if (data.comment) {
          this.comment = data.comment;

          if (this.storageService.state.currentCommentPeriod) {
            this.commentPeriod = this.storageService.state.currentCommentPeriod.data;
          } else if (data.commentPeriod) {
            // On a hard reload we need to get the comment period.
            this.commentPeriod = data.commentPeriod;
            this.storageService.state.currentCommentPeriod = { type: 'currentCommentPeriod', data: this.commentPeriod };
          } else {
            alert('Uh-oh, couldn\'t load comment period');
            // comment period not found --> navigate back to search
            this.router.navigate(['/search']);
          }

          // This is populated in commentService.
          this.pendingCommentCount = this.commentService.pendingCommentCount;
          this.nextCommentId = this.commentService.nextCommentId;

          this.initForm();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load comment');
          // comment period not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  private initForm() {
    this.commentReviewForm = new FormGroup({
      'dateAdded': new FormControl({ value: '', disabled: true }),
      'datePosted': new FormControl({ value: '', disabled: true }),
      'deferralNotesText': new FormControl(),
      'isNamePublic': new FormControl({ value: false, disabled: true }),
      'isDeferred': new FormControl(),
      'isPublished': new FormControl(),
      'isRejected': new FormControl(),
      'proponentResponseText': new FormControl(),
      'publishedNotesText': new FormControl(),
      'rejectionNotesText': new FormControl()
    });

    this.setEaoStatus(this.comment.eaoStatus);
    this.commentReviewForm.controls.datePosted.setValue(
      this.comment.datePosted ? this.utils.convertJSDateToNGBDate(new Date(this.comment.datePosted)) : undefined);
    this.commentReviewForm.controls.dateAdded.setValue(this.utils.convertJSDateToNGBDate(new Date(this.comment.dateAdded)));
    this.commentReviewForm.controls.deferralNotesText.setValue(this.comment.eaoNotes);
    this.commentReviewForm.controls.isNamePublic.setValue(!this.comment.isAnonymous);
    this.commentReviewForm.controls.proponentResponseText.setValue(this.comment.proponentNotes);
    this.commentReviewForm.controls.publishedNotesText.setValue(this.comment.publishedNotes);
    this.commentReviewForm.controls.rejectionNotesText.setValue(this.comment.rejectedNotes);
  }

  public onSubmit(action) {
    this.loading = true;

    this.comment.isAnonymous = !this.commentReviewForm.get('isNamePublic').value;

    this.comment.dateAdded = this.utils.convertFormGroupNGBDateToJSDate(this.commentReviewForm.get('dateAdded').value);

    // TODO: Validation
    if (this.commentReviewForm.get('isPublished').value) {
      this.comment.publishedNotes = this.commentReviewForm.get('publishedNotesText').value;
      this.comment.eaoStatus = 'Published';
      this.comment.datePosted = new Date();
    } else if (this.commentReviewForm.get('isDeferred').value) {
      this.comment.eaoNotes = this.commentReviewForm.get('deferralNotesText').value;
      this.comment.eaoStatus = 'Deferred';
    } else if (this.commentReviewForm.get('isRejected').value) {
      this.comment.eaoNotes = this.commentReviewForm.get('rejectionNotesText').value;
      this.comment.eaoStatus = 'Rejected';
    } else {
      this.comment.eaoStatus = 'Reset';
    }
    this.comment.proponentNotes = this.commentReviewForm.get('proponentResponseText').value;

    let previousCommentId = this.comment.commentId;
    this.commentService.save(this.comment)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        newComment => {
          this.comment = newComment;
        },
        () => {
          alert('Uh-oh, couldn\'t edit comment');
        },
        () => {
          this.openSnackBar(`Comment #${previousCommentId} updated.`, 'Close');
          switch (action) {
            case 'exit': {
              this.router.navigate([this.baseRouteUrl, this.currentProject.data._id, 'cp', this.commentPeriod._id]);
              break;
            }
            case 'next': {
              this.router.navigate([this.baseRouteUrl, this.currentProject.data._id, 'cp', this.commentPeriod._id, 'c', this.nextCommentId, 'comment-details']);
              break;
            }
            default: {
              break;
            }
          }
          this.loading = false;
        }
      );
  }

  public onCancel() {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.router.navigate([this.baseRouteUrl, this.currentProject.data._id, 'cp', this.commentPeriod._id]);
    }
  }

  public setEaoStatus(status: string) {
    switch (status) {
      case 'Published': {
        if (!this.commentReviewForm.get('isPublished').value) {
          this.commentReviewForm.controls.isPublished.setValue(true);
          this.commentReviewForm.controls.isDeferred.setValue(false);
          this.commentReviewForm.controls.isRejected.setValue(false);
        } else {
          this.commentReviewForm.controls.isPublished.setValue(false);
        }
        break;
      }
      case 'Deferred': {
        if (!this.commentReviewForm.get('isDeferred').value) {
          this.commentReviewForm.controls.isPublished.setValue(false);
          this.commentReviewForm.controls.isDeferred.setValue(true);
          this.commentReviewForm.controls.isRejected.setValue(false);
        } else {
          this.commentReviewForm.controls.isDeferred.setValue(false);
        }
        break;
      }
      case 'Rejected': {
        if (!this.commentReviewForm.get('isRejected').value) {
          this.commentReviewForm.controls.isPublished.setValue(false);
          this.commentReviewForm.controls.isDeferred.setValue(false);
          this.commentReviewForm.controls.isRejected.setValue(true);

          this.comment.documentsList.map(document => {
            document.eaoStatus = 'Rejected';
          });
        } else {
          this.commentReviewForm.controls.isRejected.setValue(false);
        }
        break;
      }
      default: {
        // Has no eaoStatus. Probably brand new or has been reset.
        this.commentReviewForm.controls.isPublished.setValue(false);
        this.commentReviewForm.controls.isDeferred.setValue(false);
        this.commentReviewForm.controls.isRejected.setValue(false);
        break;
      }
    }
    this._changeDetectionRef.detectChanges();
  }

  public downloadDocument(document: Document) {
    return this.api.downloadDocument(document).then(() => {
      console.log('Download initiated for file(s)');
    });
  }

  public toggleDocumentPublish(document: any, action: String) {
    if (action === 'Published' && !this.commentReviewForm.get('isRejected').value) {
      document.eaoStatus = 'Published';
    } else if (action === 'Rejected' && !this.commentReviewForm.get('isRejected').value) {
      document.eaoStatus = 'Rejected';
    }
  }

  public register() {
    console.log('Successful registration');
    console.log(this.commentReviewForm);
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
