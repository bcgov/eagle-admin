import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';

import { Comment } from 'app/models/comment';
import { Document } from 'app/models/document';

import { CommentPeriod } from 'app/models/commentPeriod';
import { FormGroup, FormControl } from '@angular/forms';
import { CommentService } from 'app/services/comment.service';
import { MatSnackBar } from '@angular/material';
import { DocumentService } from 'app/services/document.service';
import { ApiService } from 'app/services/api';
import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})

export class AddCommentComponent implements OnInit {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public projectId;
  public comment = new Comment();
  public commentPeriod: CommentPeriod;
  public commentFiles: Document[] = [];
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
    private documentService: DocumentService,
    private utils: Utils
  ) { }

  ngOnInit() {
    if (this.storageService.state.currentVCs == null) {
      this.storageService.state.currentVCs = { type: 'currentVCs', data: [] };
    }

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: any) => {
        if (data) {
          this.commentPeriod = data.commentPeriod;
          this.initForm();
          this.projectId = this.storageService.state.currentProject.data._id;
        } else {
          alert('Uh-oh, couldn\'t load valued components');
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
      'isAnonymous': new FormControl(),
      'isDeferred': new FormControl(),
      'isPublished': new FormControl(),
      'isRejected': new FormControl(),
      'locationText': new FormControl(),
      'proponentResponseText': new FormControl(),
      'rejectionNotesText': new FormControl(),
      'publishedNotesText': new FormControl()
    });
    this.addCommentForm.controls.isAnonymous.setValue(false);
    this.addCommentForm.controls.dateAdded.setValue(this.utils.convertJSDateToNGBDate(new Date()));
    this.addCommentForm.controls.datePosted.setValue(this.utils.convertJSDateToNGBDate(new Date()));
  }

  public onSubmit() {
    this.loading = true;

    this.comment.author = this.addCommentForm.get('authorText').value;
    this.comment.comment = this.addCommentForm.get('commentText').value;
    this.comment.dateAdded = this.utils.convertFormGroupNGBDateToJSDate(this.addCommentForm.get('dateAdded').value);
    this.comment.datePosted = this.utils.convertFormGroupNGBDateToJSDate(this.addCommentForm.get('datePosted').value);
    this.comment.isAnonymous = this.addCommentForm.get('isAnonymous').value;
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
      // this.documents.forEach(document => {
      //   document.document.eaoStatus = 'Rejected';
      // });
    } else {
      this.comment.eaoStatus = 'Reset';
    }
    this.comment.proponentNotes = this.addCommentForm.get('proponentResponseText').value;
    this.comment.valuedComponents = this.storageService.state.currentVCs.data;

    // this.documents.forEach(document => {
    //   if (document.isEdited) {
    //     const formData = new FormData();
    //     formData.append('eaoStatus', document.document.eaoStatus);
    //     this.documentService.update(formData, document.document._id)
    //       .takeUntil(this.ngUnsubscribe)
    //       .subscribe(
    //         doc => { },
    //         error => {
    //           console.log('error =', error);
    //           alert('Uh-oh, couldn\'t update document');
    //         },
    //         () => { }
    //       );
    //   }
    // });

    this.comment.period = this.commentPeriod._id;

    this.commentService.add(this.comment)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        newComment => {
          this.comment = newComment;
        },
        error => {
          console.log('error =', error);
          alert('Uh-oh, couldn\'t edit comment period');
        },
        () => { // onCompleted
          this.router.navigate(['/p', this.projectId, 'cp', this.commentPeriod._id]);
          this.loading = false;
          this.openSnackBar('This comment was created successfuly.', 'Close');
        }
      );
  }

  public onCancel() {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.router.navigate(['/p', this.projectId, 'cp', this.commentPeriod._id]);
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
        break;
      }
    }
  }

  public downloadFile(document: Document) {
    let promises = [];
    promises.push(this.api.downloadDocument(document));
    return Promise.all(promises).then(() => {
      console.log('Download initiated for file(s)');
    });
  }

  public toggleDocumentPublish(document: any, action: String) {
    if (action === 'publish') {
      document.document.eaoStatus = 'Published';
    } else {
      document.document.eaoStatus = 'Rejected';
    }
    document.isEdited = true;
  }

  // public uploadDocuments() {
  //   this.loading = true;

  //   // go through and upload one at a time.
  //   let observables = of(null);

  //   this.documents.map(doc => {
  //     const formData = new FormData();
  //     formData.append('upfile', doc.upfile);
  //     formData.append('project', this.currentProjectId);

  //     formData.append('documentFileName', doc.documentFileName);

  //     formData.append('documentSource', 'PROJECT');

  //     formData.append('displayName', this.myForm.value.displayName);
  //     formData.append('milestone', this.myForm.value.labelsel);
  //     formData.append('dateUploaded', moment(this.myForm.value.dateUploaded));
  //     formData.append('datePosted', moment(this.myForm.value.datePosted));
  //     formData.append('type', this.myForm.value.doctypesel);
  //     formData.append('description', this.myForm.value.description);
  //     formData.append('documentAuthor', this.myForm.value.authorsel);
  //     observables = observables.concat(this.documentService.add(formData));
  //   });

  //   this.storageService.state = { type: 'form', data: null };
  //   this.storageService.state = { type: 'documents', data: null };
  //   this.storageService.state = { type: 'labels', data: null };

  //   observables
  //     .takeUntil(this.ngUnsubscribe)
  //     .subscribe(
  //       () => { // onNext
  //         // do nothing here - see onCompleted() function below
  //       },
  //       error => {
  //         console.log('error =', error);
  //         alert('Uh-oh, couldn\'t delete project');
  //         // TODO: should fully reload project here so we have latest non-deleted objects
  //       },
  //       () => { // onCompleted
  //         // delete succeeded --> navigate back to search
  //         // Clear out the document state that was stored previously.
  //         this.router.navigate(['p', this.currentProjectId, 'project-documents']);
  //         this.loading = false;
  //       }
  //     );
  // }

  public addDocuments(files: FileList) {
    console.log('add docs', files);
    if (files) { // safety check
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          // ensure file is not already in the list

          if (this.documents.find(x => x.documentFileName === files[i].name)) {
            // this.snackBarRef = this.snackBar.open('Can\'t add duplicate file', null, { duration: 2000 });
            continue;
          }

          const document = new Document();
          document.upfile = files[i];
          document.documentFileName = files[i].name;

          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }
    }
    console.log('add docs', this.documents);
  }

  public deleteDocument(doc: Document) {
    if (doc && this.documents) { // safety check
      // remove doc from current list
      this.documents = this.documents.filter(item => (item.documentFileName !== doc.documentFileName));
    }
    console.log('delete docs', this.documents);
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
}
