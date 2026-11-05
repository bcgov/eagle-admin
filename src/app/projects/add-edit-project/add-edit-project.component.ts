import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FullProject } from 'src/app/models/fullProject';
import { Project } from 'src/app/models/project';
import { IAddEditTab } from 'src/app/models/ProjectDetails';
import { ISearchResults } from 'src/app/models/search';
import { ConfigService } from 'src/app/services/config.service';
import { StorageService } from 'src/app/services/storage.service';
import { extractFromSearchResults } from 'src/app/shared/utils/utils';
import { EDIT_TABS } from './edit-tabs';

import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-edit-project',
  templateUrl: './add-edit-project.component.html',
  styleUrl: './add-edit-project.component.css',
  imports: [
    RouterModule,
    NgbDatepickerModule,
    ReactiveFormsModule
  ]
})
export class AddEditProjectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private config = inject(ConfigService);
  private storageService = inject(StorageService);


  public tabLinks: readonly IAddEditTab[] = EDIT_TABS;
  private destroyRef = inject(DestroyRef);
  public documents: any[] = [];
  public back: any = {};
  public regions: any[] = [];
  public sectorsSelected = [];
  public proponentName = '';
  public proponentId = '';

  public projectName: string;
  public projectId: string;
  public project: Project;
  public fullProject: FullProject;
  public publishedLegislation: string;

  public pageIsEditing = false;
  public loading = true;

  ngOnInit() {
    // This is to get Region information from List (db) and put into a list(regions)
    this.config.lists.map(item => {
      switch (item.type) {
        case 'region':
          this.regions.push(item.name);
          break;
      }
    });
    //
    this.route.url
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(urls => {
        this.pageIsEditing = urls.some(url => url.path === 'edit');
        this.storageService.state.pageIsEditing = this.pageIsEditing;
      });

    this.initProject();

    // hide tabs corresponding to old legislations on new project creation
    if (!this.pageIsEditing) {
      this.tabLinks = [this.tabLinks[this.tabLinks.length - 1]];
      this.showVisibleTab(this.tabLinks[0]);
    }
    this.loading = false;
    this.back = this.storageService.state.back;
  }

  // get list of years corresponding to older legislations that are empty
  getEmptyOldYears() {
    // get list all possible years from this.tabLinks
    const years = this.tabLinks.reduce((arr: string[], value: IAddEditTab) => arr.concat(value.years), []);
    // return list of years that are both old and have no data
    return years.filter((year: string) => {
      const yearIsOld = year < this.fullProject.currentLegislationYear;
      const yearHasData = this.fullProject.legislationYearList.includes(parseInt(year.split('_')[1], 10));
      return yearIsOld && !yearHasData;
    });
  }

  initTabs() {
    const emptyOldYears = this.getEmptyOldYears();
    // hide tabs corresponding to old legislations on new project edit
    this.tabLinks = this.tabLinks.filter((tab: IAddEditTab) => {
      // keep tab if at least one if its years is not in emptyOldYears
      return tab.years.reduce((res: boolean, year: string) => Boolean(res || !emptyOldYears.includes(year)), false);
    });
  }

  // The bare edit/add URL redirects to form-2002 before the project loads; move off a tab this project hides.
  private showVisibleTab(target: IAddEditTab | undefined) {
    const active = this.route.firstChild?.snapshot.url[0]?.path;
    if (!target || !active || this.tabLinks.some(tab => tab.link === active)) {
      return;
    }
    this.router.navigate([target.link], { relativeTo: this.route, replaceUrl: true });
  }

  initProject() {
    // The tabs read every legislation_* block, so the edit page reads the resolver's full project.
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { fullProject?: ISearchResults<FullProject>[] }) => {
          this.projectId = this.route.snapshot.paramMap.get('projId');
          const fullProjectSearchData = data.fullProject ? extractFromSearchResults(data.fullProject) : null;
          this.fullProject = fullProjectSearchData ? fullProjectSearchData[0] : null;
          if (this.pageIsEditing && this.fullProject) {
            this.publishedLegislation = this.fullProject.currentLegislationYear.toString();
            if (this.publishedLegislation) {
              this.project = this.fullProject[this.publishedLegislation];
            }
            if (this.project) {
              this.storageService.state.projectDetailName = this.project.name;

              this.initTabs();
              this.showVisibleTab(this.tabLinks.find(tab => tab.years.includes(this.fullProject.currentLegislationYear)));
            }
          }
          this.loading = false;
        });
  }

}

