import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, input, inject, DestroyRef, ChangeDetectionStrategy, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FormGroup, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadComponent } from '../../file-upload/file-upload.component';
import { LegacyCommentPeriod } from 'src/app/comment-periods/comment-period-legacy';
import { CommentCreate, CommentService } from 'src/app/services/comment.service';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from 'src/app/shared/utils/utils';
import { Document } from 'src/app/models/document';
import { DateTime } from 'luxon';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-add-comment',
    templateUrl: './add-comment.component.html',
    styleUrl: './add-comment.component.css',
    imports: [
      DatePipe,
      FormsModule,
      ReactiveFormsModule,
      RouterModule,
      NgbDatepickerModule,
      FileUploadComponent
    ]
})

export class AddCommentComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private commentService = inject(CommentService);
  private toastService = inject(ToastService);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  project = input.required<any>();
  commentPeriod = input.required<LegacyCommentPeriod>();
  /** Route param; the period resolver's row shape is not relied on for ids. */
  commentPeriodId = input.required<string>();

  public baseRouteUrl: string;
  /** The `:projId` or `:notificationProjectId` route param; `project()._id` is null on a DEMI-minted project. */
  private parentId: string;
  public commentFiles: Array<File> = [];
  public documents: Document[] = [];
  loading = signal(false);

  public addCommentForm: FormGroup<{
    authorText: FormControl<string | null>;
    commentText: FormControl<string | null>;
    dateAdded: FormControl<unknown>;
    datePosted: FormControl<unknown>;
    deferralNotesText: FormControl<string | null>;
    isNamePublic: FormControl<boolean | null>;
    isDeferred: FormControl<boolean | null>;
    isPublished: FormControl<boolean | null>;
    isRejected: FormControl<boolean | null>;
    locationText: FormControl<string | null>;
    proponentResponseText: FormControl<string | null>;
    rejectionNotesText: FormControl<string | null>;
    publishedNotesText: FormControl<string | null>;
  }>;
  public anonymousName = 'Anonymous';

  ngOnInit() {
    const params = this.route.snapshot.paramMap;
    this.baseRouteUrl = params.has('projId') ? '/p' : '/pn';
    this.parentId = params.get('projId') ?? params.get('notificationProjectId');
    this.initForm();
  }

  private initForm() {
    this.addCommentForm = new FormGroup({
      'authorText': new FormControl<string | null>({ value: this.anonymousName, disabled: true }),
      'commentText': new FormControl<string | null>(null),
      'dateAdded': new FormControl<unknown>(null),
      'datePosted': new FormControl<unknown>({ value: undefined, disabled: true }),
      'deferralNotesText': new FormControl<string | null>(null),
      'isNamePublic': new FormControl<boolean | null>(null),
      'isDeferred': new FormControl<boolean | null>(null),
      'isPublished': new FormControl<boolean | null>(null),
      'isRejected': new FormControl<boolean | null>(null),
      'locationText': new FormControl<string | null>(null),
      'proponentResponseText': new FormControl<string | null>(null),
      'rejectionNotesText': new FormControl<string | null>(null),
      'publishedNotesText': new FormControl<string | null>(null)
    });
    this.addCommentForm.controls.isNamePublic.setValue(false);
    this.addCommentForm.controls.dateAdded.setValue(convertJSDateToNGBDate(new Date()));
    this.addCommentForm.get('isNamePublic').valueChanges
      .subscribe(isPublic => {
        if (!isPublic) {
          // User has un-checked the public box so name will not be anonymous
          this.addCommentForm.get('authorText').disable();
          this.addCommentForm.get('authorText').setValue(this.anonymousName);
        } else {
          this.addCommentForm.get('authorText').enable();
          this.addCommentForm.get('authorText').setValue('');
        }
      }

      );
  }

  public onSubmit() {
    if (this.commentPeriod().readOnly) {
      this.toastService.error('Failed to add comment. This comment period is read-only.');
      return;
    }
    this.loading.set(true);
    const form = this.addCommentForm.getRawValue();
    const comment: CommentCreate = {
      periodId: this.commentPeriod().demiId,
      author: form.authorText,
      comment: form.commentText,
      dateAdded: convertFormGroupNGBDateToJSDate(form.dateAdded).toISOString(),
      isAnonymous: !form.isNamePublic,
      location: form.locationText,
      proponentNotes: form.proponentResponseText
    };

    // TODO: Validation
    if (form.isPublished) {
      Object.assign(comment, { eaoStatus: 'Published', publishedNotes: form.publishedNotesText, datePosted: new Date().toISOString() });
    } else if (form.isDeferred) {
      Object.assign(comment, { eaoStatus: 'Deferred', eaoNotes: form.deferralNotesText });
    } else if (form.isRejected) {
      Object.assign(comment, { eaoStatus: 'Rejected', rejectedNotes: form.rejectionNotesText });
    } else {
      comment.eaoStatus = 'Pending';
    }

    this.commentService.add(comment, this.setDocumentForm())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false))
      )
      .subscribe(() => {
        this.router.navigate([this.baseRouteUrl, this.parentId, 'cp', this.commentPeriodId()]);
        this.toastService.success('Comment added.');
      });
  }

  public onCancel() {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.router.navigate([this.baseRouteUrl, this.parentId, 'cp', this.commentPeriodId()]);
    }
  }

  public setEaoStatus(status: string) {
    switch (status) {
      case 'Published': {
        if (!this.addCommentForm.get('isPublished').value) {
          this.addCommentForm.controls.isPublished.setValue(true);
          this.addCommentForm.controls.isDeferred.setValue(false);
          this.addCommentForm.controls.isRejected.setValue(false);
        } else {
          this.addCommentForm.controls.isPublished.setValue(false);
        }
        break;
      }
      case 'Deferred': {
        if (!this.addCommentForm.get('isDeferred').value) {
          this.addCommentForm.controls.isPublished.setValue(false);
          this.addCommentForm.controls.isDeferred.setValue(true);
          this.addCommentForm.controls.isRejected.setValue(false);
        } else {
          this.addCommentForm.controls.isDeferred.setValue(false);
        }
        break;
      }
      case 'Rejected': {
        if (!this.addCommentForm.get('isRejected').value) {
          this.addCommentForm.controls.isPublished.setValue(false);
          this.addCommentForm.controls.isDeferred.setValue(false);
          this.addCommentForm.controls.isRejected.setValue(true);

          this.documents.map(document => {
            document.eaoStatus = 'Rejected';
          });
        } else {
          this.addCommentForm.controls.isRejected.setValue(false);
        }
        break;
      }
      default: {
        // Has no eaoStatus. Probably brand new or has been reset.
        this.addCommentForm.controls.isPublished.setValue(false);
        this.addCommentForm.controls.isDeferred.setValue(false);
        this.addCommentForm.controls.isRejected.setValue(false);
        this.documents.map(document => {
          document.eaoStatus = 'Pending';
        });
        break;
      }
    }
  }

  public toggleDocumentPublish(document: any, action: string) {
    if (action === 'Published' && !this.addCommentForm.get('isRejected').value) {
      document.eaoStatus = 'Published';
    } else if (action === 'Rejected' && !this.addCommentForm.get('isRejected').value) {
      document.eaoStatus = 'Rejected';
    }
  }

  private setDocumentForm() {
    const docForms = [];
    this.documents.map(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('project', this.project()._id);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('internalOriginalName', doc.internalOriginalName);
      formData.append('documentSource', 'COMMENT');
      formData.append('dateUploaded', DateTime.now().toUTC().toISO());
      formData.append('datePosted', DateTime.now().toUTC().toISO());
      formData.append('documentAuthor', this.addCommentForm.get('authorText').value);

      if (this.route.snapshot.paramMap.has('projId')) {
        formData.append('legislation', this.project().legislationYear.toString());
      }

      // todo add authorType? selector?
      docForms.push(formData);
    });

    return docForms;
  }


  public addDocuments(files: any) {
    if (files) { // safety check
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          // ensure file is not already in the list
          if (this.documents.find(x => x.documentFileName === files[i].name)) {
            continue;
          }
          this.commentFiles.push(files[i]);
          const document = new Document();
          document.upfile = files[i];
          document.documentFileName = files[i].name;
          document.internalOriginalName = files[i].name;
          if (this.addCommentForm.get('isRejected').value) {
            document.eaoStatus = 'Rejected';
          }
          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }
    }
  }

  public deleteDocument(doc: Document) {
    if (doc && this.documents) { // safety check
      // remove doc from current list
      this.commentFiles = this.commentFiles.filter(item => (item.name !== doc.documentFileName));
      this.documents = this.documents.filter(item => (item.documentFileName !== doc.documentFileName));
    }
  }

  public register() {
    this.logger.debug('Successful registration', 'AddCommentComponent', this.addCommentForm.value);
  }
}