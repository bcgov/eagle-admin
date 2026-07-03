import { Component, OnInit, DestroyRef, input, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, UntypedFormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { DateTime } from 'luxon';
import { DatePipe } from '@angular/common';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { EditorModule } from '@tinymce/tinymce-angular';
import { SafeHtmlPipe } from 'src/app/shared/pipes/safe-html-converter.pipe';

import { CommentPeriod } from 'src/app/models/commentPeriod';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from 'src/app/shared/utils/utils';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-add-edit-comment-period',
    templateUrl: './add-edit-comment-period.component.html',
    styleUrl: './add-edit-comment-period.component.css',
    imports: [
      DatePipe,
      ReactiveFormsModule,
      FormsModule,
      RouterModule,
      NgbDatepickerModule,
      NgbTimepickerModule,
      EditorModule,
      SafeHtmlPipe
    ],
})




export class AddEditCommentPeriodComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private commentPeriodService = inject(CommentPeriodService);
  private configService = inject(ConfigService);
  private documentService = inject(DocumentService);
  private formBuilder = inject(UntypedFormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);
  storageService = inject(StorageService);
  private logger = inject(LoggingService);

  project = input.required<any>();
  commentPeriod = input<CommentPeriod>(undefined);
  public componentBaseUrl: string;
  public currentCommentPeriod = new CommentPeriod;
  public milestones: any[] = [];

  public isEditing = false;

  public infoForCommentPreview = '%information for comment%';
  public descriptionPreview = '%description%';

  public publishedState = 'unpublished';
  public commentPeriodForm: UntypedFormGroup;

  public startMeridian = true;

  public loading = true;

  public areDatesInvalid = false;

  public tinyMceSettings = {
    license_key: 'gpl',
    skin: false,
    browser_spellcheck: true,
    promotion: false,
    height: 240,
    plugins: ['lists', 'advlist', 'link'],
    toolbar: ['undo redo | formatselect | ' +
      ' bold italic backcolor | alignleft aligncenter ' +
      ' alignright alignjustify | bullist numlist outdent indent |' +
      ' removeformat | help']
  };

  ngOnInit() {
    // BUG: Go to add docs. refresh. it will redirect and have errors.
    const currentProject = this.project();

    // Set the base navigation route to use depending on if viewing a project or project notification.
    this.componentBaseUrl = this.route.snapshot.paramMap.has('projId') ? '/p' : '/pn';

    this.configService.lists.forEach(listItem => {
      if (listItem && listItem.type === 'label' && listItem.legislation === currentProject.legislationYear) {
        this.milestones.push(Object.assign({}, listItem));
      }
    });
    this.milestones.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : -1);

    // Check if we're editing
    this.route.url.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(segments => {
      segments.map(segment => {
        if (segment.path === 'edit') {
          this.isEditing = true;
          const cp = this.commentPeriod();
          if (cp) {
            this.currentCommentPeriod = cp;
            this.initSelectedDocs();
            this.initForm();
          } else {
            alert('Uh-oh, couldn\'t load comment period');
            this.router.navigate(['/search']);
          }
          this.loading = false;
        } else {
          this.initForm();
          this.loading = false;
        }
      });
    });
  }

  private initForm() {
    if (this.storageService.state.addEditCPForm == null) {
      // Prep comment period form.
      this.commentPeriodForm = new UntypedFormGroup({
        'startDate': new UntypedFormControl(),
        'startTime': new UntypedFormControl(),
        'endDate': new UntypedFormControl(),
        'endTime': new UntypedFormControl(),
        'publishedStateSel': new UntypedFormControl(),
        'infoForCommentText': new UntypedFormControl(),
        'descriptionText': new UntypedFormControl(),
        'commentTipText': new UntypedFormControl(),
        'milestoneSel': new UntypedFormControl(),
        openHouses: this.formBuilder.array([])
      });
      if (this.isEditing) {
        this.initForEditing();
      } else {
        this.commentPeriodForm.controls.startTime.setValue({ hour: 9, minute: 0 });
        this.commentPeriodForm.controls.endTime.setValue({ hour: 23, minute: 59 });
        this.addOpenHouseRow();
        if (this.storageService.state.selectedDocumentsForCP == null) {
          this.storageService.state.selectedDocumentsForCP = { type: 'selectedDocumentsForCP', data: [] };
        }
      }
    } else {
      this.commentPeriodForm = this.storageService.state.addEditCPForm.data;
    }
  }

  private initForEditing() {
    // Date started and completed
    this.commentPeriodForm.controls.startDate.setValue(
      this.currentCommentPeriod.dateStarted ? convertJSDateToNGBDate(this.currentCommentPeriod.dateStarted) : null
    );
    this.commentPeriodForm.controls.startTime.setValue(
      this.currentCommentPeriod.dateStarted
        ? { hour: this.currentCommentPeriod.dateStarted.getHours(), minute: this.currentCommentPeriod.dateStarted.getMinutes() }
        : { hour: 9, minute: 0 }
    );
    this.commentPeriodForm.controls.endDate.setValue(
      this.currentCommentPeriod.dateCompleted ? convertJSDateToNGBDate(this.currentCommentPeriod.dateCompleted) : null
    );
    this.commentPeriodForm.controls.endTime.setValue(
      this.currentCommentPeriod.dateCompleted
        ? { hour: this.currentCommentPeriod.dateCompleted.getHours(), minute: this.currentCommentPeriod.dateCompleted.getMinutes() }
        : { hour: 23, minute: 59 }
    );

    // Publish state
    this.commentPeriodForm.controls.publishedStateSel.setValue(this.currentCommentPeriod.isPublished ? 'published' : 'unpublished');

    // Instructions
    this.extractVarsFromInstructions(this.currentCommentPeriod.instructions as string, this.commentPeriodForm);

    // Comment Tip
    this.commentPeriodForm.controls.commentTipText.setValue(this.currentCommentPeriod.commentTip);

    // Milestone
    this.commentPeriodForm.controls.milestoneSel.setValue(this.currentCommentPeriod.milestone);

    // Open houses
    if (this.currentCommentPeriod.openHouses && this.currentCommentPeriod.openHouses.length > 0) {
      this.currentCommentPeriod.openHouses.map(openHouse => {
        this.addOpenHouseRowWithFields(
          this.formBuilder.group({
            eventDate: convertJSDateToNGBDate(new Date(openHouse['eventDate'])),
            description: openHouse['description']
          })
        );
      });
    } else {
      this.addOpenHouseRow();
    }
  }

  private initSelectedDocs() {
    if (this.storageService.state.selectedDocumentsForCP == null) {
      if (this.currentCommentPeriod.relatedDocuments && this.currentCommentPeriod.relatedDocuments.length > 0) {
        this.documentService.getByMultiId(this.currentCommentPeriod.relatedDocuments)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(
            data => {
              this.storageService.state.selectedDocumentsForCP = { type: 'selectedDocumentsForCP', data: data };
            }
          );
      } else {
        this.storageService.state.selectedDocumentsForCP = { type: 'selectedDocumentsForCP', data: this.currentCommentPeriod.relatedDocuments };
      }
    }
  }

  public onSubmit() {
    this.loading = true;
    // TODO: Calulator integration.
    // TODO: Custom validation for start and end date.

    // Check start and end date
    this.currentCommentPeriod.dateStarted = convertFormGroupNGBDateToJSDate(this.commentPeriodForm.get('startDate').value, this.commentPeriodForm.get('startTime').value);
    this.currentCommentPeriod.dateCompleted = convertFormGroupNGBDateToJSDate(this.commentPeriodForm.get('endDate').value, this.commentPeriodForm.get('endTime').value);
    if (DateTime.fromJSDate(this.currentCommentPeriod.dateStarted).toMillis() > DateTime.fromJSDate(this.currentCommentPeriod.dateCompleted).toMillis()) {
      this.areDatesInvalid = true;
      this.loading = false;
      return;
    } else {
      this.areDatesInvalid = false;
    }

    // Check published state
    if (this.commentPeriodForm.get('publishedStateSel').value === 'published') {
      this.currentCommentPeriod.isPublished = true;
    } else {
      this.currentCommentPeriod.isPublished = false;
    }

    // Check info for comment
    // Check description
    this.currentCommentPeriod.instructions = `Comment Period on the ${this.commentPeriodForm.get('infoForCommentText').value}`;
    this.currentCommentPeriod.instructions += ` for ${this.project().name} Project.`;

    // wrap comment header in h4 tag

    this.currentCommentPeriod.instructions = `<h4>${this.currentCommentPeriod.instructions}</h4>`;

    // add description
    this.currentCommentPeriod.instructions += ` ${this.commentPeriodForm.get('descriptionText').value === null ? '' : this.commentPeriodForm.get('descriptionText').value}`;



    // Check comment tip
    this.currentCommentPeriod.commentTip = this.commentPeriodForm.get('commentTipText').value ? this.commentPeriodForm.get('commentTipText').value : '';

    if (this.storageService.state.selectedDocumentsForCP) {
      const docIdArray = [];
      if (this.storageService.state.selectedDocumentsForCP.data) {
        this.storageService.state.selectedDocumentsForCP.data.map(element => {
          docIdArray.push(element._id);
        });
      }
      this.currentCommentPeriod.relatedDocuments = docIdArray;
    }

    // Check milestones
    this.currentCommentPeriod.milestone = this.commentPeriodForm.get('milestoneSel').value;

    // Check open house date
    this.currentCommentPeriod.openHouses = [];
    this.commentPeriodForm.get('openHouses').value.map(openHouse => {
      if (openHouse.description !== null && openHouse.eventDate !== null) {
        this.currentCommentPeriod.openHouses.push({
          description: openHouse.description,
          eventDate: convertFormGroupNGBDateToJSDate(openHouse.eventDate)
        });
      } else if (openHouse.description !== null || openHouse.eventDate !== null) {
        // TODO: We should use form errors.
        this.toastService.error('Error: Both description and event date must not be empty.');
        return;
      }
    });

    // Submit
    if (this.isEditing) {
      this.commentPeriodService.save(this.currentCommentPeriod)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: () => {
            alert('Uh-oh, couldn\'t edit comment period');
          },
          complete: () => { // onCompleted
            this.loading = false;
            this.toastService.success('This comment period was edited successfully.');
            const cpId = this.route.snapshot.paramMap.get('commentPeriodId') || this.currentCommentPeriod._id;
            this.router.navigate([this.componentBaseUrl, this.project()._id, 'cp', cpId]);
          }
        });
    } else {
      this.currentCommentPeriod.project = this.project()._id;
      this.commentPeriodService.add(this.currentCommentPeriod)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: () => {
            alert('Uh-oh, couldn\'t add new comment period');
          },
          complete: () => { // onCompleted
            this.loading = false;
            this.toastService.success('This comment period was created successfully.');
            this.router.navigate([this.componentBaseUrl, this.project()._id, 'comment-periods']);
          }
        });
    }
    this.storageService.state.selectedDocumentsForCP = null;
  }

  public onCancel() {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.storageService.state.selectedDocumentsForCP = null;
      if (this.isEditing) {
        this.router.navigate([this.componentBaseUrl, this.project()._id, 'cp', this.currentCommentPeriod._id]);
      } else {
        this.router.navigate([this.componentBaseUrl, this.project()._id, 'comment-periods']);
      }
    }
  }

  public addDocuments() {
    this.storageService.state.addEditCPForm = { type: 'addEditCPForm', data: this.commentPeriodForm };
    if (this.isEditing) {
      this.router.navigate([this.componentBaseUrl, this.currentCommentPeriod.project, 'cp', this.currentCommentPeriod._id, 'edit', 'add-documents']);
    } else {
      this.router.navigate([this.componentBaseUrl, this.project()._id, 'comment-periods', 'add', 'add-documents']);
    }
  }

  public register() {
    this.logger.debug('Successful registration', 'AddEditCommentPeriodComponent', this.commentPeriodForm.value);
  }

  private extractVarsFromInstructions(instructionString: string, form: UntypedFormGroup): void {
    if (!instructionString || (!form && !form.controls)) {
      this.logger.warn('Missing instruction string or form controls', 'AddEditCommentPeriodComponent');
      return;
    }

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = instructionString;

    const h4 = tempContainer.querySelector('h4');
    const h4Text = h4 && h4.textContent ? h4.textContent : '';

    let infoForCommentText = '';
    if (h4Text.includes(' for')) {
      infoForCommentText = h4Text
        .split(' for')[0]
        .replace('Comment Period on the ', '')
        .trim();
    } else {
      infoForCommentText = h4Text.trim();
    }

    const splitContent = instructionString.split('</h4>');
    const descriptionText = splitContent.length > 1 ? splitContent[1].trim() : '';

    if (form.controls.infoForCommentText) {
      form.controls.infoForCommentText.setValue(infoForCommentText);
    }

    if (form.controls.descriptionText) {
      form.controls.descriptionText.setValue(descriptionText);
    }

    this.updateDescriptionPreview();
  }

  private initOpenHouseRow(): UntypedFormGroup {
    return this.formBuilder.group({
      eventDate: null,
      description: null
    });
  }

  public addOpenHouseRow(): void {
    const openHouseArray = <UntypedFormArray>this.commentPeriodForm.controls['openHouses'];
    openHouseArray.push(this.initOpenHouseRow());
  }

  public addOpenHouseRowWithFields(openHouse): void {
    const openHouseArray = <UntypedFormArray>this.commentPeriodForm.controls['openHouses'];
    openHouseArray.push(openHouse);
  }

  public removeOpenHouseRow(rowIndex: number): void {
    const openHousesArray = <UntypedFormArray>this.commentPeriodForm.controls['openHouses'];
    if (openHousesArray.length > 1) {
      openHousesArray.removeAt(rowIndex);
    } else {
      alert('You cannot delete the last row.');
    }
  }

  public updateDescriptionPreview() {
    this.infoForCommentPreview = this.commentPeriodForm.get('infoForCommentText').value;
    this.descriptionPreview = this.commentPeriodForm.get('descriptionText').value;
  }

  public removeSelectedDoc(doc) {
    this.storageService.state.selectedDocumentsForCP.data = this.storageService.state.selectedDocumentsForCP.data.filter(obj => obj._id !== doc._id);
  }

}
