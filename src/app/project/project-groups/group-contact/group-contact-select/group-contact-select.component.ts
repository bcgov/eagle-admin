import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchTerms } from 'src/app/models/search';
import { User } from 'src/app/models/user';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';

@Component({
  selector: 'app-group-contact-select',
  templateUrl: './group-contact-select.component.html',
  styleUrls: ['./group-contact-select.component.scss']
})
export class GroupContactSelectComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public navigationObject;

  public currentProject;
  public loading = true;
  public entries: User[] = null;
  public terms = new SearchTerms();
  public typeFilters = [];
  public selectedCount = 0;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: any[];

  constructor(
    private route: ActivatedRoute,
    public router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    public navigationStackUtils: NavigationStackUtils,
    private tableTemplateUtils: TableTemplateUtils,
    public storageService: StorageService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.tableColumns = this.storageService.state.tableColumns;

    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    } else {
      // redir to project details.
      return this.router.navigate(['/p', this.currentProject._id]);
    }

    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 25);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = this.storageService.state.sortBy;
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }
        this._changeDetectionRef.detectChanges();
      });

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          if (res.contacts && res.contacts.length > 0 && res.contacts[0].data.meta && res.contacts[0].data.meta.length > 0) {
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
          alert('Uh-oh, couldn\'t load contacts/orgs');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  setRowData() {
    const list = [];
    if (this.entries && this.entries.length > 0) {
      this.entries.map((item: any) => {
        item.checkbox = this.storageService.state.selectedUsers.some(element => {
          return item._id === element._id;
        });
        list.push(item);
      });
      this.tableData = new TableObject(
        this.storageService.state.rowComponent,
        list,
        this.tableParams
      );
    }
  }

  goBack() {
    const backUrl = this.navigationStackUtils.getLastBackUrl();
    if (backUrl === null) {
      this.router.navigate(['/p', this.currentProject._id, 'project-groups']);
    } else {
      this.navigationStackUtils.popNavigationStack();
      this.router.navigate(backUrl);
    }
  }

  save() {
    // Add these records to the group list.
    const items = [];
    this.storageService.state.selectedUsers.map((item) => {
      items.push(item);
    });

    this.storageService.state.update(items, this.storageService.state.component);
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  public selectAction(action) {
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
      case 'createContact':
        this.storageService.state.contactForm = null;
        this.storageService.state.selectedOrganization = null;

        const nextBreadcrumbs = [...this.navigationObject.breadcrumbs];
        nextBreadcrumbs.push(
          {
            route: ['/p', this.currentProject._id, 'project-groups', 'g', this.storageService.state.groupId, 'members', 'select'],
            label: 'Select Contact(s)'
          }
        );
        this.navigationStackUtils.pushNavigationStack(
          ['/p', this.currentProject._id, 'project-groups', 'g', this.storageService.state.groupId, 'members', 'select'],
          nextBreadcrumbs
        );
        this.router.navigate(['/contacts', 'add']);
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedDocs(this.tableParams.currentPage);
  }

  getPaginatedDocs(pageNumber, reset = false) {
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

    const arr = [...this.navigationObject.backUrl];
    arr.push('select');
    arr.push(params);
    this.router.navigate(arr);
  }

  removeSelectedUser(user) {
    this.storageService.state.selectedUsers = this.storageService.state.selectedUsers.filter(function (element) {
      return element._id !== user._id;
    });
    this.tableData.data.map(item => {
      if (user._id === item._id) {
        item.checkbox = false;
      }
    });
    this._changeDetectionRef.detectChanges();
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
