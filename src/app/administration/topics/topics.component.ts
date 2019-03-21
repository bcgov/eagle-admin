import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PlatformLocation } from '@angular/common';
import { DialogService } from 'ng2-bootstrap-modal';

import { Topic } from 'app/models/topic';
import { TopicService } from 'app/services/topic.service';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TopicTableRowsComponent } from './topic-table-rows/topic-table-rows.component';
import { AddEditTopicComponent } from './add-edit-topic/add-edit-topic.component';

@Component({
  selector: 'app-users',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TopicsComponent implements OnInit, OnDestroy {
  public topics: Array<Topic>;
  public topicsLoading = true;

  public topicTableData: TableObject;
  public topicTableColumns: any[] = [
    {
      name: 'Name',
      value: 'name'
    },
    {
      name: 'Description',
      value: 'description'
    },
    {
      name: 'Type',
      value: 'type'
    },
    {
      name: 'Pillar',
      value: 'pillar'
    },
    {
      name: 'Action',
      value: 'null'
    }
  ];

  public pageNum = 1;
  public pageSize = 15;
  public currentPage = 1;
  public totalTopics = 0;
  public sortBy = '';
  public sortDirection = 0;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private platformLocation: PlatformLocation,
    private route: ActivatedRoute,
    private topicService: TopicService,
    private router: Router,
    private modalService: NgbModal,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.currentPage = params.currentPage ? params.currentPage : 1;
      this.pageSize = params.pageSize || 15;
      this.topicService.getAllTopics(params.currentPage, params.pageSize)
        .takeUntil(this.ngUnsubscribe)
        .subscribe((res: any) => {
          if (res) {
            this.topicsLoading = false;
            this.totalTopics = res.totalCount;
            this.topics = res.data;
            this.setTopicRowData();
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load topics');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
            this.topicsLoading = false;
          }
        });
    });
  }

  setTopicRowData() {
    let topicList = [];
    this.topics.forEach(topic => {
      topicList.push(
        {
          name: topic.name,
          description: topic.description,
          type: topic.type,
          pillar: topic.pillar,
          _id: topic._id
        }
      );
    });
    this.topicTableData = new TableObject(
      TopicTableRowsComponent,
      topicList,
      {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        totalListItems: this.totalTopics,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection
      }
    );
  }

  setColumnSort(column) {
    this.sortBy = column;
    this.sortDirection = this.sortDirection > 0 ? -1 : 1;
    this.getPaginatedTopics(this.currentPage, this.sortBy, this.sortDirection);
  }

  getPaginatedTopics(pageNumber, sortBy, sortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);

    if (sortBy === undefined) {
      sortBy = this.sortBy;
      sortDirection = this.sortDirection;
    }

    let sorting = (sortDirection > 0 ? '+' : '-') + sortBy;

    this.topicsLoading = true;
    this.topicService.getAllTopics(pageNumber, this.pageSize, sorting)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.currentPage = pageNumber;
        this.sortBy = sortBy;
        this.sortDirection = this.sortDirection;
        this.updateUrl(sorting);
        this.totalTopics = res.totalCount;
        this.topics = res.data;
        this.topicsLoading = false;
        this.setTopicRowData();
        this._changeDetectionRef.detectChanges();
      });
  }

  updateUrl(sorting) {
    let currentUrl = this.router.url;
    currentUrl = (this.platformLocation as any).getBaseHrefFromDOM() + currentUrl.slice(1);
    currentUrl = currentUrl.split('?')[0];
    currentUrl += `?currentPage=${this.currentPage}&pageSize=${this.pageSize}`;
    currentUrl += `&sortBy=${sorting}`;
    currentUrl += '&ms=' + new Date().getTime();
    window.history.replaceState({}, '', currentUrl);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  addTopic() {
    let dlg = this.modalService.open(AddEditTopicComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
    dlg.result.then(result => {
      if (result.isSaved) {
        this.getPaginatedTopics(this.pageNum, this.sortBy, this.sortDirection);
      }
    });
  }
}
