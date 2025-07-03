import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Project } from '../models/project';
import { ISearchResults } from '../models/search';
import { SideBarService } from '../services/sidebar.service';
import { StorageService } from '../services/storage.service';
import { Utils } from '../shared/utils/utils';

import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-project',
    templateUrl: './project.component.html',
    styleUrls: ['./project.component.css'],
    standalone: true,
    imports: [RouterModule],
})
export class ProjectComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private _changeDetectorRef = inject(ChangeDetectorRef);
  private sidebarService = inject(SideBarService);
  private utils = inject(Utils);
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
          (data: { project: ISearchResults<Project>[] }) => {
            if (data.project) {
              const projectSearchData = this.utils.extractFromSearchResults(data.project);
              this.project = projectSearchData ? projectSearchData[0] : null;
              this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
              this.loading = false;
              this._changeDetectorRef.detectChanges();
            } else {
              alert('Uh-oh, couldn\'t load project');
              // project not found --> navigate back to search
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
