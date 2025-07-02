import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadComponent } from '../../file-upload/file-upload.component';
import { CommentPeriod } from 'src/app/models/commentPeriod';
import { ApiService } from 'src/app/services/api';
import { CommentService } from 'src/app/services/comment.service';
import { StorageService } from 'src/app/services/storage.service';
import { Utils } from 'src/app/shared/utils/utils';
import { Comment } from 'src/app/models/comment';
import { Document } from 'src/app/models/document';
import moment from 'moment-timezone';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-add-comment',
    templateUrl: './add-comment.component.html',
    styleUrls: ['./add-comment.component.css'],
    standalone: true,
    imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      RouterModule,
      NgbDatepickerModule,
      MatSnackBarModule,
      FileUploadComponent
    ]
})

export class AddCommentComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription();

  public currentProject;
  public baseRouteUrl: string;
  public comment = new Comment();
  public commentPeriod: CommentPeriod;
  public commentFiles: Array<File> = [];
  public documents: Document[] = [];
  public loading = true;

  public addCommentForm: UntypedFormGroup;
  public anonymousName = 'Anonymous';

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private commentService: CommentService,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private utils: Utils
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject;
    this.baseRouteUrl = this.currentProject.type === 'currentProject' ? '/p' : '/pn';

    this.subscriptions.add(
      this.route.data
        .subscribe((data: any) => {
          if (data) {
            this.commentPeriod = data.commentPeriod;
            this.initForm();
          } else {
            alert('Uh-oh, couldn\'t load comment period');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
          this.loading = false;
        }));
  }

  private initForm() {
    this.addCommentForm = new UntypedFormGroup({
      'authorText': new UntypedFormControl({ value: this.anonymousName, disabled: true }),
      'commentText': new UntypedFormControl(),
      'dateAdded': new UntypedFormControl(),
      'datePosted': new UntypedFormControl({ value: '', disabled: true }),
      'deferralNotesText': new UntypedFormControl(),
      'isNamePublic': new UntypedFormControl(),
      'isDeferred': new UntypedFormControl(),
      'isPublished': new UntypedFormControl(),
      'isRejected': new UntypedFormControl(),
      'locationText': new UntypedFormControl(),
      'proponentResponseText': new UntypedFormControl(),
      'rejectionNotesText': new UntypedFormControl(),
      'publishedNotesText': new UntypedFormControl()
    });
    this.addCommentForm.controls.isNamePublic.setValue(false);
    this.addCommentForm.controls.dateAdded.setValue(this.utils.convertJSDateToNGBDate(new Date()));
    this.addCommentForm.controls.datePosted.setValue(
      this.comment.datePosted ? this.utils.convertJSDateToNGBDate(new Date(this.comment.datePosted)) : undefined);
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
    this.loading = true;
    this.comment.author = this.addCommentForm.get('authorText').value;
    this.comment.comment = this.addCommentForm.get('commentText').value;
    this.comment.dateAdded = this.utils.convertFormGroupNGBDateToJSDate(this.addCommentForm.get('dateAdded').value);
    this.comment.isAnonymous = !this.addCommentForm.get('isNamePublic').value;
    this.comment.location = this.addCommentForm.get('locationText').value;

    // TODO: Validation
    if (this.addCommentForm.get('isPublished').value) {
      this.comment.publishedNotes = this.addCommentForm.get('publishedNotesText').value;
      this.comment.eaoStatus = 'Published';
      this.comment.datePosted = new Date();
    } else if (this.addCommentForm.get('isDeferred').value) {
      this.comment.eaoNotes = this.addCommentForm.get('deferralNotesText').value;
      this.comment.eaoStatus = 'Deferred';
    } else if (this.addCommentForm.get('isRejected').value) {
      this.comment.eaoNotes = this.addCommentForm.get('rejectionNotesText').value;
      this.comment.eaoStatus = 'Rejected';
    } else {
      this.comment.eaoStatus = 'Reset';
    }
    this.comment.proponentNotes = this.addCommentForm.get('proponentResponseText').value;

    this.comment.period = this.commentPeriod._id;

    // go through and upload one at a time.
    const documentsForm = this.setDocumentForm();
    this.comment.documentsList = [];
    this.comment.documents = [];

    this.subscriptions.add(
      this.commentService.add(this.comment, documentsForm)
        .subscribe({
          error: error => {
            console.log('error =', error);
            alert('Uh-oh, couldn\'t add comment');
          },
          complete: () => { // onCompleted
            this.router.navigate([this.baseRouteUrl, this.currentProject.data._id, 'cp', this.commentPeriod._id]);
            this.loading = false;
            this.openSnackBar('This comment was updated successfuly.', 'Close');
          }
        })
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

  public downloadFile(document: Document) {
    return this.api.downloadDocument(document).then(() => {
      console.log('Download initiated for file(s)');
    });
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
      formData.append('project', this.currentProject.data._id);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('internalOriginalName', doc.internalOriginalName);
      formData.append('documentSource', 'COMMENT');
      formData.append('dateUploaded', moment().toISOString());
      formData.append('datePosted', moment().toISOString());
      formData.append('documentAuthor', this.addCommentForm.get('authorText').value);

      if (this.currentProject.type === 'currentProject') {
        formData.append('legislation', this.currentProject.data.legislationYear.toString());
      }

      // todo add authorType? selector?
      docForms.push(formData);
    });

    return docForms;
  }


  public addDocuments(files: FileList) {
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
    console.log('Successful registration');
    console.log(this.addCommentForm);
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
