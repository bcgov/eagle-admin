import { Component, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PinsTableRowsComponent } from './pins-table-rows/pins-table-rows.component';
import { Org } from 'src/app/models/org';
import { SearchTerms } from 'src/app/models/search';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pins-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TableTemplateComponent
  ],
  templateUrl: './pins-list.component.html',
  styleUrls: ['./pins-list.component.css'],

})
export class PinsListComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private snackBar = inject(MatSnackBar);
  private navigationStackUtils = inject(NavigationStackUtils);
  private projectService = inject(ProjectService);
  private router = inject(Router);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private tableTemplateUtils = inject(TableTemplateUtils);

  private subscriptions = new Subscription();
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

  public tableColumns: any[] = [
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
    this.currentProject = this.storageService.state.currentProject.data;
    this.storageService.state.selectedUsers = null;

    this.subscriptions.add(
      this.route.params
        .subscribe(params => {
          this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 10);
          if (this.tableParams.sortBy === '') {
            this.tableParams.sortBy = '+name';
            this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
          }
          this._changeDetectionRef.detectChanges();
        })
    );

    this.subscriptions.add(
      this.route.data
        .subscribe((res: any) => {
          if (res) {
            this.entries = [];
            if (res.contacts && res.contacts.length > 0 && res.contacts[0].results) {
              if (res.contacts[0].read.includes('public')) {
                this.pinsPublished = true;
              }
              res.contacts[0].results.map(contact => {
                this.entries.push(new Org(contact));
              });
              this.tableParams.totalListItems = res.contacts[0].total_items;
            } else {
              this.tableParams.totalListItems = 0;
            }
            this.setRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            this.loading = false;
            alert('Uh-oh, couldn\'t load valued components');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
          }
        })
    );
  }
  isEnabled() {
    return this.selectedCount > 0;
  }
  publishPins() {
    if (this.currentProject && this.currentProject._id) {
      this.loading = true;
      this.subscriptions.add(
        this.projectService.publishPins(this.currentProject._id)
          .subscribe(res => {
            if (res) {
              // We assuming the publish action was successful
              this.loading = false;
              this.openSnackBar('Participating Indigenous Nations Published Successfully!', 'Close');
              this.pinsPublished = true;
            } else {
              this.loading = false;
              this.openSnackBar('Error on publishing Participating Indigenous Nations, please try again later', 'Close');
            }
          })
      );
    } else {
      this.openSnackBar('Invalid Project, please try again!', 'Close');
      // Error
    }
  }
  unpublishPins() {
    if (this.currentProject && this.currentProject._id) {
      this.loading = true;
      this.subscriptions.add(
        this.projectService.unpublishPins(this.currentProject._id)
          .subscribe(res => {
            if (res) {
              this.loading = false;
              this.openSnackBar('Participating Indigenous Nations Unpublished Successfully!', 'Close');
              this.pinsPublished = false;
            } else {
              this.loading = false;
              this.openSnackBar('Error on unpublishing Participating Indigenous Nations, please try again later', 'Close');
            }
          })
      );
    } else {
      // Error
      this.openSnackBar('Invalid Project, please try again!', 'Close');
    }
  }
  setRowData() {
    const list = [];
    if (this.entries && this.entries.length > 0) {
      this.entries.forEach(item => {
        list.push(item);
      });
      this.tableData = new TableObject(
        PinsTableRowsComponent,
        list,
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
    const filteredPins = [];
    contacts.filter((thing) => {
      const idx = component.entries.findIndex((t) => {
        return (t._id === thing._id);
      });
      if (idx === -1) {
        filteredPins.push(thing._id);
      }
    });
    // Add all the filtered new items.
    component.projectService.addPins(component.currentProject, filteredPins)
      .subscribe(
        () => {
          component.router.navigate(['/p', component.currentProject._id, 'project-pins']);
        },
        error => {
          console.log('error =', error);
          alert('Uh-oh, couldn\'t edit project');
        },
      );
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
    this._changeDetectionRef.detectChanges();

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
  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}

