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
      value: 'headline',
      width: '80%'
    },
    {
      name: 'Date',
      value: 'dateAdded',
      width: '20%'
    }
  ];

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    this.route.params.pipe(
      switchMap(params => {
        this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);
        if (this.tableParams.sortBy === '') {
          this.tableParams.sortBy = '-dateAdded';
        }

        const projectId = this.route.parent.snapshot.paramMap.get('projId');
        const keywords = params.keywords || '';

        return this.searchService.getSearchResults(
          keywords, 'RecentActivity',
          [{ 'name': 'project', 'value': projectId }],
          this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.sortBy, {}, true, {}, ''
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

  setColumnSort(column: string) {
    this.tableParams.sortBy = (this.tableParams.sortBy === '+' + column ? '-' : '+') + column;
    this.onSubmit();
  }

  public onSubmit(pageNumber = 1) {
    // Router ignores navigation to the same URL; the timestamp forces a reload.
    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = pageNumber;
    params['sortBy'] = this.tableParams.sortBy;
    params['keywords'] = encodeParams(this.tableParams.keywords = this.keywords || '');
    params['pageSize'] = this.tableParams.pageSize;
    this.router.navigate(['p', this.currentProject._id, 'project-updates', params]);
  }

}
