import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableParamsObject } from '../table-template/table-params-object';
import { TableObject } from '../table-template/table-object';
import { ActivatedRoute, Router } from '@angular/router';
import { Org } from 'src/app/models/org';
import { SearchTerms } from 'src/app/models/search';
import { User } from 'src/app/models/user';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from '../../utils/navigation-stack-utils';
import { TableTemplateUtils } from '../../utils/table-template-utils';

@Component({
  selector: 'app-contact-select',
  templateUrl: './contact-select.component.html',
  styleUrls: ['./contact-select.component.scss']
})
export class ContactSelectComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();
  public loading = true;
  public entries: User[] = null;
  public terms = new SearchTerms();
  public typeFilters = [];
  public selectedCount = 0;
  public navigationObject;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: 'Name',
      value: 'lastName,+firstName',
      width: '25%'
    },
    {
      name: 'Organization',
      value: 'orgName',
      width: '25%'
    },
    {
      name: 'Email',
      value: 'email',
      width: '25%'
    },
    {
      name: 'Phone Number',
      value: 'phoneNumber',
      width: '25%'
    }
  ];
  constructor(
    public navigationStackUtils: NavigationStackUtils,
    private route: ActivatedRoute,
    public router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils,
    public storageService: StorageService
  ) { }

  ngOnInit() {
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    } else {
      // TODO: determine where to boot out.
      this.router.navigate(['/']);
    }

    this.subscriptions.add(
      this.route.params.subscribe(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 25);
        if (this.tableParams.sortBy === '' && this.storageService.state.sortBy) {
          this.tableParams.sortBy = this.storageService.state.sortBy;
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }
        this.subscriptions.add(
          this.route.data.subscribe((res: any) => {
            if (res) {
              if (res.contacts && res.contacts.length > 0 && res.contacts[0].data.meta && res.contacts[0].data.meta.length > 0) {
                this.tableParams.totalListItems = res.contacts[0].data.meta[0].searchResultsTotal;
                this.entries = res.contacts[0].data.searchResults;
              } else {
                this.tableParams.totalListItems = 0;
                this.entries = [];
              }
              this.setRowData();
            } else {
              alert('Uh-oh, couldn\'t load contacts/orgs');
              // project not found --> navigate back to search
              this.router.navigate(['/search']);
            }
            this._changeDetectionRef.detectChanges();
            this.loading = false;
          })
        );
      })
    );
  }

  setRowData() {
    const list = [];
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
    const url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
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
    this.getPaginatedDocs(this.tableParams.currentPage);
  }

  getPaginatedDocs(pageNumber, reset = false) {
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
    arr.push('link-contact');
    arr.push(params);
    this.router.navigate(arr);
  }

  createContact() {
    this.storageService.state.contactForm = null;
    this.storageService.state.selectedOrganization = null;

    const nextBreadcrumbs = [...this.navigationObject.breadcrumbs];
    const nextRoute = [...this.navigationObject.breadcrumbs[this.navigationObject.breadcrumbs.length - 1].route];
    nextRoute.push('link-contact');
    nextRoute.push({ 'pageSize': 25 });
    nextBreadcrumbs.push(
      {
        route: nextRoute,
        label: 'Select Contact'
      }
    );
    this.navigationStackUtils.pushNavigationStack(
      nextRoute,
      nextBreadcrumbs
    );
    this.router.navigate(['/contacts', 'add']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
