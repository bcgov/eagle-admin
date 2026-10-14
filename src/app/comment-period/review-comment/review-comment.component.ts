import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Component, OnChanges, SimpleChanges, DestroyRef, input, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { concat, finalize, of, switchMap } from 'rxjs';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { CommentPeriod } from 'src/app/models/commentPeriod';
import { DemiComment, NextPendingComment } from 'src/app/models/demi/comment';
import { DemiDocument } from 'src/app/models/demi/document';
import { eagleWriteId as documentEagleId } from 'src/app/models/demi/document-write';
import { ReviewComment } from 'src/app/resolvers/comment.resolver';
import { DocumentService } from 'src/app/services/document.service';
import { CommentService } from 'src/app/services/comment.service';
import { StorageService } from 'src/app/services/storage.service';
import { convertJSDateToNGBDate } from 'src/app/shared/utils/utils';
import { DatePipe } from '@angular/common';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { LoggingService } from 'src/app/services/logging.service';

const NO_NEXT_PENDING: NextPendingComment = { nextId: null, pendingCount: 0 };

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-review-comment',
    templateUrl: './review-comment.component.html',
    styleUrl: './review-comment.component.css',
    imports: [DatePipe, ReactiveFormsModule, RouterLink, NgbDatepickerModule]
})

export class ReviewCommentComponent implements OnChanges {
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
  /** Route param; the period resolver's row shape is not relied on for ids. */
  commentPeriodId = input.required<string>();
  comment = input.required<ReviewComment>();

  public baseRouteUrl: string;
  public commentData: ReviewComment;
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
  nextPending = toSignal(toObservable(this.comment).pipe(
    switchMap(comment => concat(of(NO_NEXT_PENDING), this.commentService.getNextPending(comment.periodId, comment)))
  ), { initialValue: NO_NEXT_PENDING });

  // Save/Next keeps this component and swaps the resolved comment, so set up on every new comment, not once.
  ngOnChanges(changes: SimpleChanges) {
    if (!changes['comment']) {
      return;
    }
    this.baseRouteUrl = this.route.snapshot.paramMap.has('projId') ? '/p' : '/pn';
    this.storageService.state.selectedTab = 1;
    const comment = this.comment();
    this.commentData = { ...comment, documentsList: comment.documentsList.map(document => ({ ...document })) };
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

  public onSubmit(action: 'exit' | 'next') {
    this.loading.set(true);
    const form = this.commentReviewForm.getRawValue();
    const edits: Partial<DemiComment> = { isAnonymous: !form.isNamePublic, proponentNotes: form.proponentResponseText };
    if (form.isPublished) {
      Object.assign(edits, { eaoStatus: 'Published', publishedNotes: form.publishedNotesText, datePosted: new Date().toISOString() });
    } else if (form.isDeferred) {
      Object.assign(edits, { eaoStatus: 'Deferred', eaoNotes: form.deferralNotesText });
    } else if (form.isRejected) {
      Object.assign(edits, { eaoStatus: 'Rejected', eaoNotes: form.rejectionNotesText });
    } else {
      edits.eaoStatus = 'Pending';
    }
    // eagle-api publishes attachments by Eagle id; a DEMI-only document is left as it is.
    const documentsList = this.commentData.documentsList
      .filter(document => documentEagleId(document))
      .map(document => ({ _id: documentEagleId(document), eaoStatus: document.eaoStatus }));
    const { nextId } = this.nextPending();

    // save() reads `documentsList` off the comment; a non-literal argument keeps it out of the excess-property check.
    const body: DemiComment = Object.assign({ ...this.commentData, ...edits }, { documentsList });
    this.commentService.save(body)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          finalize(() => this.loading.set(false))
        )
        .subscribe({
          next: () => {
            this.toastService.success(`Comment #${this.commentData.commentId} updated.`);
            const periodUrl = [this.baseRouteUrl, this.project()._id, 'cp', this.commentPeriodId()];
            this.router.navigate(action === 'next' && nextId ? [...periodUrl, 'c', nextId, 'comment-details'] : periodUrl);
          },
          error: () => {
            this.toastService.error('Uh-oh, couldn\'t edit comment');
          }
        });
  }

  public onCancel() {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.router.navigate([this.baseRouteUrl, this.project()._id, 'cp', this.commentPeriodId()]);
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

  public downloadDocument(document: DemiDocument) {
    return this.api.downloadNative(document.id);
  }

  public toggleDocumentPublish(document: DemiDocument, action: string) {
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
