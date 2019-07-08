import { Component, OnInit, SimpleChanges, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Dictionary } from 'lodash';
import * as moment from 'moment';
import { Utils } from 'app/shared/utils/utils';

@Component({
  selector: 'app-input-modal',
  templateUrl: './input-modal.component.html',
  styleUrls: ['./input-modal.component.scss']
})
export class InputModalComponent implements OnInit {

  groupName = '';

  constructor(
    public activeModal: NgbActiveModal, // also used in template
    private utils: Utils
  ) { }

  ngOnInit() {
  }

  public cancel() {
    this.activeModal.close(null);
  }

  reset() {
    this.groupName = '';
  }

  save() {
    this.activeModal.close(this.groupName);
  }

  // Handle escape key press.
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.cancel();
  }
}
