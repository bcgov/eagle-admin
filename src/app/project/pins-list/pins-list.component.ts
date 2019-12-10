import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';

import { RecentActivity } from 'app/models/recentActivity';

import { PinsTableRowsComponent } from './pins-table-rows/pins-table-rows.component';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { SearchTerms } from 'app/models/search';
import { StorageService } from 'app/services/storage.service';
import { Org } from 'app/models/org';
import { ProjectService } from 'app/services/project.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

@Component({
  selector: 'app-pins-list',
  templateUrl: './pins-list.component.html',
  styleUrls: ['./pins-list.component.scss']
})
export class PinsListComponent implements OnInit, OnDestroy {
  public currentProject;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loading = true;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public entries: Org[] = null;
  public terms = new SearchTerms();
  public searchForm = null;
  public typeFilters = [];
  public filterPublicCommentPeriod = false;
  public filterNews = false;
  public selectedCount = 0;
  public pinsPublished = false;

  public tableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Name',
      value: 'name',
      width: 'col-8'
    },
    {
      name: 'Province',
      value: 'province',
      width: 'col-4'
    }
  ];
  constructor(
    private route: ActivatedRoute,
    private storageService: StorageService,
    private dialogService: DialogService,
    private navigationStackUtils: NavigationStackUtils,
    private projectService: ProjectService,
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils,
  ) {
    this.entries = [];
  }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.storageService.state.selectedUsers = null;

    this.route.params
    .takeUntil(this.ngUnsubscribe)
    .subscribe(params => {
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 10);
      if (this.tableParams.sortBy === '') {
        this.tableParams.sortBy = '+name';
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
      }
      this._changeDetectionRef.detectChanges();
    });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.entries = [];
          if (res.contacts && res.contacts.length > 0 && res.contacts[0].results) {

            res.contacts[0].results.map(contact => {
              this.entries.push(new Org(contact));
            });
            this.tableParams.totalListItems = res.contacts[0].length;
          } else {
            this.tableParams.totalListItems = 0;
          }
          this.setRowData();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load valued components');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  public selectAction(action) {
    // select all documents
    switch (action) {
      case 'delete':
        this.deleteItems();
        break;
      case 'selectAll':
        let someSelected = false;
        this.tableData.data.map((item) => {
          if (item.checkbox === true) {
            someSelected = true;
          }
          item.checkbox = !someSelected;
        });

        this.selectedCount = someSelected ? 0 : this.tableData.data.length;
        this._changeDetectionRef.detectChanges();
        break;
    }
  }

  deleteItems() {
    let projectId = this.currentProject._id;
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Delete PIN',
        message: 'Click <strong>OK</strong> to delete this Participating Indigenous Nation or <strong>Cancel</strong> to return to the list.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.loading = true;
            // Delete the Document(s)
            let itemsToDelete = [];
            this.tableData.data.map((item) => {
              if (item.checkbox === true) {
                itemsToDelete.push({ promise: this.projectService.deletePin(projectId, item._id).toPromise(), item: item });
              }
            });
            this.loading = false;
            return Promise.all(itemsToDelete).then(() => {
              // Reload main page.
              this.onSubmit();
            });
          }
          this.loading = false;
        }
      );
  }

  isEnabled(button) {
    return this.selectedCount > 0;
  }
  publishPins() {
    // TODO: Publish all pins in list logic
  }
  unpublishPins() {
    // TODO: UnPublish all pins in list logic
  }
  setRowData() {
    let list = [];
    if (this.entries && this.entries.length > 0) {
      this.entries.forEach(item => {
        list.push(item);
      });
      this.tableData = new TableObject(
        PinsTableRowsComponent,
        list,
        this.tableParams
      );
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
    let filteredPins = [];
    contacts.filter((thing) => {
      let idx = component.entries.findIndex((t) => {
        return (t._id === thing._id);
      });
      if (idx === -1) {
        filteredPins.push(thing._id);
      }
    });
    // Add all the filtered new items.
    component.projectService.addPins(component.currentProject, filteredPins)
    .takeUntil(component.ngUnsubscribe)
    .subscribe(
      () => { // onCompleted
        // this.loading = false;
        // this.router.navigated = false;
        // this.openSnackBar('This project was created successfuly.', 'Close');
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
    this.storageService.state.selectedUsers = [...this.entries];

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
    this.router.navigate(['/p', this.currentProject._id, 'project-pins', 'select', { pageSize: 25 }]);
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}

