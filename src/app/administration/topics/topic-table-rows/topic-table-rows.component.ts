import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { AddEditTopicComponent } from '../add-edit-topic/add-edit-topic.component';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs';
import { TopicService } from 'app/services/topic.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'tbody[app-topic-table-rows]',
  templateUrl: './topic-table-rows.component.html',
  styleUrls: ['./topic-table-rows.component.scss']
})

export class TopicTableRowsComponent implements OnInit, OnDestroy, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;

  public topics: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public columns: any;
  public useSmallTable: boolean;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private dialogService: DialogService,
    private modalService: NgbModal,
    private topicService: TopicService,
  ) { }

  ngOnInit() {
    this.topics = this.data.data;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  deleteTopic(topic) {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Delete Valued Component',
        message: 'Click <strong>OK</strong> to delete this Topic or <strong>Cancel</strong> to return to the list.',
        okOnly: true,
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            // Delete the VC
            this.topicService.delete(topic)
              .subscribe(
                () => {
                  this.topics.splice(this.topics.indexOf(topic), 1);
                  this.changeDetectorRef.detectChanges();
                },
                error => {
                  console.log('error =', error);
                });
          }
        }
      );
  }

  editTopic(topic) {
    let dlg = this.modalService.open(AddEditTopicComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
    dlg.componentInstance.model = topic;
    dlg.result.then(result => {
      if (result.isSaved) {
        let newTopicArray = [];
        this.topics.filter(x => {
          if (x._id === result.newTopic._id) {
            newTopicArray.push({
              description: result.newTopic.description,
              name: result.newTopic.name,
              pillar: result.newTopic.pillar,
              type: result.newTopic.type,
              _id: result.newTopic._id
            });
          } else {
            newTopicArray.push(x);
          }
          this.topics = newTopicArray;
          this.changeDetectorRef.detectChanges();
        });
      }
    });
    return;
  }

  selectItem(item, topic) {
    switch (item) {
      case 'Edit': {
        this.editTopic(topic);
        break;
      }
      case 'Delete': {
        this.deleteTopic(topic);
        break;
      }
      default: {
        break;
      }
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
