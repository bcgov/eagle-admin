import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/concat';

import { ApiService } from 'app/services/api';
import { NotificationProjectService } from 'app/services/notification-project.service';
import { DocumentService } from 'app/services/document.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-notification-project',
  templateUrl: './notification-project.component.html',
  styleUrls: ['./notification-project.component.scss']
})

export class NotificationProjectComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public notificationProject = null;
  public loading = false;
  public isPublished = false;
  public documents = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public api: ApiService,
    public notificationProjectService: NotificationProjectService,
    public documentService: DocumentService,
    private _changeDetectorRef: ChangeDetectorRef,
  ) { }

  ngOnInit() {
    this.route.parent.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.notificationProject = res.notificationProject.data;
          if (this.notificationProject.read.includes('public')) {
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
      });
  }

  edit() {
    this.router.navigate(['np', this.notificationProject._id, 'edit']);
  }

  publish() {
    this.loading = true;
    let observables = [];

    // Publish the documents
    this.documents.forEach(item => {
      observables.push(this.documentService.publish(item._id));
    });

    // Publish notification project
    observables.push(this.notificationProjectService.save(this.notificationProject, true));

    forkJoin(observables)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.isPublished = true;
        this.loading = false;
        this._changeDetectorRef.detectChanges();
      });
  }

  unPublish() {
    this.loading = true;
    let observables = [];

    // Un-publish the documents
    this.documents.forEach(item => {
      observables.push(this.documentService.unPublish(item._id));
    });

    // Un-publish notification project
    observables.push(this.notificationProjectService.save(this.notificationProject, false));

    forkJoin(observables)
      .takeUntil(this.ngUnsubscribe)
      .subscribe(() => {
        this.isPublished = false;
        this.loading = false;
        this._changeDetectorRef.detectChanges();
      });
  }

  public downloadDocument(document) {
    return this.api.downloadDocument(document).then(() => {
      console.log('Download initiated for file');
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
