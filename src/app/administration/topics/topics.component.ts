import { ChangeDetectorRef, ChangeDetectionStrategy, Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/takeUntil';
import * as _ from 'lodash';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { TopicService } from 'app/services/topic.service';

import { TopicTableRowsComponent } from './topic-table-rows/topic-table-rows.component';
import { AddEditTopicComponent } from './add-edit-topic/add-edit-topic.component';

import { Topic } from 'app/models/topic';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';

import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-users',
  templateUrl: './topics.component.html',
  styleUrls: ['./topics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class TopicsComponent implements OnInit, OnDestroy {
  public topics: Array<Topic>;
  public loading = true;

  public topicTableData: TableObject;
  public topicTableColumns: any[] = [
    {
      name: 'Name',
      value: 'name',
      width: '30%'
    },
    {
      name: 'Description',
      value: 'description',
      width: '20%'
    },
    {
      name: 'Type',
      value: 'type',
      width: '20%'
    },
    {
      name: 'Pillar',
      value: 'pillar',
      width: '20%'
    },
    {
      name: 'Action',
      value: 'null',
      width: '10%',
      nosort: true
    }
  ];

  public tableParams: TableParamsObject = new TableParamsObject();

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private route: ActivatedRoute,
    private topicService: TopicService,
    private router: Router,
    private modalService: NgbModal,
    private tableTemplateUtils: TableTemplateUtils,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.tableParams = this.tableTemplateUtils.getParamsFromUrl(params);

      this.route.data
        .takeUntil(this.ngUnsubscribe)
        .subscribe((res: any) => {
          if (res.topics) {
            if (res.topics.data.length > 0) {
              this.tableParams.totalListItems = res.topics.totalCount;
              this.topics = res.topics.data;
            } else {
              this.tableParams.totalListItems = 0;
              this.topics = [];
            }
            this.setTopicRowData();
            this.loading = false;
            this._changeDetectionRef.detectChanges();
          } else {
            alert('Uh-oh, couldn\'t load topics');
            // project not found --> navigate back to search
            this.router.navigate(['/search']);
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
      this.tableParams
    );
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedTopics(this.tableParams.currentPage);
  }

  getPaginatedTopics(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.topicService.getAllTopics(pageNumber, this.tableParams.pageSize, this.tableParams.sortBy)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.topics = res.data;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setTopicRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  addTopic() {
    let dlg = this.modalService.open(AddEditTopicComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
    dlg.result.then(result => {
      if (result.isSaved) {
        this.getPaginatedTopics(this.tableParams.currentPage);
      }
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
