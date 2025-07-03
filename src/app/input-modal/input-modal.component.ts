import { Component, HostListener } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-input-modal',
    templateUrl: './input-modal.component.html',
    styleUrls: ['./input-modal.component.css'],
    standalone: true,
    imports: [
    FormsModule
]
})
export class InputModalComponent {

  groupName = '';

  constructor(
    public activeModal: NgbActiveModal // also used in template
  ) { }

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
