import { Component, OnInit, inject, ChangeDetectionStrategy, DestroyRef} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-add-label',
    imports: [RouterModule, ReactiveFormsModule],
    templateUrl: './add-label.component.html',
    styleUrl: './add-label.component.css',
    
})
export class AddLabelComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private storageService = inject(StorageService);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  public currentProjectId: string;
  public myForm: FormGroup<{
    doctypesel: FormControl<string | null>;
    authorsel: FormControl<string | null>;
    labelsel: FormControl<string | null>;
    milestonesel: FormControl<string | null>;
    datePosted: FormControl<string | null>;
    dateUploaded: FormControl<string | null>;
    displayName: FormControl<string | null>;
    description: FormControl<string | null>;
    projectphasesel: FormControl<string | null>;
  }>;
  public labels: any[] = [];
  public back: any = {};

  ngOnInit() {
    this.route.parent.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.currentProjectId = params.get('projId');
      });

    this.myForm = new FormGroup({
      'doctypesel': new FormControl<string | null>(null),
      'authorsel': new FormControl<string | null>(null),
      'labelsel': new FormControl<string | null>(null),
      'milestonesel': new FormControl<string | null>(null),
      'datePosted': new FormControl<string | null>(null),
      'dateUploaded': new FormControl<string | null>(null),
      'displayName': new FormControl<string | null>(null),
      'description': new FormControl<string | null>(null),
      'projectphasesel': new FormControl<string | null>(null)
    });

    this.labels = this.storageService.state.labels;
    this.back = this.storageService.state.back;
    this.logger.debug('labels loaded', 'AddLabelComponent', this.labels);
  }

  toggleSelected(label: any) {
    label.selected = !label.selected;
    this.storageService.state.labels = this.labels;
  }

  register(myForm: FormGroup) {
    this.logger.debug('Successful registration', 'AddLabelComponent', myForm.value);
  }

  cancel() {
    this.router.navigate(this.back.url);
  }
}
