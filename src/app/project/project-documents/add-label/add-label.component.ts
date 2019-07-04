import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, FormArray, NgForm, ReactiveFormsModule } from '@angular/forms';

import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'app-add-label',
  templateUrl: './add-label.component.html',
  styleUrls: ['./add-label.component.scss']
})
export class AddLabelComponent implements OnInit {
  public currentProjectId: string;
  public myForm: FormGroup;
  public labels: any[] = [];
  public back: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.route.parent.paramMap.subscribe(params => {
      this.currentProjectId = params.get('projId');
    });

    this.myForm = new FormGroup({
      'doctypesel': new FormControl(),
      'authorsel': new FormControl(),
      'labelsel': new FormControl(),
      'milestonesel': new FormControl(),
      'datePosted': new FormControl(),
      'dateUploaded': new FormControl(),
      'displayName': new FormControl(),
      'description': new FormControl(),
      'projectphasesel': new FormControl()
    });

    this.labels = this.storageService.state.labels;
    this.back = this.storageService.state.back;
    console.log('labels:', this.labels);
  }

  toggleSelected(label: any) {
    label.selected = !label.selected;
    this.storageService.state.labels = this.labels;
  }

  register (myForm: FormGroup) {
    console.log('Successful registration');
    console.log(myForm);
  }

  cancel() {
    this.router.navigate(this.back.url);
  }
}
