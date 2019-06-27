import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { ActivatedRoute, Router } from '@angular/router';

import { StorageService } from 'app/services/storage.service';
import { SearchTerms } from 'app/models/search';
import { User } from 'app/models/user';
import { GroupsTableRowsComponent } from './project-groups-table-rows/project-groups-table-rows.component';

@Component({
  selector: 'app-project-groups',
  templateUrl: './project-groups.component.html',
  styleUrls: ['./project-groups.component.scss']
})
export class ProjectGroupsComponent implements OnInit, OnDestroy {
  public currentProject;
  readonly tabLinks = [
    { label: 'Contacts', link: 'project-groups' },
    { label: 'Participating Indigenous Nations', link: 'project-pins' }
  ];
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loading = true;
  public entries: User[] = null;
  public terms = new SearchTerms();
  public typeFilters = [];
  public selectedCount = 0;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Name',
      value: 'displayName',
      width: 'col-3'
    },
    {
      name: 'Organization',
      value: 'org.name',
      width: 'col-4'
    },
    {
      name: 'Email',
      width: 'col-5',
      nosort: true
    }
  ];
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    this.route.params
    .takeUntil(this.ngUnsubscribe)
    .subscribe(params => {
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 25);
      if (this.tableParams.sortBy === '') {
        this.tableParams.sortBy = '-dateAdded';
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
      }
      this._changeDetectionRef.detectChanges();
    });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          if (res.contacts[0].data.meta && res.contacts[0].data.meta.length > 0) {
            this.tableParams.totalListItems = res.contacts[0].data.meta[0].searchResultsTotal;
            this.entries = res.contacts[0].data.searchResults;
          } else {
            this.tableParams.totalListItems = 0;
            this.entries = [];
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

  setBackURL() {
    this.storageService.state.back = { url: ['/p', this.currentProject._id, 'project-groups'], label: 'Groups' };
    this.storageService.state.add = this.add;
    this.storageService.state.existing = this.entries;
    this.storageService.state.component = this;
    this.storageService.state.componentModel = 'User';
    this.storageService.state.tableColumns = this.tableColumns;
    this.storageService.state.rowComponent = GroupsTableRowsComponent;
    this.storageService.state.sortBy = this.tableParams.sortBy;
  }

  setRowData() {
    let list = [];
    if (this.entries && this.entries.length > 0) {
      this.entries.forEach((item: any) => {
        list.push(new User(item.contact));
      });
      this.tableData = new TableObject(
        GroupsTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  public selectAction(action) {
    let promises = [];

    // select all documents
    switch (action) {
      case 'selectAll':
        let someSelected = false;
        this.tableData.data.map((item) => {
          if (item.checkbox === true) {
            someSelected = true;
          }
        });
        this.tableData.data.map((item) => {
          item.checkbox = !someSelected;
        });

        this.selectedCount = someSelected ? 0 : this.tableData.data.length;
        this._changeDetectionRef.detectChanges();
        break;
      }
    }

  isEnabled(button) {
    return this.selectedCount > 0;
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    // this.onSubmit(this.tableParams.currentPage);
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
    alert('not implemented');
    // Add all the filtered new items.
    // component.projectService.addPins(component.currentProject, filteredPins)
    // // .takeUntil(component.ngUnsubscribe)
    // .subscribe(
    //   () => { // onCompleted
    //     // this.loading = false;
    //     // this.router.navigated = false;
    //     // this.openSnackBar('This project was created successfuly.', 'Close');
    //     component.router.navigate(['/p', component.currentProject._id, 'project-pins']);
    //   },
    //   error => {
    //     console.log('error =', error);
    //     alert('Uh-oh, couldn\'t edit project');
    //   },
    // );
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
      this.tableParams.pageSize = 25;
      this.tableParams.keywords = '';
      this.typeFilters = [];
    }

    params['sortBy'] = this.tableParams.sortBy;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = this.tableParams.keywords;
    if (this.typeFilters.length > 0) { params['type'] = this.typeFilters.toString(); }

    this.router.navigate(['p', this.currentProject._id, 'project-groups', params]);
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
