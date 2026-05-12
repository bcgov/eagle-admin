import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TableParamsObject } from '../table-template/table-params-object';
import { TableObject, TableColumn } from '../table-template/table-object';
import { ActivatedRoute, Router } from '@angular/router';
import { Org } from 'src/app/models/org';
import { SearchTerms } from 'src/app/models/search';
import { User } from 'src/app/models/user';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from '../../utils/navigation-stack-utils';
import { TableTemplateUtils } from '../../utils/table-template-utils';
import { SearchService } from 'src/app/services/search.service';
import { LoadingStateService } from 'src/app/services/loading-state.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableTemplateComponent } from '../table-template/table-template.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-contact-select',
  templateUrl: './contact-select.component.html',
  styleUrl: './contact-select.component.css',
  imports: [
    FormsModule,
    RouterModule,
    TableTemplateComponent
  ]
})
export class ContactSelectComponent implements OnInit {
  navigationStackUtils = inject(NavigationStackUtils);
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private tableTemplateUtils = inject(TableTemplateUtils);
  storageService = inject(StorageService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);
  private loadingState = inject(LoadingStateService);

  public loading = this.loadingState.getOperationState('search-results');
  public entries: User[] = null;
  public terms = new SearchTerms();
  public typeFilters = [];
  public selectedCount = 0;
  public navigationObject;

  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public tableColumns: TableColumn[] = [
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

  ngOnInit() {
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    } else {
      // TODO: determine where to boot out.
      this.router.navigate(['/']);
    }

    this.route.params.pipe(
      switchMap(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params, null, 25);
        if (this.tableParams.sortBy === '' && this.storageService.state.sortBy) {
          this.tableParams.sortBy = this.storageService.state.sortBy;
          this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize, null, this.tableParams.keywords);
        }
        return this.searchService.getSearchResults(
          this.tableParams.keywords || '', 'User', null,
          this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.sortBy,
          {}, false, {}, ''
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((res: any) => {
      if (res && res.length > 0 && res[0].data.meta && res[0].data.meta.length > 0) {
        this.tableParams.totalListItems = res[0].data.meta[0].searchResultsTotal;
        this.entries = res[0].data.searchResults;
      } else {
        this.tableParams.totalListItems = 0;
        this.entries = [];
      }
      this.setRowData();
      this._changeDetectionRef.markForCheck();
    });
  }

  setRowData() {
    const list = [];
    if (this.entries && this.entries.length > 0) {
      this.entries.forEach((item: any) => {
        if (this.storageService.state.componentModel === 'User') {
          list.push(new User(item));
        } else {
          list.push(new Org(item));
        }
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
    this._changeDetectionRef.markForCheck();

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

}
