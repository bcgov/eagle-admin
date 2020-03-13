import { Component, OnInit } from '@angular/core';
import { DialogComponent, DialogService } from 'ng2-bootstrap-modal';
import { FormGroup, FormControl } from '@angular/forms';

export interface DataModel {
  title: string;
  message: string;
  okOnly: boolean;
}

@Component({
  templateUrl: './enter-cac-email.component.html',
  styleUrls: ['./enter-cac-email.component.scss']
})

export class EnterCACEmailComponent extends DialogComponent<DataModel, string> implements DataModel, OnInit {
  title = 'Confirm';
  message = 'Are you sure?';
  okOnly = false;
  public cacEmailForm: FormGroup;

  constructor(public dialogService: DialogService) {
    super(dialogService);
  }

  ngOnInit() {
    this.cacEmailForm = new FormGroup({
      'cacEmail': new FormControl(),
    });
  }

  confirm() {
    this.result = this.cacEmailForm.controls.cacEmail.value;
    this.close();
  }

  cancel() {
    this.result = '';
    this.close();
  }
}
