import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { ToastService } from 'src/app/services/toast.service';
import { Router, RouterModule } from '@angular/router';
import { CommentPeriod } from 'src/app/models/commentPeriod';
import { DocumentService } from 'src/app/services/document.service';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { StorageService } from 'src/app/services/storage.service';
import { SafeHtmlPipe } from 'src/app/shared/pipes/safe-html-converter.pipe';
import { CommentStatsComponent } from 'src/app/shared/components/comment-stats/comment-stats.component';
import { ListConverterPipe } from 'src/app/shared/pipes/list-converter.pipe';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-comment-period-details-tab',
    templateUrl: './comment-period-details-tab.component.html',
    styleUrl: './comment-period-details-tab.component.css',
    imports: [
      DatePipe,
      SafeHtmlPipe,
      CommentStatsComponent,
      ListConverterPipe,
      NgbDropdownModule,
      RouterModule
    ]
})

export class CommentPeriodDetailsTabComponent implements OnInit {
  private commentPeriodService = inject(CommentPeriodService);
  private documentService = inject(DocumentService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private storageService = inject(StorageService);
  private logger = inject(LoggingService);
  private _cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  commentPeriod = input.required<CommentPeriod>();
  project = input.required<any>();

  public commentPeriodPublishedStatus: string;
  public publishAction: string;
  public projectId: string;
  public projectName: string;
  public projectType: string;
  public baseRouteUrl: string;
  public loading = true;
  public commentPeriodDocs = [];
  public canDeleteCommentPeriod = false;

  ngOnInit() {
    this.setPublishStatus();
    const projectData = this.project();
    // project() is the raw project from the resolver; storageService has the { type, data } wrapper
    const storedProject = this.storageService.state.currentProject;
    this.projectId = projectData._id ?? projectData.data?._id;
    this.projectName = projectData.name ?? projectData.data?.name;
    this.projectType = storedProject?.type ?? 'currentProject';
    this.baseRouteUrl = this.projectType === 'currentProject' ? '/p' : '/pn';

    if (this.commentPeriod().relatedDocuments && this.commentPeriod().relatedDocuments.length > 0) {
      this.documentService.getByMultiId(this.commentPeriod().relatedDocuments)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(
          data => {
            this.commentPeriodDocs = data;
          }
        );
    }

    this.loading = false;
    this._cdr.markForCheck();
  }

  setPublishStatus() {
    this.commentPeriodPublishedStatus = this.commentPeriod().isPublished ? 'Published' : 'Not Published';
    this.publishAction = this.commentPeriod().isPublished ? 'Un-Publish' : 'Publish';
  }

  public togglePublishState() {
    if (confirm(`Are you sure you want to ${this.publishAction} this comment period?`)) {
      this.loading = true;
      if (this.commentPeriod().isPublished) {
        this.commentPeriodService.unPublish(this.commentPeriod())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(
              (() => {
                this.commentPeriod().isPublished = false;
                this.setPublishStatus();
                this.toastService.success('This comment period has been un-published.');
                this.loading = false;
                this._cdr.markForCheck();
              })
            );
      } else {
        this.commentPeriodService.publish(this.commentPeriod())
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(
              (() => {
                this.commentPeriod().isPublished = true;
                this.setPublishStatus();
                this.toastService.success('This comment period has been published.');
                this.loading = false;
                this._cdr.markForCheck();
              })
            );
      }
    }
  }

  editCommentPeriod() {
    this.router.navigateByUrl(`${this.baseRouteUrl}/${this.projectId}/cp/${this.commentPeriod()._id}/edit`);
  }

  deleteCommentPeriod() {
    if (confirm(`Are you sure you want to delete this comment period?`)) {
      this.loading = true;
      this.commentPeriodService.delete(this.commentPeriod())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
            error: () => {
              alert('Uh-oh, couldn\'t delete comment period');
              this.loading = false;
              this._cdr.markForCheck();
            },
            complete: () => {
              // delete succeeded --> navigate back to search
              // Clear out the document state that was stored previously.
              this.loading = false;
              this._cdr.markForCheck();
              this.toastService.success('This comment period has been deleted');
              this.router.navigate([this.baseRouteUrl, this.projectId, 'comment-periods']);
            }
          });
    }
  }

  public addComment() {
    this.router.navigate([this.baseRouteUrl, this.commentPeriod().project, 'cp', this.commentPeriod()._id, 'add-comment']);
  }

  public exportCommentsForStaff() {
    // Export comments with fields relevant to staff to CSV
    this.toastService.info('Download Initiated');
    this.documentService.exportComments(this.commentPeriod()._id, this.projectName, 'staff');
  }
  public exportCommentsForProponents() {
    // Export comments with fields relevant to proponents to CSV
    this.toastService.info('Download Initiated');
    this.documentService.exportComments(this.commentPeriod()._id, this.projectName, 'proponent');
  }

  public downloadDocument(document) {
    return this.documentService.downloadDocument(document).then(() => {
      this.logger.debug('Download initiated for file', 'CommentPeriodDetailsTabComponent');
    });
  }

  public checkIfCanDelete() {
    this.canDeleteCommentPeriod = this.storageService.state.canDeleteCommentPeriod.data;
  }

  public onKeyDownDocument(event: KeyboardEvent, document: any) {
    void event;
    void document;
  }
}
