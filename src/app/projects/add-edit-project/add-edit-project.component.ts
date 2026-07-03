import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { mergeMap } from 'rxjs/operators';
import { FullProject } from 'src/app/models/fullProject';
import { Project } from 'src/app/models/project';
import { IAddEditTab } from 'src/app/models/ProjectDetails';
import { ISearchResults } from 'src/app/models/search';
import { ConfigService } from 'src/app/services/config.service';
import { ProjectService } from 'src/app/services/project.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { extractFromSearchResults } from 'src/app/shared/utils/utils';

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
  private config = inject(ConfigService);
  projectService = inject(ProjectService);
  private searchService = inject(SearchService);
  private storageService = inject(StorageService);


  // order of items in this tabLinks array is important because it orders the tabs and for the add page we are only adding information to the newest legislations
  public tabLinks: IAddEditTab[] = [
    // If we ever need the 1996 tab this would be the logic needed
    // { label: '1996 Environmental Assessment Act', link: 'form-1996', years: ['legislation_1996']  },
    { label: '1996/2002 Environmental Assessment Acts', link: 'form-2002', years: ['legislation_1996', 'legislation_2002'] },
    { label: '2018 Environmental Assessment Act', link: 'form-2018', years: ['legislation_2018'] },
  ];
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

  initProject() {
    // When adding a new project, there's no projId — skip loading
    const projId = this.route.parent?.snapshot.paramMap.get('projId');
    if (!projId) {
      this.loading = false;
      return;
    }
    this.searchService.getSearchResults('', 'Project', [], 1, 1, '', { _id: projId }, true, {}, 'all')
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap(data => this.projectService.getPeopleObjs(data))
      )
      .subscribe((data: ISearchResults<FullProject>[]) => {
          const fullProjectSearchData = extractFromSearchResults(data);
          this.fullProject = fullProjectSearchData ? fullProjectSearchData[0] : null;
          if (this.pageIsEditing) {
            this.publishedLegislation = this.fullProject.currentLegislationYear.toString();
            if (this.publishedLegislation) {
              this.project = this.fullProject[this.publishedLegislation];
            }
            if (this.project) {
              // we don't have ids on project here, have to use id from fullProject
              this.storageService.state.projectDetailId = this.fullProject._id;
              this.storageService.state.projectDetailName = this.project.name;

              this.initTabs();
            }
          }
          this.loading = false;
        });
  }

}

