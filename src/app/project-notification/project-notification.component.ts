import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { Project } from '../models/project';
import { SideBarService } from '../services/sidebar.service';


@Component({
    selector: 'app-project-notification',
    standalone: true,
    imports: [RouterModule],
    templateUrl: './project-notification.component.html',
    styleUrls: ['./project-notification.component.css'],
    
})
export class ProjectNotificationComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private sidebarService = inject(SideBarService);
  private storageService = inject(StorageService);


  private subscriptions = new Subscription();
  public project: Project = null;
  public loading = true;
  public classApplied = false;

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
