import { Component, OnInit, inject, DestroyRef, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { skip, switchMap, tap } from 'rxjs/operators';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';

import { PinsTableRowsComponent } from './pins-table-rows/pins-table-rows.component';
import { Org } from 'src/app/models/org';
import { SearchTerms } from 'src/app/models/search';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-pins-list',
  imports: [
    RouterModule,
    TableTemplateComponent
  ],
  templateUrl: './pins-list.component.html',
  styleUrl: './pins-list.component.css',

})
export class PinsListComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private toastService = inject(ToastService);
  private navigationStackUtils = inject(NavigationStackUtils);
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private tableTemplateUtils = inject(TableTemplateUtils);
  public logger = inject(LoggingService);
  public currentProject;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public entries: Org[] = null;
  public terms = new SearchTerms();
  public searchForm = null;
  public typeFilters = [];
  public loading = true;
  public filterPublicCommentPeriod = false;
  public filterNews = false;
  public selectedCount = 0;
  public pinsPublished = false;

  public tableColumns: TableColumn[] = [
    {
      name: 'Name',
      value: 'name',
      width: '65%'
    },
    {
      name: 'Province',
      value: 'province',
      width: '25%'
    },
    {
      name: 'Delete',
      value: 'delete',
      width: '10%',
      nosort: true
    },
  ];
  constructor() {
    this.entries = [];
  }

  ngOnInit() {
    this.loading = true;
    this.currentProject = this.storageService.currentProjectData ?? null;
    this.storageService.state.selectedUsers = null;

    // params subscription: keeps tableParams in sync AND re-fetches data on re-navigation.
    // skip(1): first emit is the initial load — route.data resolver handles that.
    // Subsequent emits (ms-param navigation after add/delete) trigger a fresh API fetch
    // because Angular Router won't re-run resolvers on same-route matrix-param changes.
    this.route.params
      .pipe(
        tap(params => {
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 10);
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '+name';
          }
        }),
        skip(1),
        switchMap(() => {
          this.loading = true;
          this.cdr.markForCheck();
          return this.projectService.getPins(
            this.currentProject._id,
            this.tableParams.currentPage,
            this.tableParams.pageSize,
            this.tableParams.sortBy
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (contacts: any) => {
          this.processContacts(contacts);
        },
        error: err => {
          this.logger.error('getPins re-fetch failed', 'PinsListComponent', err);
          this.loading = false;
          this.cdr.markForCheck();
        }
      });

    // data subscription: resolver pre-fetches contacts before component activates
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.processContacts(res?.contacts);
      });
  }
  isEnabled() {
    return this.selectedCount > 0;
  }

  private processContacts(contacts: any) {
    this.entries = [];
    if (contacts && contacts.length > 0 && contacts[0]?.results) {
      if (contacts[0].read.includes('public')) {
        this.pinsPublished = true;
      }
      contacts[0].results.forEach(contact => this.entries.push(new Org(contact)));
      this.tableParams.totalListItems = contacts[0].total_items;
    } else {
      this.tableParams.totalListItems = 0;
    }
    this.setRowData();
    this.loading = false;
    this.cdr.markForCheck();
  }
  setPinsPublished(publish: boolean) {
    if (this.currentProject && this.currentProject._id) {
      this.loading = true;
      const action = publish ? this.projectService.publishPins(this.currentProject._id) : this.projectService.unpublishPins(this.currentProject._id);
      action.subscribe(res => {
        this.loading = false;
        this.cdr.markForCheck();
        if (res) {
          this.pinsPublished = publish;
          const msg = publish ? 'Participating Indigenous Nations Published Successfully!' : 'Participating Indigenous Nations Unpublished Successfully!';
          this.toastService.success(msg);
        } else {
          const msg = publish ? 'Error on publishing Participating Indigenous Nations, please try again later' : 'Error on unpublishing Participating Indigenous Nations, please try again later';
          this.toastService.error(msg);
        }
      });
    } else {
      this.toastService.error('Invalid Project, please try again!');
    }
  }
  setRowData() {
    if (this.entries && this.entries.length > 0) {
      this.tableData = new TableObject(
        PinsTableRowsComponent,
        [...this.entries],
        this.tableParams
      );

      if (this.currentProject && this.currentProject._id) {
        this.tableData.extraData = { projectId: this.currentProject._id };
      }
    }
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.onSubmit(this.tableParams.currentPage);
  }

  // Called via storage service in shared module.
  add(contacts, component) {
    const filteredPins = contacts
      .filter((thing) => component.entries.findIndex((t) => t._id === thing._id) === -1)
      .map((thing) => thing._id);

    if (filteredPins.length === 0) {
      component.router.navigate(['/p', component.currentProject._id, 'project-pins', { ms: Date.now() }]);
      return;
    }

    component.projectService.addPins(component.currentProject, filteredPins)
    .subscribe({
      next: () => {
        component.router.navigate(['/p', component.currentProject._id, 'project-pins', { ms: Date.now() }]);
      },
      error: (error) => {
        component.logger.error('addPins failed', 'PinsListComponent', error);
        alert('Uh-oh, couldn\'t edit project');
      }
    });
  }

  setBackURL() {
    this.storageService.state.add = this.add;
    this.storageService.state.component = this;
    this.storageService.state.componentModel = 'Org';
    this.storageService.state.existing = this.entries;
    this.storageService.state.tableColumns = this.tableColumns;
    this.storageService.state.rowComponent = PinsTableRowsComponent;
    this.storageService.state.sortBy = this.tableParams.sortBy;
    // todo: fix storage service goofiness below, orgs being stored in key for users
    this.storageService.state.selectedUsers = [...this.entries];
    // setting this key turns on checkboxes on the link-org component
    this.storageService.state.showOrgTableCheckboxes = true;

    this.navigationStackUtils.pushNavigationStack(
      ['/p', this.currentProject._id, 'project-pins'],
      [
        {
          route: ['/projects'],
          label: 'All Projects'
        },
        {
          route: ['/p', this.currentProject._id],
          label: this.currentProject.name
        },
        {
          route: ['/p', this.currentProject._id, 'project-pins'],
          label: 'Participating Indigenous Nations'
        }
      ]
    );
    this.router.navigate(['/p', this.currentProject._id, 'project-pins', 'select', { pageSize: 10 }]);
  }

  public onSubmit(pageNumber = 1, reset = false) {
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time
    this.loading = true;

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;

    if (reset) {
      this.tableParams.sortBy = '';
      this.tableParams.pageSize = 10;
      this.tableParams.keywords = '';
      this.typeFilters = [];
    }

    params['sortBy'] = this.tableParams.sortBy;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = this.tableParams.keywords;
    if (this.typeFilters.length > 0) { params['type'] = this.typeFilters.toString(); }

    this.router.navigate(['p', this.currentProject._id, 'project-pins', params]);
  }

  public toggleFilter(filterItem) {
    if (this.typeFilters.includes(filterItem)) {
      this.typeFilters = this.typeFilters.filter(item => item !== filterItem);
    } else {
      this.typeFilters.push(filterItem);
    }
  }
}

