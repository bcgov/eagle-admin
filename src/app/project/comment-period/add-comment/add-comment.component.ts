import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Subject } from 'rxjs';
import * as moment from 'moment-timezone';

import { Utils } from 'app/shared/utils/utils';

import { Comment } from 'app/models/comment';
import { CommentPeriod } from 'app/models/commentPeriod';
import { Document } from 'app/models/document';

import { ApiService } from 'app/services/api';
import { CommentService } from 'app/services/comment.service';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})

export class AddCommentComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public currentProject;
  public comment = new Comment();
  public commentPeriod: CommentPeriod;
  public commentFiles: Array<File> = [];
  public documents: Document[] = [];
  public loading = true;

  public addCommentForm: FormGroup;

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
    if (this.storageService.state.currentVCs == null) {
      this.storageService.state.currentVCs = { type: 'currentVCs', data: [] };
    }

    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
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
      });
  }

  private initForm() {
    this.addCommentForm = new FormGroup({
      'authorText': new FormControl(),
      'commentText': new FormControl(),
      'dateAdded': new FormControl(),
      'datePosted': new FormControl(),
      'deferralNotesText': new FormControl(),
      'isNamePublic': new FormControl(),
      'isDeferred': new FormControl(),
      'isPublished': new FormControl(),
      'isRejected': new FormControl(),
      'locationText': new FormControl(),
      'proponentResponseText': new FormControl(),
      'rejectionNotesText': new FormControl(),
      'publishedNotesText': new FormControl()
    });
    this.addCommentForm.controls.isNamePublic.setValue(false);
    this.addCommentForm.controls.dateAdded.setValue(this.utils.convertJSDateToNGBDate(new Date()));
    this.addCommentForm.controls.datePosted.setValue(this.utils.convertJSDateToNGBDate(new Date()));
  }

  public onSubmit() {
    this.loading = true;

    this.comment.author = this.addCommentForm.get('authorText').value;
    this.comment.comment = this.addCommentForm.get('commentText').value;
    this.comment.dateAdded = this.utils.convertFormGroupNGBDateToJSDate(this.addCommentForm.get('dateAdded').value);
    this.comment.datePosted = this.utils.convertFormGroupNGBDateToJSDate(this.addCommentForm.get('datePosted').value);
    this.comment.isAnonymous = !this.addCommentForm.get('isNamePublic').value;
    this.comment.location = this.addCommentForm.get('locationText').value;

    // TODO: Validation
    if (this.addCommentForm.get('isPublished').value) {
      this.comment.publishedNotes = this.addCommentForm.get('publishedNotesText').value;
      this.comment.eaoStatus = 'Published';
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
    this.comment.valuedComponents = this.storageService.state.currentVCs.data;

    this.comment.period = this.commentPeriod._id;

    // go through and upload one at a time.
    const documentsForm = this.setDocumentForm();
    this.comment.documentsList = [];
    this.comment.documents = [];

    this.commentService.add(this.comment, documentsForm)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        res => { },
        error => {
          console.log('error =', error);
          alert('Uh-oh, couldn\'t add comment');
        },
        () => { // onCompleted
          this.router.navigate(['/p', this.currentProject._id, 'cp', this.commentPeriod._id]);
          this.loading = false;
          this.openSnackBar('This comment was updated successfuly.', 'Close');
        }
      );
  }

  public onCancel() {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.router.navigate(['/p', this.currentProject._id, 'cp', this.commentPeriod._id]);
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

  public toggleDocumentPublish(document: any, action: String) {
    if (action === 'Published' && !this.addCommentForm.get('isRejected').value) {
      document.eaoStatus = 'Published';
    } else if (action === 'Rejected' && !this.addCommentForm.get('isRejected').value) {
      document.eaoStatus = 'Rejected';
    }
  }

  private setDocumentForm() {
    let docForms = [];
    this.documents.map(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('project', this.currentProject._id);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('internalOriginalName', doc.internalOriginalName);
      formData.append('documentSource', 'COMMENT');
      formData.append('dateUploaded', moment());
      formData.append('datePosted', moment());
      formData.append('documentAuthor', this.addCommentForm.get('authorText').value);
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
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
