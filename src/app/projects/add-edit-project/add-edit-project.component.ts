import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FullProject } from 'src/app/models/fullProject';
import { Project } from 'src/app/models/project';
import { IAddEditTab } from 'src/app/models/ProjectDetails';
import { ISearchResults } from 'src/app/models/search';
import { ConfigService } from 'src/app/services/config.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectCreatedPartlyError } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { extractFromSearchResults } from 'src/app/shared/utils/utils';

import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';

export const OTHER_ACT_TAB_MESSAGE = 'Only the current Act\'s fields can be changed here';
export const NOT_LOADED_MESSAGE = 'This project could not be loaded for edit, so nothing was saved.';

// Order matters: tabs show in this order, and the add page shows only the last (newest) Act.
export const EDIT_TABS: readonly IAddEditTab[] = [
  { label: '1996/2002 Environmental Assessment Acts', link: 'form-2002', years: ['legislation_1996', 'legislation_2002'] },
  { label: '2018 Environmental Assessment Act', link: 'form-2018', years: ['legislation_2018'] },
];

// DEMI's PUT writes only the current Act's fields. With no loaded project, an edit route's Save would POST a new one.
/** Toasts and returns true when a tab must not write. */
export function refuseTabWrite(toast: ToastService, projectId: string | null, fullProject: FullProject | null, tabYear: number): boolean {
  let refusal: string | null = null;
  if (projectId && !fullProject) {
    refusal = NOT_LOADED_MESSAGE;
  } else if (projectId && fullProject.currentLegislationYear !== `legislation_${tabYear}`) {
    refusal = OTHER_ACT_TAB_MESSAGE;
  }
  if (refusal) {
    toast.error(refusal);
  }
  return refusal !== null;
}

/** A tab's handler for a failed project write: logs, then toasts the error text. */
export function projectWriteFailed(logger: LoggingService, toast: ToastService, source: string) {
  return (action: 'save' | 'publish' | 'unpublish') => (error: Error) => {
    logger.error(`Failed to ${action} project`, source, error);
    toast.error(`Failed to ${action} project. ${error.message}`);
  };
}

export const CREATE_UNKNOWN_MESSAGE = 'No answer came back, so the project may have been created. Check the project list before you try again.';
export const REENTER_FIELDS_MESSAGE = 'Enter the remaining fields again on the edit page.';

/**
 * A tab's handler for a failed create. `refused`: nothing was made. `created`: it left for the new project's edit page.
 * `unknown`: no answer came back, so the create may have gone through.
 */
export function projectCreateFailed(logger: LoggingService, toast: ToastService, router: Router, source: string) {
  const writeFailed = projectWriteFailed(logger, toast, source);
  return (action: 'save' | 'publish') => (error: Error & { status?: number }): 'refused' | 'created' | 'unknown' => {
    if (error instanceof ProjectCreatedPartlyError) {
      logger.error('Project created partly', source, error);
      toast.error(error.saved ? error.message : `${error.message}. ${REENTER_FIELDS_MESSAGE}`);
      router.navigate(['/p', error.id, 'edit']);
      return 'created';
    }
    // Status 0 is no answer at all; a gateway timeout can still commit the POST behind it.
    if (error.status === 0 || error.status === 504) {
      logger.error('Project create got no answer', source, error);
      toast.error(CREATE_UNKNOWN_MESSAGE);
      return 'unknown';
    }
    writeFailed(action)(error);
    return 'refused';
  };
}

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

