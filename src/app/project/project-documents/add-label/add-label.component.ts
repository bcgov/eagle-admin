import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UntypedFormGroup, UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-add-label',
    standalone: true,
    imports: [RouterModule, ReactiveFormsModule],
    templateUrl: './add-label.component.html',
    styleUrls: ['./add-label.component.css'],
    
})
export class AddLabelComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);

  private subscriptions = new Subscription();
  public currentProjectId: string;
  public myForm: UntypedFormGroup;
  public labels: any[] = [];
  public back: any = {};

  ngOnInit() {
    this.subscriptions.add(
      this.route.parent.paramMap
        .subscribe(params => {
          this.currentProjectId = params.get('projId');
        })
    );

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
    this.subscriptions.unsubscribe();
  }
}
