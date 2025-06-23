import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FullProject } from 'src/app/models/fullProject';
import { Project } from 'src/app/models/project';
import { IAddEditTab } from 'src/app/models/ProjectDetails';
import { ISearchResults } from 'src/app/models/search';
import { ConfigService } from 'src/app/services/config.service';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
  selector: 'app-add-edit-project',
  templateUrl: './add-edit-project.component.html',
  styleUrls: ['./add-edit-project.component.scss']
})
export class AddEditProjectComponent implements OnInit, OnDestroy {

  // order of items in this tabLinks array is important because it orders the tabs and for the add page we are only adding information to the newest legislations
  public tabLinks: IAddEditTab[] = [
    // If we ever need the 1996 tab this would be the logic needed
    // { label: '1996 Environmental Assessment Act', link: 'form-1996', years: ['legislation_1996']  },
    { label: '1996/2002 Environmental Assessment Acts', link: 'form-2002', years: ['legislation_1996', 'legislation_2002'] },
    { label: '2018 Environmental Assessment Act', link: 'form-2018', years: ['legislation_2018'] },
  ];
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
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

  constructor(
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
    private config: ConfigService,
    public projectService: ProjectService,
    private storageService: StorageService,
    private utils: Utils
  ) {
  }

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
      return tab.years.reduce((res: Boolean, year: string) => Boolean(res || !emptyOldYears.includes(year)), false);
    });
  }

  initProject() {
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((data: { fullProject: ISearchResults<FullProject>[] }) => {
        const fullProjectSearchData = this.utils.extractFromSearchResults(data.fullProject);
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

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  register() { }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
