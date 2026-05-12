import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, OnInit, DestroyRef, input, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { CommentPeriod } from 'src/app/models/commentPeriod';
import { DocumentService } from 'src/app/services/document.service';
import { CommentService } from 'src/app/services/comment.service';
import { StorageService } from 'src/app/services/storage.service';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from 'src/app/shared/utils/utils';
import { Comment } from 'src/app/models/comment';
import { Document } from 'src/app/models/document';
import { DatePipe } from '@angular/common';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-review-comment',
    templateUrl: './review-comment.component.html',
    styleUrl: './review-comment.component.css',
    imports: [DatePipe, ReactiveFormsModule, RouterLink, NgbDatepickerModule]
})

export class ReviewCommentComponent implements OnInit {
  private api = inject(DocumentService);
  private commentService = inject(CommentService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private logger = inject(LoggingService);

  project = input.required<any>();
  commentPeriod = input.required<CommentPeriod>();
  comment = input.required<Comment>();

  public baseRouteUrl: string;
  public commentData: Comment;
  loading = signal(false);
  public isRejectedRequired = false;
  public commentReviewForm: FormGroup<{
    dateAdded: FormControl<unknown>;
    datePosted: FormControl<unknown>;
    deferralNotesText: FormControl<string | null>;
    isNamePublic: FormControl<boolean | null>;
    isDeferred: FormControl<boolean | null>;
    isPublished: FormControl<boolean | null>;
    isRejected: FormControl<boolean | null>;
    proponentResponseText: FormControl<string | null>;
    publishedNotesText: FormControl<string | null>;
    rejectionNotesText: FormControl<string | null>;
  }>;
  public pendingCommentCount = 0;
  public nextCommentId;

  ngOnInit() {
    this.baseRouteUrl = this.route.snapshot.paramMap.has('projId') ? '/p' : '/pn';
    this.storageService.state.selectedTab = 1;
    this.commentData = this.comment();
    this.pendingCommentCount = this.commentService.pendingCommentCount;
    this.nextCommentId = this.commentService.nextCommentId;
    this.initForm();
  }

  private initForm() {
    this.commentReviewForm = new FormGroup({
      'dateAdded': new FormControl<unknown>({ value: '', disabled: true }),
      'datePosted': new FormControl<unknown>({ value: '', disabled: true }),
      'deferralNotesText': new FormControl<string | null>(null),
      'isNamePublic': new FormControl<boolean | null>({ value: false, disabled: true }),
      'isDeferred': new FormControl<boolean | null>(null),
      'isPublished': new FormControl<boolean | null>(null),
      'isRejected': new FormControl<boolean | null>(null),
      'proponentResponseText': new FormControl<string | null>(null),
      'publishedNotesText': new FormControl<string | null>(null),
      'rejectionNotesText': new FormControl<string | null>(null)
    });

    this.setEaoStatus(this.commentData.eaoStatus);
    this.commentReviewForm.controls.datePosted.setValue(
      this.commentData.datePosted ? convertJSDateToNGBDate(new Date(this.commentData.datePosted)) : undefined);
    this.commentReviewForm.controls.dateAdded.setValue(convertJSDateToNGBDate(new Date(this.commentData.dateAdded)));
    this.commentReviewForm.controls.deferralNotesText.setValue(this.commentData.eaoNotes);
    this.commentReviewForm.controls.isNamePublic.setValue(!this.commentData.isAnonymous);
    this.commentReviewForm.controls.proponentResponseText.setValue(this.commentData.proponentNotes);
    this.commentReviewForm.controls.publishedNotesText.setValue(this.commentData.publishedNotes);
    this.commentReviewForm.controls.rejectionNotesText.setValue(this.commentData.rejectedNotes);
  }

  public onSubmit(action) {
    this.loading.set(true);

    this.commentData.isAnonymous = !this.commentReviewForm.get('isNamePublic').value;

    this.commentData.dateAdded = convertFormGroupNGBDateToJSDate(this.commentReviewForm.get('dateAdded').value);

    // TODO: Validation
    if (this.commentReviewForm.get('isPublished').value) {
      this.commentData.publishedNotes = this.commentReviewForm.get('publishedNotesText').value;
      this.commentData.eaoStatus = 'Published';
      this.commentData.datePosted = new Date();
    } else if (this.commentReviewForm.get('isDeferred').value) {
      this.commentData.eaoNotes = this.commentReviewForm.get('deferralNotesText').value;
      this.commentData.eaoStatus = 'Deferred';
    } else if (this.commentReviewForm.get('isRejected').value) {
      this.commentData.eaoNotes = this.commentReviewForm.get('rejectionNotesText').value;
      this.commentData.eaoStatus = 'Rejected';
    } else {
      this.commentData.eaoStatus = 'Reset';
    }
    this.commentData.proponentNotes = this.commentReviewForm.get('proponentResponseText').value;

    const previousCommentId = this.commentData.commentId;
    this.commentService.save(this.commentData)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.loading.set(false))
        )
        .subscribe({
          next: newComment => {
            this.commentData = newComment;
          },
          error: () => {
            this.toastService.error('Uh-oh, couldn\'t edit comment');
          },
          complete: () => {
            this.toastService.success(`Comment #${previousCommentId} updated.`);
            switch (action) {
              case 'exit': {
                this.router.navigate([this.baseRouteUrl, this.project()._id, 'cp', this.commentPeriod()._id]);
                break;
              }
              case 'next': {
                this.router.navigate([this.baseRouteUrl, this.project()._id, 'cp', this.commentPeriod()._id, 'c', this.nextCommentId, 'comment-details']);
                break;
              }
              default: {
                break;
              }
            }
          }
        });
  }

  public onCancel() {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.router.navigate([this.baseRouteUrl, this.project()._id, 'cp', this.commentPeriod()._id]);
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

          this.commentData.documentsList.map(document => {
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
  }

  public downloadDocument(document: Document) {
    return this.api.downloadDocument(document).then(() => {
      this.logger.debug('Download initiated for file(s)', 'ReviewCommentComponent');
    });
  }

  public toggleDocumentPublish(document: any, action: string) {
    if (action === 'Published' && !this.commentReviewForm.get('isRejected').value) {
      document.eaoStatus = 'Published';
    } else if (action === 'Rejected' && !this.commentReviewForm.get('isRejected').value) {
      document.eaoStatus = 'Rejected';
    }
  }

  public register() {
    this.logger.debug('Successful registration', 'ReviewCommentComponent', this.commentReviewForm.value);
  }

}
