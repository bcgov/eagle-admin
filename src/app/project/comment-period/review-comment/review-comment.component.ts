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

@Component({
  selector: 'app-review-comment',
  templateUrl: './review-comment.component.html',
  styleUrls: ['./review-comment.component.scss']
})

export class ReviewCommentComponent implements OnInit {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public projectId;
  public comment: Comment;
  public commentPeriod: CommentPeriod;
  public documents = [];
  public loading = true;

  public commentReviewForm: FormGroup;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private commentService: CommentService,
    private snackBar: MatSnackBar,
    private storageService: StorageService,
    private documentService: DocumentService
  ) { }

  ngOnInit() {
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(data => {
        if (data.comment) {
          this.comment = data.comment;
          this.storageService.state.currentVCs = { type: 'currentVCs', data: this.comment.valuedComponents };

          this.comment.documentsList.forEach(document => {
            this.documents.push({
              document: document,
              isEdited: false
            });
          });

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
          this.initForm();
        } else {
          alert('Uh-oh, couldn\'t load comment');
          // comment period not found --> navigate back to search
          this.router.navigate(['/search']);
        }
        this.loading = false;
      });

    this.projectId = this.storageService.state.currentProject._id;

  }

  private initForm() {
    this.commentReviewForm = new FormGroup({
      'deferralNotesText': new FormControl(),
      'isDeferred': new FormControl(),
      'isPublished': new FormControl(),
      'isRejected': new FormControl(),
      'proponentResponseText': new FormControl(),
      'rejectionNotesText': new FormControl(),
      'publishedNotesText': new FormControl()
    });

    this.setEaoStatus(this.comment.eaoStatus);

    this.commentReviewForm.controls.proponentResponseText.setValue(this.comment.proponentNotes);
    this.commentReviewForm.controls.deferralNotesText.setValue(this.comment.eaoNotes);
    this.commentReviewForm.controls.rejectionNotesText.setValue(this.comment.rejectedNotes);
    this.commentReviewForm.controls.publishedNotesText.setValue(this.comment.publishedNotes);
  }

  public onSubmit() {
    this.loading = true;
    // TODO: Validation
    if (this.commentReviewForm.get('isPublished').value) {
      this.comment.publishedNotes = this.commentReviewForm.get('publishedNotesText').value;
      this.comment.eaoStatus = 'Published';
    } else if (this.commentReviewForm.get('isDeferred').value) {
      this.comment.eaoNotes = this.commentReviewForm.get('deferralNotesText').value;
      this.comment.eaoStatus = 'Deferred';
    } else if (this.commentReviewForm.get('isRejected').value) {
      this.comment.eaoNotes = this.commentReviewForm.get('rejectionNotesText').value;
      this.comment.eaoStatus = 'Rejected';
      this.documents.forEach(document => {
        document.document.eaoStatus = 'Rejected';
      });
    } else {
      this.comment.eaoStatus = 'Reset';
    }
    this.comment.proponentNotes = this.commentReviewForm.get('proponentResponseText').value;
    this.comment.valuedComponents = this.storageService.state.currentVCs.data;

    this.documents.forEach(document => {
      if (document.isEdited) {
        const formData = new FormData();
        formData.append('eaoStatus', document.document.eaoStatus);
        this.documentService.update(formData, document.document._id)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            doc => { },
            error => {
              console.log('error =', error);
              alert('Uh-oh, couldn\'t update document');
            },
            () => { }
          );
      }
    });

    this.commentService.save(this.comment)
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
          this.loading = false;
          this.openSnackBar('This comment period was created successfuly.', 'Close');
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

  public downloadFile(document: Document) {
    console.log(document);
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

  public register() {
    console.log('Successful registration');
    console.log(this.commentReviewForm);
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
}
