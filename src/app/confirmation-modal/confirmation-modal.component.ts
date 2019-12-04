import { Component, OnInit, SimpleChanges, HostListener } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent implements OnInit {
  public message: string;

  constructor(
    public activeModal: NgbActiveModal,
    private modalService: NgbModal

  ) { }

  ngOnInit() {
  }

  public submit(response: boolean) {
    this.activeModal.close(response);
  }
  public cancel() {
    this.activeModal.close(null);
  }

  open(message: string): NgbModalRef {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.message = message;
    return modalRef;
  }

  // Handle escape key press.
  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.cancel();
  }
}
