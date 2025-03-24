import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { CommentPeriod } from 'app/models/commentPeriod';

import { ApiService } from 'app/services/api';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { StorageService } from 'app/services/storage.service';
import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'app-comment-period-details-tab',
  templateUrl: './comment-period-details-tab.component.html',
  styleUrls: ['./comment-period-details-tab.component.scss']
})

export class CommentPeriodDetailsTabComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  @Input() public commentPeriod: CommentPeriod;

  public commentPeriodPublishedStatus: string;
  public publishAction: string;
  public projectId: string;
  public projectName: string;
  public projectType: string;
  public baseRouteUrl: string;
  public loading = true;
  public commentPeriodDocs = [];
  public canDeleteCommentPeriod = false;

  constructor(
    private api: ApiService,
    private commentPeriodService: CommentPeriodService,
    private documentService: DocumentService,
    private router: Router,
    private snackBar: MatSnackBar,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.setPublishStatus();
    this.projectId = this.storageService.state.currentProject.data._id;
    this.projectName = this.storageService.state.currentProject.data.name;
    this.projectType = this.storageService.state.currentProject.type;
    this.baseRouteUrl = this.projectType === 'currentProject' ? '/p' : '/pn';

    if (this.commentPeriod.relatedDocuments.length > 0) {
      this.documentService.getByMultiId(this.commentPeriod.relatedDocuments)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          data => {
            this.commentPeriodDocs = data;
          }
        );
    }

    this.loading = false;
  }

  setPublishStatus() {
    this.commentPeriodPublishedStatus = this.commentPeriod.isPublished ? 'Published' : 'Not Published';
    this.publishAction = this.commentPeriod.isPublished ? 'Un-Publish' : 'Publish';
  }

  public togglePublishState() {
    if (confirm(`Are you sure you want to ${this.publishAction} this comment period?`)) {
      this.loading = true;
      if (this.commentPeriod.isPublished) {
        this.commentPeriodService.unPublish(this.commentPeriod)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            (() => {
              this.commentPeriod.isPublished = false;
              this.setPublishStatus();
              this.openSnackBar('This comment period has been un-published.', 'Close');
              this.loading = false;
            })
          );
      } else {
        this.commentPeriodService.publish(this.commentPeriod)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            (() => {
              this.commentPeriod.isPublished = true;
              this.setPublishStatus();
              this.openSnackBar('This comment period has been published.', 'Close');
              this.loading = false;
            })
          );
      }
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  editCommentPeriod() {
    this.router.navigateByUrl(`${this.baseRouteUrl}/${this.projectId}/cp/${this.commentPeriod._id}/edit`);
  }

  deleteCommentPeriod() {
    if (confirm(`Are you sure you want to delete this comment period?`)) {
      this.loading = true;
      this.commentPeriodService.delete(this.commentPeriod)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          () => {
            alert('Uh-oh, couldn\'t delete comment period');
          },
          () => { // onCompleted
            // delete succeeded --> navigate back to search
            // Clear out the document state that was stored previously.
            this.loading = false;
            this.openSnackBar('This comment period has been deleted', 'Close');
            this.router.navigate([this.baseRouteUrl, this.projectId, 'comment-periods']);
          }
        );
    }
  }

  public addComment() {
    this.router.navigate([this.baseRouteUrl, this.commentPeriod.project, 'cp', this.commentPeriod._id, 'add-comment']);
  }

  public exportCommentsForStaff() {
    // Export comments with fields relevant to staff to CSV
    this.openSnackBar('Download Initiated', 'Close');
    this.api.exportComments(this.commentPeriod._id, this.projectName, 'staff');
  }
  public   exportCommentsForProponents() {
    // Export comments with fields relevant to proponents to CSV
    this.openSnackBar('Download Initiated', 'Close');
    this.api.exportComments(this.commentPeriod._id, this.projectName, 'proponent');
  }

  public downloadDocument(document) {
    return this.api.downloadDocument(document).then(() => {
      console.log('Download initiated for file');
    });
  }

  public checkIfCanDelete() {
    this.canDeleteCommentPeriod = this.storageService.state.canDeleteCommentPeriod.data;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
