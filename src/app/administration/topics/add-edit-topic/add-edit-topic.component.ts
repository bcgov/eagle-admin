import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Topic } from 'app/models/topic';
import { TopicService } from 'app/services/topic.service';
import { Subject } from 'rxjs/Subject';

export interface DataModel {
  title: string;
  message: string;
  model: Topic;
}

@Component({
  templateUrl: './add-edit-topic.component.html',
  styleUrls: ['./add-edit-topic.component.scss']
})

// NOTE: dialog components must not implement OnDestroy
//       otherwise they don't return a result
export class AddEditTopicComponent extends DialogComponent<DataModel, boolean> implements DataModel, OnInit, OnDestroy {
  @Input() model: Topic;
  title: string;
  message: string;
  topic: Topic;
  isNew: boolean;
  networkMsg: string;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(dialogService: DialogService,
    public activeModal: NgbActiveModal, // also used in template
    private topicService: TopicService) {
    super(dialogService);
  }

  ngOnInit() {
    if (this.model === undefined) {
      this.isNew = true;
    } else {
      this.isNew = false;
    }
    this.topic = new Topic(this.model);
  }

  public cancelVC() {
    this.activeModal.close({
      isSaved: false,
      newTopic: null
    });
  }
  saveVC() {
    this.networkMsg = '';
    if (this.isNew) {
      this.topicService.add(this.topic)
        .subscribe(
          () => {
            this.result = true;
            this.isNew = false;
            this.activeModal.close({
              isSaved: true,
              newTopic: this.topic
            });
          },
          error => {
            console.log('error =', error);
            this.networkMsg = error;
          });
    } else {
      this.topicService.save(this.topic)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => {
            this.result = true;
            this.isNew = false;
            this.activeModal.close({
              isSaved: true,
              newTopic: this.topic
            });
          },
          error => {
            console.log('error =', error);
            this.networkMsg = error;
          });
    }
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
