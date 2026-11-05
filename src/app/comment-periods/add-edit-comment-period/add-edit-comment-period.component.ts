import { Component, OnInit, ChangeDetectorRef, DestroyRef, input, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, UntypedFormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { DateTime } from 'luxon';
import { DatePipe } from '@angular/common';
import { NgbDatepickerModule, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { EditorModule } from '@tinymce/tinymce-angular';
import { SafeHtmlPipe } from 'src/app/shared/pipes/safe-html-converter.pipe';

import { CommentPeriod } from 'src/app/models/commentPeriod';
import { LegacyCommentPeriod } from '../comment-period-legacy';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { legacyDocumentRow } from 'src/app/project/project-documents/document-edit/legacy-document-row';
import { StorageService } from 'src/app/services/storage.service';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate, isNgbDate, routeParentId } from 'src/app/shared/utils/utils';
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
  private cdr = inject(ChangeDetectorRef);

  project = input.required<any>();
  commentPeriod = input<LegacyCommentPeriod>(undefined);
  public componentBaseUrl: string;
  public currentCommentPeriod: CommentPeriod | LegacyCommentPeriod = new CommentPeriod;
  /** `:projId` or `:notificationProjectId`; `project()._id` is null on a DEMI-minted project. */
  private parentId: string;
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
    this.parentId = routeParentId(this.route.snapshot.paramMap);

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
          if (cp?.readOnly) {
            this.toastService.error('This comment period cannot be edited here.');
            this.router.navigate([this.componentBaseUrl, this.parentId, 'cp', cp._id]);
          } else if (cp) {
            this.currentCommentPeriod = cp;
            this.initSelectedDocs();
            this.initForm();
          } else {
            this.toastService.error('Could not load the comment period.');
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
        this.documentService.byIdsNative(this.currentCommentPeriod.relatedDocuments)
          .pipe(map(rows => rows.map(legacyDocumentRow)), takeUntilDestroyed(this.destroyRef))
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
    // A copy, so a refused write leaves the loaded period as it is stored.
    const draft: CommentPeriod & Partial<LegacyCommentPeriod> = { ...this.currentCommentPeriod };

    draft.dateStarted = convertFormGroupNGBDateToJSDate(this.commentPeriodForm.get('startDate').value, this.commentPeriodForm.get('startTime').value);
    draft.dateCompleted = convertFormGroupNGBDateToJSDate(this.commentPeriodForm.get('endDate').value, this.commentPeriodForm.get('endTime').value);
    if (DateTime.fromJSDate(draft.dateStarted).toMillis() > DateTime.fromJSDate(draft.dateCompleted).toMillis()) {
      this.areDatesInvalid = true;
      this.loading = false;
      return;
    } else {
      this.areDatesInvalid = false;
    }

    draft.isPublished = this.commentPeriodForm.get('publishedStateSel').value === 'published';

    const descriptionText = this.commentPeriodForm.get('descriptionText').value;
    draft.instructions = `<h4>Comment Period on the ${this.commentPeriodForm.get('infoForCommentText').value} for ${this.project().name} Project.</h4>`
      + ` ${descriptionText === null ? '' : descriptionText}`;

    draft.commentTip = this.commentPeriodForm.get('commentTipText').value || '';

    if (this.storageService.state.selectedDocumentsForCP) {
      draft.relatedDocuments = (this.storageService.state.selectedDocumentsForCP.data ?? []).map(element => element._id);
    }

    draft.milestone = this.commentPeriodForm.get('milestoneSel').value;

    // A row left wholly blank is dropped; a half-filled one, or one with a date that does not parse, stops the submit.
    const openHouses = this.commentPeriodForm.get('openHouses').value
      .filter(openHouse => openHouse.description?.trim() || openHouse.eventDate);
    if (openHouses.some(openHouse => !openHouse.description?.trim() || !isNgbDate(openHouse.eventDate))) {
      this.toastService.error('Each open house needs a description and a valid event date.');
      this.loading = false;
      return;
    }
    draft.openHouses = openHouses
      .map(openHouse => ({ description: openHouse.description.trim(), eventDate: convertFormGroupNGBDateToJSDate(openHouse.eventDate) }));

    // The service has shown why a write failed; the form stays open for another try.
    const failed = (error: { saved?: boolean }) => {
      if (error?.saved) {
        // The fields landed; only the published state did not.
        const fields: Partial<CommentPeriod> = { ...draft };
        delete fields.isPublished;
        Object.assign(this.currentCommentPeriod, fields);
      }
      this.loading = false;
      this.cdr.markForCheck();
    };
    const saved = (message: string, route: string[]) => () => {
      Object.assign(this.currentCommentPeriod, draft);
      this.storageService.state.selectedDocumentsForCP = null;
      this.toastService.success(message);
      this.router.navigate([this.componentBaseUrl, this.parentId, ...route]);
    };
    if (this.isEditing) {
      const publish = draft.isPublished === this.currentCommentPeriod.isPublished ? undefined : draft.isPublished;
      const cpId = this.route.snapshot.paramMap.get('commentPeriodId') || draft._id;
      this.commentPeriodService.save(draft as LegacyCommentPeriod, publish)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: saved('This comment period was edited successfully.', ['cp', cpId]), error: failed });
    } else {
      this.commentPeriodService.add(draft, this.project().demiId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: saved('This comment period was created successfully.', ['comment-periods']), error: failed });
    }
  }

  public onCancel() {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.storageService.state.selectedDocumentsForCP = null;
      if (this.isEditing) {
        this.router.navigate([this.componentBaseUrl, this.parentId, 'cp', this.currentCommentPeriod._id]);
      } else {
        this.router.navigate([this.componentBaseUrl, this.parentId, 'comment-periods']);
      }
    }
  }

  public addDocuments() {
    this.storageService.state.addEditCPForm = { type: 'addEditCPForm', data: this.commentPeriodForm };
    if (this.isEditing) {
      this.router.navigate([this.componentBaseUrl, this.parentId, 'cp', this.currentCommentPeriod._id, 'edit', 'add-documents']);
    } else {
      this.router.navigate([this.componentBaseUrl, this.parentId, 'comment-periods', 'add', 'add-documents']);
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
    openHousesArray.removeAt(rowIndex);
  }

  public updateDescriptionPreview() {
    this.infoForCommentPreview = this.commentPeriodForm.get('infoForCommentText').value;
    this.descriptionPreview = this.commentPeriodForm.get('descriptionText').value;
  }

  public removeSelectedDoc(doc) {
    this.storageService.state.selectedDocumentsForCP.data = this.storageService.state.selectedDocumentsForCP.data.filter(obj => obj._id !== doc._id);
  }

}
