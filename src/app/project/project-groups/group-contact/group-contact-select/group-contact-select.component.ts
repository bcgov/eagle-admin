import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { User } from 'app/models/user';
import { SearchTerms } from 'app/models/search';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { ActivatedRoute, Router } from '@angular/router';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { StorageService } from 'app/services/storage.service';
import { Org } from 'app/models/org';

@Component({
  selector: 'app-group-contact-select',
  templateUrl: './group-contact-select.component.html',
  styleUrls: ['./group-contact-select.component.scss']
})
export class GroupContactSelectComponent implements OnInit, OnDestroy {
  public currentProject;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
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
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils,
    public storageService: StorageService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.tableColumns = this.storageService.state.tableColumns;

    if (this.storageService.state.back === undefined) {
      // redir to project details.
      return this.router.navigate(['/p', this.currentProject._id]);
    }

    this.route.params
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 25);
        if (this.tableParams.sortBy === '') {
          // this.tableParams.sortBy = '+displayName';
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

  goToItem(route) {
    this.router.navigate(['/projects']);
  }

  setRowData() {
    let list = [];
    if (this.entries && this.entries.length > 0) {
      this.entries.forEach((item: any) => {
        // Switch between the two contact/org components.
        this.storageService.state.componentModel === 'User' ? list.push(new User(item)) : list.push(new Org(item));
      });
      this.tableData = new TableObject(
        this.storageService.state.rowComponent,
        list,
        this.tableParams
      );
    }
  }

  goBack() {
    if (this.storageService.state.back && this.storageService.state.back.url) {
      this.router.navigate(this.storageService.state.back.url);
    } else {
      this.router.navigate(['/p', this.currentProject._id, 'project-groups']);
    }
  }

  save() {
    // Add these records to the group list.
    let items = [];
    this.tableData.data.map((item) => {
      if (item.checkbox === true) {
        items.push(item);
      }
    });

    if (items.length > 0) {
      this.storageService.state.add(items, this.storageService.state.component);
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
      case 'createContact':
        this.storageService.state.editGroupBackUrl = ['/p', this.currentProject._id, 'project-groups', 'g', this.storageService.state.groupId, 'members', 'select'];
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
      // this.filter.dateAddedStart = '';
      // this.filter.dateAddedEnd = '';
      this.typeFilters = [];
    }

    params['sortBy'] = this.tableParams.sortBy;
    params['pageSize'] = this.tableParams.pageSize;
    params['keywords'] = this.tableParams.keywords;
    // params['dateAddedStart'] = this.utils.convertFormGroupNGBDateToJSDate(this.filter.dateAddedStart).toISOString();
    // params['dateAddedEnd'] = this.utils.convertFormGroupNGBDateToJSDate(this.filter.dateAddedEnd).toISOString();
    if (this.typeFilters.length > 0) { params['type'] = this.typeFilters.toString(); }

    let arr = [];
    this.storageService.state.back.url.map(u => {
      arr.push(u);
    });
    arr.push('select');
    arr.push(params);
    this.router.navigate(arr);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
