import { Component, OnInit, ChangeDetectorRef, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ProjectNotification } from 'src/app/models/projectNotification';
import { DocumentService } from 'src/app/services/document.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { DatePipe } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { LoggingService } from 'src/app/services/logging.service';

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
  private searchService = inject(SearchService);
  private storageService = inject(StorageService);
  private destroyRef = inject(DestroyRef);
  private logger = inject(LoggingService);
  private _cdr = inject(ChangeDetectorRef);

  public projectNotification: ProjectNotification = null;
  public loading = false;
  public isPublished = false;
  public documents = [];

  ngOnInit() {
    // Parent component (ProjectNotificationComponent) fetches the notification and sets
    // storageService.state.currentProject before rendering the child outlet.
    // Read from there directly rather than depending on a resolver.
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
    this.searchService.getSearchResults(
      null, 'Document', [], 1, 100, '-datePosted,+displayName',
      { documentSource: 'PROJECT-NOTIFICATION', project: this.projectNotification._id }
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (searchRes: any) => {
        if (searchRes[0]?.data?.searchResults) {
          this.documents = searchRes[0].data.searchResults;
        }
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
    this.loading = true;
    const observables = [];

    // Publish the documents
    this.documents.forEach(item => {
      observables.push(this.documentService.publish(item._id));
    });

    // Publish notification project
    observables.push(this.notificationProjectService.save(this.projectNotification, true));

    forkJoin(observables)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isPublished = true;
        this.loading = false;
        this._cdr.markForCheck();
      });
  }

  unPublish() {
    this.loading = true;
    const observables = [];

    // Un-publish the documents
    this.documents.forEach(item => {
      observables.push(this.documentService.unPublish(item._id));
    });

    // Un-publish notification project
    observables.push(this.notificationProjectService.save(this.projectNotification, false));

    forkJoin(observables)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.isPublished = false;
        this.loading = false;
        this._cdr.markForCheck();
      });
  }

  public downloadDocument(document) {
    return this.documentService.downloadDocument(document).then(() => {
      this.logger.debug('Download initiated for file', 'ProjectNotificationDetailComponent');
    });
  }

}
