import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface DataModel {
  title: string;
  message: string;
  okOnly?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-confirm',
    templateUrl: './confirm.component.html',
    styleUrl: './confirm.component.css',
    
})
export class ConfirmComponent {
  activeModal = inject(NgbActiveModal);

  title: string;
  message: string;
  okOnly: boolean;

  confirm() {
    this.activeModal.close(true);
  }

  cancel() {
    this.activeModal.dismiss(false);
  }
}
