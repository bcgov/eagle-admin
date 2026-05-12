import { Component, inject, ChangeDetectionStrategy} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { FormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-input-modal',
    templateUrl: './input-modal.component.html',
    styleUrl: './input-modal.component.css',
    host: { '(document:keydown.escape)': 'onKeydownHandler()' },
    imports: [
    FormsModule
]
})
export class InputModalComponent {
  activeModal = inject(NgbActiveModal);


  groupName = '';

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
  onKeydownHandler() {
    this.cancel();
  }
}
