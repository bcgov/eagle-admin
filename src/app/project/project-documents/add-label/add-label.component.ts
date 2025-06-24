import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-add-label',
  templateUrl: './add-label.component.html',
  styleUrls: ['./add-label.component.scss']
})
export class AddLabelComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public currentProjectId: string;
  public myForm: UntypedFormGroup;
  public labels: any[] = [];
  public back: any = {};

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.route.parent.paramMap
      .takeUntil(this.ngUnsubscribe)
      .subscribe(params => {
        this.currentProjectId = params.get('projId');
      });

    this.myForm = new UntypedFormGroup({
      'doctypesel': new UntypedFormControl(),
      'authorsel': new UntypedFormControl(),
      'labelsel': new UntypedFormControl(),
      'milestonesel': new UntypedFormControl(),
      'datePosted': new UntypedFormControl(),
      'dateUploaded': new UntypedFormControl(),
      'displayName': new UntypedFormControl(),
      'description': new UntypedFormControl(),
      'projectphasesel': new UntypedFormControl()
    });

    this.labels = this.storageService.state.labels;
    this.back = this.storageService.state.back;
    console.log('labels:', this.labels);
  }

  toggleSelected(label: any) {
    label.selected = !label.selected;
    this.storageService.state.labels = this.labels;
  }

  register(myForm: UntypedFormGroup) {
    console.log('Successful registration');
    console.log(myForm);
  }

  cancel() {
    this.router.navigate(this.back.url);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
