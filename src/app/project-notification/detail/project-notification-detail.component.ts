import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { forkJoin } from 'rxjs';
import { ProjectNotification } from 'src/app/models/projectNotification';
import { ApiService } from 'src/app/services/api';
import { DocumentService } from 'src/app/services/document.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { StorageService } from 'src/app/services/storage.service';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-notification-project',
    standalone: true,
    imports: [RouterModule, CommonModule, NgbDropdownModule],
    templateUrl: './project-notification-detail.component.html',
    styleUrls: ['./project-notification-detail.component.css'],
    
})

export class ProjectNotificationDetailComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription = new Subscription();

  public projectNotification: ProjectNotification = null;
  public loading = false;
  public isPublished = false;
  public documents = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public api: ApiService,
    public notificationProjectService: NotificationProjectService,
    public documentService: DocumentService,
    private storageService: StorageService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.route.parent.data
        .subscribe((res: any) => {
          if (res) {
            this.projectNotification = res.notificationProject.data;
            // Set as the current project. A project notification is treated the same as a project.
            this.storageService.state.currentProject = { type: 'currentProjectNotification', data: this.projectNotification };
            if (this.projectNotification.read.includes('public')) {
              this.isPublished = true;
            }

            this.documents = res.documents[0].data.searchResults;
            this.loading = false;
            this._changeDetectorRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load notification project');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        })
    );
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

    this.subscriptions.add(
      forkJoin(observables)
        .subscribe(() => {
          this.isPublished = true;
          this.loading = false;
          this._changeDetectorRef.detectChanges();
        })
    );
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

    this.subscriptions.add(
      forkJoin(observables)
        .subscribe(() => {
          this.isPublished = false;
          this.loading = false;
          this._changeDetectorRef.detectChanges();
        })
    );
  }

  public downloadDocument(document) {
    return this.api.downloadDocument(document).then(() => {
      console.log('Download initiated for file');
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
