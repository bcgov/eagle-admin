import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivityDetailTableRowsComponent } from 'src/app/activity/activity-detail-table-rows/activity-detail-table-rows.component';
import { SearchTerms } from 'src/app/models/search';
import { StorageService } from 'src/app/services/storage.service';
import { SearchService } from 'src/app/services/search.service';
import { LoadingStateService } from 'src/app/services/loading-state.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { encodeParams } from 'src/app/shared/utils/utils';

import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-project-updates',
  templateUrl: './project-updates.component.html',
  styleUrl: './project-updates.component.css',
  imports: [
    FormsModule,
    RouterModule,
    TableTemplateComponent
  ]
})
export class ProjectUpdatesComponent implements OnInit {
  private storageService = inject(StorageService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tableTemplateUtils = inject(TableTemplateUtils);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private searchService = inject(SearchService);
  private loadingState = inject(LoadingStateService);
  private destroyRef = inject(DestroyRef);

  public terms = new SearchTerms();
  public currentProject;
  public loading = this.loadingState.getOperationState('search-results');
  public keywords;
  public tableParams: TableParamsObject = new TableParamsObject();
  public tableData: TableObject;
  public recentActivities;
  public tableColumns: TableColumn[] = [
    {
      name: 'Headline',
      value: 'headine',
      width: '80%',
      nosort: true
    },
    {
      name: 'Date',
      value: 'dateUpdated',
      width: '20%',
      nosort: true
    }
  ];

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    this.route.params.pipe(
      switchMap(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
        this.tableParams.sortBy = '-dateUpdated';

        const projectId = this.route.parent.snapshot.paramMap.get('projId');
        const pageNum = params.currentPage || 1;
        const pageSize = params.pageSize || 10;
        const sortBy = params.sortBy || '-datePosted';
        const keywords = params.keywords || '';

        return this.searchService.getSearchResults(
          keywords, 'RecentActivity',
          [{ 'name': 'project', 'value': projectId }],
          pageNum, pageSize, sortBy, {}, true, {}, ''
        );
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((data: any) => {
      if (data) {
        if (data[0].data.meta && data[0].data.meta.length > 0) {
          this.tableParams.totalListItems = data[0].data.meta[0].searchResultsTotal;
          this.recentActivities = data[0].data.searchResults;
        } else {
          this.tableParams.totalListItems = 0;
          this.recentActivities = [];
        }
        this.setRowData();
        this._changeDetectionRef.markForCheck();
      } else {
        alert('Uh-oh, couldn\'t load valued components');
        this.router.navigate(['/search']);
      }
    });
  }

  setRowData() {
    const list = [];
    if (this.recentActivities && this.recentActivities.length > 0) {
      this.recentActivities.forEach(document => {
        list.push(
          document
        );
      });
      this.tableData = new TableObject(
        ActivityDetailTableRowsComponent,
        list,
        this.tableParams
      );
    }
  }

  public onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }
    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '-datePosted';
    params['keywords'] = encodeParams(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate(['p', this.currentProject._id, 'project-updates', params]);
  }

  getPaginatedDocs(pageNumber) {
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy = '-datePosted';
    params['keywords'] = encodeParams(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize = 10;
    this.router.navigate(['p', this.currentProject._id, 'project-updates', params]);
  }

}
