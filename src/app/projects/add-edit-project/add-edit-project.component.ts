import { Component, OnInit, DestroyRef, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, switchMap } from 'rxjs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FullProject } from 'src/app/models/fullProject';
import { LegacyProject } from 'src/app/models/demi/project-legacy';
import { Project } from 'src/app/models/project';
import { IAddEditTab } from 'src/app/models/ProjectDetails';
import { ISearchResults } from 'src/app/models/search';
import { LoggingService } from 'src/app/services/logging.service';
import { ProjectExtensionLists, ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
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
    DatePipe,
    RouterModule,
    NgbDatepickerModule,
    ReactiveFormsModule
  ]
})
export class AddEditProjectComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private projectService = inject(ProjectService);
  private logger = inject(LoggingService);
  private toast = inject(ToastService);

  public tabLinks: readonly IAddEditTab[] = EDIT_TABS;
  private destroyRef = inject(DestroyRef);
  public documents: any[] = [];
  public back: any = {};
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
  /** Extensions, then suspensions; `kind` names the list each came from. */
  public extensions = signal<ExtensionRow[]>([]);
  public extensionsFailed = signal(false);
  private extensionsOf: string | null = null;
  // switchMap drops a read for a project the page has left, so its list never lands on the next one.
  private extensionReads = new Subject<string>();

  constructor() {
    this.extensionReads.pipe(
      switchMap(demiId => this.projectService.getExtensions(demiId).pipe(
        map(lists => extensionRows(lists)),
        catchError(error => {
          this.logger.error('load extensions failed', 'AddEditProjectComponent', error);
          this.toast.error(`Failed to load extensions. ${error.message}`);
          return of(null);
        })
      )),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(rows => {
      this.extensionsFailed.set(rows === null);
      this.extensions.set(rows ?? []);
    });
  }

  ngOnInit() {
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

  // The bare edit URL shows no tab, and the bare add URL redirects to form-2002: open `target` then, or when the open tab is hidden.
  private showVisibleTab(target: IAddEditTab | undefined) {
    // A child route still activating has no `snapshot` yet; the snapshot tree always has it.
    const active = this.route.snapshot.firstChild?.url[0]?.path;
    if (!target || (active && this.tabLinks.some(tab => tab.link === active))) {
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

              this.loadExtensions((this.project as LegacyProject).demiId);
              this.initTabs();
              this.showVisibleTab(this.tabLinks.find(tab => tab.years.includes(this.fullProject.currentLegislationYear)));
            }
          }
          this.loading = false;
        });
  }

  addExtension(kind: ExtensionKind) {
    this.router.navigate(['/p', this.projectId, 'edit', `add-${kind.toLowerCase()}`]);
  }

  // The extension screen reads the picked item from storage, with the project it belongs to; its Delete is there too.
  editExtension(item: ExtensionRow) {
    this.storageService.state.extension = { ...item, projectId: this.projectId };
    this.router.navigate(['/p', this.projectId, 'edit', `edit-${item.kind.toLowerCase()}`]);
  }

  retryExtensions() {
    this.extensionReads.next(this.extensionsOf);
  }

  // The resolver runs again on every tab change; read the lists once per project.
  private loadExtensions(demiId: string | undefined) {
    if (!demiId || demiId === this.extensionsOf) {
      return;
    }
    this.extensionsOf = demiId;
    this.extensions.set([]);
    this.extensionsFailed.set(false);
    this.extensionReads.next(demiId);
  }
}

type ExtensionKind = 'Extension' | 'Suspension';
type ExtensionRow = ProjectExtensionLists['reviewExtensions'][number] & { kind: ExtensionKind };

const extensionRows = (lists: ProjectExtensionLists): ExtensionRow[] => [
  ...(lists.reviewExtensions ?? []).map(item => ({ ...item, kind: 'Extension' as const })),
  ...(lists.reviewSuspensions ?? []).map(item => ({ ...item, kind: 'Suspension' as const }))
];

