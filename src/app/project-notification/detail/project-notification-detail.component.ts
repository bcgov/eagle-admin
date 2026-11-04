import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { Observable, forkJoin } from 'rxjs';
import { finalize, switchMap, tap } from 'rxjs/operators';
import { DemiNotification, LegacyNotification, legacyNotification } from 'src/app/models/demi/notification';
import { legacyDocumentRow, sourceFilters } from 'src/app/project/project-documents/document-edit/legacy-document-row';
import { DocumentService } from 'src/app/services/document.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { DatePipe } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-notification-project',
    imports: [RouterModule, DatePipe, NgbDropdownModule],
    templateUrl: './project-notification-detail.component.html',
    styleUrl: './project-notification-detail.component.css',
    
})

export class ProjectNotificationDetailComponent implements OnInit {
  private router = inject(Router);
  notificationProjectService = inject(NotificationProjectService);
  documentService = inject(DocumentService);
  private storageService = inject(StorageService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private _cdr = inject(ChangeDetectorRef);

  public projectNotification: LegacyNotification = null;
  public loading = false;
  public isPublished = false;
  public documents = [];

  ngOnInit() {
    // ProjectNotificationComponent sets storageService.state.currentProject before
    // rendering this outlet, so no resolver is needed.
    const stored = this.storageService.state.currentProject;
    if (!stored?.data) {
      this.router.navigate(['/project-notifications']);
      return;
    }

    this.projectNotification = stored.data;
    this.storageService.state.currentProject = { type: 'currentProjectNotification', data: this.projectNotification };
    if (this.projectNotification.read?.includes('public')) {
      this.isPublished = true;
    }

    this.loading = true;
    // Notification documents store the notification id as their project.
    this.documentService.listNative({
      pageSize: 100,
      sort: '-datePosted',
      filters: sourceFilters(this.projectNotification._id, 'PROJECT-NOTIFICATION')
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: res => {
        this.documents = res.rows.map(legacyDocumentRow);
        this.loading = false;
        this._cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this._cdr.markForCheck();
      }
    });
  }

  edit() {
    this.router.navigate(['pn', this.projectNotification._id, 'edit']);
  }

  publish() {
    // Documents stay on eagle-api; one with no Eagle record cannot be written.
    this.setPublished('publish', this.notificationProjectService.publish(this.projectNotification.demiId),
      () => this.documents.filter(item => item._id).map(item => this.documentService.publish(item._id)));
  }

  unPublish() {
    this.setPublished('unpublish', this.notificationProjectService.unpublish(this.projectNotification.demiId),
      () => this.documents.filter(item => item._id).map(item => this.documentService.unPublish(item._id)));
  }

  /**
   * The notification first, its documents only once DEMI accepts it. A refused notification
   * completes empty and keeps the badge; a failed document toasts after the badge moves.
   */
  private setPublished(action: 'publish' | 'unpublish', notification: Observable<DemiNotification>,
    documents: () => Observable<unknown>[]) {
    this.loading = true;
    notification
      .pipe(
        tap(row => {
          this.projectNotification = legacyNotification(row);
          this.isPublished = row.isPublished;
          // The edit screen reads the publish state from here.
          this.storageService.state.currentProject = { type: 'currentProjectNotification', data: this.projectNotification };
        }),
        // forkJoin of no documents completes at once, with the badge already set.
        switchMap(() => forkJoin(documents())),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.loading = false;
          this._cdr.markForCheck();
        })
      )
      .subscribe({
        error: (error: Error) =>
          this.toast.error(`The notification was ${action}ed, but its documents were not. ${error.message}`)
      });
  }

  public downloadDocument(document: { id: string }) {
    return this.documentService.downloadNative(document.id);
  }

}
