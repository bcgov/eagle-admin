import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Project } from 'app/models/project';
import { Subject } from 'rxjs';
import { SideBarService } from 'app/services/sidebar.service';
import { StorageService } from 'app/services/storage.service';
import { Utils } from 'app/shared/utils/utils';
import { ISearchResult, ISearchResults } from 'app/models/search';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit, OnDestroy {

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public project: Project = null;
  public loading = true;
  public classApplied = false;
  public publishedLegislation = '2002'; // todo: this shouldn't be hardcoded.


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private sidebarService: SideBarService,
    private utils: Utils,
    private storageService: StorageService
  ) {
  }

  toggleSideNav() {
    this.sidebarService.toggle();
    this.classApplied = !this.classApplied;
  }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        (data: { project: ISearchResults<Project>[] }) => {
          if (data.project) {
            const projectSearchData = this.utils.extractFromSearchResults(data.project);
            this.project = projectSearchData ? projectSearchData[0][this.publishedLegislation] : null;
            this.storageService.state.currentProject = { type: 'currentProject', data: this.project };
            this.loading = false;
            this._changeDetectorRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load project');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        }
      );
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
