import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { TableObject } from 'app/shared/components/table-template/table-object';

import { TopicService } from 'app/services/topic.service';
import { ValuedComponentService } from 'app/services/valued-component.service';
import { StorageService } from 'app/services/storage.service';

import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

import { Topic } from 'app/models/topic';

import { ValuedComponent } from 'app/models/valuedComponent';
import { TopicTableRowsComponent } from './topic-table-rows/topic-table-rows.component';


@Component({
  selector: 'app-add-vc',
  templateUrl: './add-vc.component.html',
  styleUrls: ['./add-vc.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddVcComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public topics: Topic[] = null;
  public currentProject;
  public tableParams: TableParamsObject = new TableParamsObject();
  public loading = true;
  public selectedCount = 0;

  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: '10%',
      nosort: true
    },
    {
      name: 'Name',
      value: 'name',
      width: '20%'
    },
    {
      name: 'Description',
      value: 'description',
      width: '40%'
    },
    {
      name: 'Type',
      value: 'type',
      width: '10%'
    },
    {
      name: 'Pillar',
      value: 'pillar',
      width: '10%'
    },
    {
      name: 'Parent',
      value: 'parent',
      width: '10%',
      nosort: true
    }
  ];

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils,
    private topicService: TopicService,
    private valuedComponentService: ValuedComponentService
  ) { }

  ngOnInit() {
    // This page always renders full list.
    this.tableParams.pageSize = 1000;

    this.currentProject = this.storageService.state.currentProject.data;

    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.tableParams.totalListItems = res.topics.totalCount;
          if (this.tableParams.totalListItems > 0) {
            this.topics = res.topics.data;
          } else {
            this.tableParams.totalListItems = 0;
            this.topics = [];
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

  updateSelectedRow(count) {
    this.selectedCount = count;
  }

  public selectAction(action) {
    // select all valuedComponents
    switch (action) {
      case 'save':
        // Save the new topic to the project's vc list.
        let itemsToAdd = [];
        this.tableData.data.map((item) => {
          if (item.checkbox === true) {
            let vc = new ValuedComponent(item);
            // Move _id to topic for linking to original.
            vc.topic = vc._id;
            delete vc._id;
            vc.project = this.currentProject._id;
            vc.title = vc.description;
            itemsToAdd.push({ promise: this.valuedComponentService.addToProject(vc).toPromise(), item: item });
          }
        });
        this.loading = false;
        return Promise.all(itemsToAdd).then(() => {
          // Back to vc page.
          this.router.navigate(['p', this.currentProject._id, 'valued-components']);
        });
        break;
      case 'cancel':
        this.router.navigate(['p', this.currentProject._id, 'valued-components']);
        break;
    }
  }

  setRowData() {
    let topicList = [];
    if (this.topics && this.topics.length > 0) {
      this.topics.forEach(topic => {
        topicList.push(
          {
            _id: topic._id,
            name: topic.name,
            description: topic.description,
            type: topic.type,
            pillar: topic.pillar,
            parent: topic.parent === 0 ? 'None' : topic.parent
          }
        );
      });
      this.tableData = new TableObject(
        TopicTableRowsComponent,
        topicList,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginated(this.tableParams.currentPage);
  }

  getPaginated(pageNumber) {
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
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
