import { Component, Input, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

export interface DataModel {
  title: string;
  message: string;
  okOnly?: boolean;
}

@Component({
    selector: 'app-confirm',
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.css'],
    
})
export class ConfirmComponent {
  activeModal = inject(NgbActiveModal);

  @Input() title: string;
  @Input() message: string;
  @Input() okOnly: boolean;

  confirm() {
    this.activeModal.close(true);
  }

  cancel() {
    this.activeModal.dismiss(false);
  }
}
