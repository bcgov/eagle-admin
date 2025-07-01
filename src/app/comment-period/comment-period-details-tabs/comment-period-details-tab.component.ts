import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, RouterModule } from '@angular/router';
import { CommentPeriod } from 'src/app/models/commentPeriod';
import { ApiService } from 'src/app/services/api';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { SafeHtmlPipe } from 'src/app/shared/pipes/safe-html-converter.pipe';
import { CommentStatsComponent } from 'src/app/shared/components/comment-stats/comment-stats.component';
import { ListConverterPipe } from 'src/app/shared/pipes/list-converter.pipe';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-comment-period-details-tab',
    templateUrl: './comment-period-details-tab.component.html',
    styleUrls: ['./comment-period-details-tab.component.scss'],
    standalone: true,
    imports: [
      CommonModule,
      SafeHtmlPipe,
      CommentStatsComponent,
      ListConverterPipe,
      NgbDropdownModule,
      RouterModule
    ]
})

export class CommentPeriodDetailsTabComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription();

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
      this.subscriptions.add(
        this.documentService.getByMultiId(this.commentPeriod.relatedDocuments)
          .subscribe(
            data => {
              this.commentPeriodDocs = data;
            }
          )
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
        this.subscriptions.add(
          this.commentPeriodService.unPublish(this.commentPeriod)
            .subscribe(
              (() => {
                this.commentPeriod.isPublished = false;
                this.setPublishStatus();
                this.openSnackBar('This comment period has been un-published.', 'Close');
                this.loading = false;
              })
            )
        );
      } else {
        this.subscriptions.add(
          this.commentPeriodService.publish(this.commentPeriod)
            .subscribe(
              (() => {
                this.commentPeriod.isPublished = true;
                this.setPublishStatus();
                this.openSnackBar('This comment period has been published.', 'Close');
                this.loading = false;
              })
            )
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
      this.subscriptions.add(
        this.commentPeriodService.delete(this.commentPeriod)
          .subscribe({
            error: () => {
              alert('Uh-oh, couldn\'t delete comment period');
              this.loading = false;
            },
            complete: () => {
              // delete succeeded --> navigate back to search
              // Clear out the document state that was stored previously.
              this.loading = false;
              this.openSnackBar('This comment period has been deleted', 'Close');
              this.router.navigate([this.baseRouteUrl, this.projectId, 'comment-periods']);
            }
          })
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
  public exportCommentsForProponents() {
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
    this.subscriptions.unsubscribe();
  }
}
