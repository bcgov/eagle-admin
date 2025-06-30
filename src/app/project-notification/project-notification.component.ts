import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { Project } from '../models/project';
import { SideBarService } from '../services/sidebar.service';

@Component({
    selector: 'app-project-notification',
    templateUrl: './project-notification.component.html',
    styleUrls: ['./project-notification.component.scss'],
    standalone: false
})
export class ProjectNotificationComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription();
  public project: Project = null;
  public loading = true;
  public classApplied = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private sidebarService: SideBarService,
    private storageService: StorageService
  ) {
  }

  toggleSideNav() {
    this.sidebarService.toggle();
    this.classApplied = !this.classApplied;
  }

  ngOnInit() {
    // get data from route resolver
    this.subscriptions.add(
      this.route.data
        .subscribe(
          (data: any) => {
            if (data.notificationProject) {
              const docMeta = data.documents[0].data.meta[0];
              const docTotal = docMeta ? docMeta.searchResultsTotal : 0;
              this.storageService.state.currentProject = { type: 'currentProjectNotification', data: data.notificationProject.data, docTotal: docTotal };
              this.loading = false;
              this._changeDetectorRef.detectChanges();
            } else {
              // project notification not found --> navigate back to search
              this.router.navigate(['/search']);
            }
          }
        )
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
