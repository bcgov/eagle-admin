import { Component, OnInit, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-input-modal',
  templateUrl: './input-modal.component.html',
  styleUrls: ['./input-modal.component.scss']
})
export class InputModalComponent implements OnInit {

  groupName = '';

  constructor(
    public activeModal: NgbActiveModal // also used in template
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
  @HostListener('document:keydown.escape', []) onKeydownHandler() {
    this.cancel();
  }
}
