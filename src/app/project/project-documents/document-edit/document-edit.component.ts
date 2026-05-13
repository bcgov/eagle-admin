import { Component, OnInit, inject, computed, DestroyRef, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbDateStruct, NgbDate, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { forkJoin } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { DateTime } from 'luxon';
import { ToastService } from 'src/app/services/toast.service';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from 'src/app/shared/utils/utils';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-document-edit',
  imports: [RouterModule, NgbDatepickerModule, ReactiveFormsModule],
  templateUrl: './document-edit.component.html',
  styleUrl: './document-edit.component.css',

})
export class DocumentEditComponent implements OnInit {
  private configService = inject(ConfigService);
  private documentService = inject(DocumentService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private storageService = inject(StorageService);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  private readonly lists = this.configService.listsSignal;

  public readonly filteredDoctypes2002 = computed(() =>
    this.lists().filter(i => i.type === 'doctype' && i.legislation === 2002)
      .sort((a, b) => a.listOrder - b.listOrder)
  );
  public readonly filteredDoctypes2018 = computed(() =>
    this.lists().filter(i => i.type === 'doctype' && i.legislation === 2018)
      .sort((a, b) => a.listOrder - b.listOrder)
  );
  public readonly filteredAuthors2002 = computed(() =>
    this.lists().filter(i => i.type === 'author' && i.legislation === 2002)
  );
  public readonly filteredAuthors2018 = computed(() =>
    this.lists().filter(i => i.type === 'author' && i.legislation === 2018)
  );
  public readonly filteredLabels2002 = computed(() =>
    this.lists().filter(i => i.type === 'label' && i.legislation === 2002)
      .sort((a, b) => a.listOrder - b.listOrder)
  );
  public readonly filteredLabels2018 = computed(() =>
    this.lists().filter(i => i.type === 'label' && i.legislation === 2018)
      .sort((a, b) => a.listOrder - b.listOrder)
  );
  public readonly filteredProjectPhases2002 = computed(() =>
    this.lists().filter(i => i.type === 'projectPhase' && i.legislation === 2002)
      .sort((a, b) => a.listOrder - b.listOrder)
  );
  public readonly filteredProjectPhases2018 = computed(() =>
    this.lists().filter(i => i.type === 'projectPhase' && i.legislation === 2018)
      .sort((a, b) => a.listOrder - b.listOrder)
  );
  public readonly allLabels = computed(() =>
    this.lists().filter(i => i.type === 'label')
  );

  public documents: any[] = [];
  public currentProject;
  public myForm: UntypedFormGroup;
  public datePosted: NgbDateStruct = null;
  public isPublished = false;
  public loading = true;
  public multiEdit = false;
  public docNameInvalid = false;
  public dateInvalid = false;
  public legislationYear = '1996';

  ngOnInit() {
    this.documents = this.storageService.state.selectedDocs;
    this.currentProject = this.storageService.currentProjectData;
    this.logger.debug('documents loaded', 'DocumentEditComponent', this.documents);
    // Check if documents are null (nav straight to this page)
    if (!this.documents || this.documents.length === 0) {
      this.router.navigate(['p', this.currentProject._id, 'project-documents']);
    } else {
      this.legislationYear = this.documents[0].legislation ? this.documents[0].legislation.toString() : this.legislationYear;
      this.buildForm();
      this.configService.ensureListsLoaded();
      this.populateForm();
    }
  }

  buildForm() {
    this.myForm = new UntypedFormGroup({
      'docLegislationRadio': new UntypedFormControl(this.legislationYear),
      'doctypesel': new UntypedFormControl(),
      'authorsel': new UntypedFormControl(),
      'labelsel': new UntypedFormControl(),
      'datePosted': new UntypedFormControl(),
      'displayName': new UntypedFormControl(),
      'description': new UntypedFormControl(),
      'projectphasesel': new UntypedFormControl()
    });
  }

  populateForm() {
    if (this.documents.length === 1) {
      // todo: figure out publish see barakas code
      this.isPublished = this.documents[0].read.includes('public');

      // Set the old data in there if it exists.
      if (this.documents[0].type) { this.myForm.controls.doctypesel.setValue(this.documents[0].type); }
      if (this.documents[0].documentAuthorType) { this.myForm.controls.authorsel.setValue(this.documents[0].documentAuthorType); }
      if (this.documents[0].milestone) { this.myForm.controls.labelsel.setValue(this.documents[0].milestone); }
      if (this.documents[0].datePosted) { this.myForm.controls.datePosted.setValue(convertJSDateToNGBDate(new Date(this.documents[0].datePosted))); }
      if (this.documents[0].displayName) { this.myForm.controls.displayName.setValue(this.documents[0].displayName); }
      if (this.documents[0].description) { this.myForm.controls.description.setValue(this.documents[0].description); }
      if (this.documents[0].projectPhase) { this.myForm.controls.projectphasesel.setValue(this.documents[0].projectPhase); }
      // init docNameInvalid
      this.validateDate();
      this.validateChars();
    } else {
      this.multiEdit = true;
    }
    if (this.storageService.state.labels) {
      // this.labels = this.storageService.state.labels;
    }
    this.logger.debug('form initialized', 'DocumentEditComponent', this.myForm.value);
    this.loading = false;
  }

  public changeLegislation(event) {
    this.legislationYear = event.target.value;

    this.myForm.controls.doctypesel.setValue(null);
    this.myForm.controls.authorsel.setValue(null);
    this.myForm.controls.labelsel.setValue(null);
    this.myForm.controls.projectphasesel.setValue(null);
  }

  goBack() {
    if (this.storageService.state.back && this.storageService.state.back.url) {
      this.router.navigate(this.storageService.state.back.url);
    } else {
      this.router.navigate(['/p', this.currentProject._id, 'project-documents']);
    }
  }

  public validateDate() {
    if (!DateTime.fromJSDate(convertFormGroupNGBDateToJSDate(this.myForm.value.datePosted)).isValid) {
      this.dateInvalid = true;
    } else {
      this.dateInvalid = false;
    }
  }

  public validateChars() {
    if (this.myForm.value.displayName && this.myForm.value.displayName.match(/[\/|\\:*?"<>]/g)) {
      this.docNameInvalid = true;
    } else {
      this.docNameInvalid = false;
    }
  }

  // on multi edit save, check if form fields have a value
  multiEditGetUpdatedValue(formValue: string | NgbDate, docValue, isDate = false) {
    if (formValue !== null) {
      if (isDate) {
        return DateTime.fromJSDate(convertFormGroupNGBDateToJSDate(formValue)).toUTC().toISO();
      } else {
        return formValue;
      }
    } else {
      return docValue;
    }
  }

  applyChangesIfAny(formData: FormData, fieldName: string, formValue: string | NgbDate, docValue, isDate = false): void {
    const value = this.multiEditGetUpdatedValue(formValue, docValue, isDate);
    if (value) {
      formData.append(fieldName, value);
    }
  }

  save() {
    this.loading = true;

    // Save all the elements to all the documents.
    this.logger.debug('saving documents', 'DocumentEditComponent', this.myForm.value);
    // go through and upload one at a time.
    const observables = [];

    const theLabels = this.allLabels().filter(label => {
      return label.selected === true;
    });

    this.documents.map(doc => {
      const formData = new FormData();
      formData.append('project', this.currentProject._id);
      formData.append('documentSource', 'PROJECT');

      if (!this.multiEdit) {
        if (doc.documentFileName) { formData.append('documentFileName', doc.documentFileName); }
        if (this.myForm.value.description) { formData.append('description', this.myForm.value.description); }
        if (this.myForm.value.displayName) { formData.append('displayName', this.myForm.value.displayName); }

        formData.append('milestone', this.myForm.value.labelsel);
        formData.append('datePosted', DateTime.fromJSDate(convertFormGroupNGBDateToJSDate(this.myForm.get('datePosted').value)).toUTC().toISO());
        formData.append('type', this.myForm.value.doctypesel);
        formData.append('documentAuthorType', this.myForm.value.authorsel);
        formData.append('projectPhase', this.myForm.value.projectphasesel);
      } else {
        this.applyChangesIfAny(formData, 'documentFileName', null, doc.documentFileName);
        this.applyChangesIfAny(formData, 'displayName', null, doc.displayName);
        this.applyChangesIfAny(formData, 'description', null, doc.description);
        this.applyChangesIfAny(formData, 'type', this.myForm.value.doctypesel, doc.type);
        this.applyChangesIfAny(formData, 'documentAuthorType', this.myForm.value.authorsel, doc.documentAuthorType);
        this.applyChangesIfAny(formData, 'milestone', this.myForm.value.labelsel, doc.milestone);
        this.applyChangesIfAny(formData, 'projectPhase', this.myForm.value.projectphasesel, doc.projectPhase);
        this.applyChangesIfAny(formData, 'datePosted', this.myForm.value.datePosted, doc.datePosted, true);
      }

      // TODO
      formData.append('labels', JSON.stringify(theLabels));
      formData.append('legislation', this.legislationYear);
      observables.push(this.documentService.update(formData, doc._id));
    });

    // multi edit should not be set to false
    // it caused a bug where extra fields show up after saving, and could null out document names
    // this.multiEdit = false;

    this.storageService.state = { type: 'form', data: null };
    this.storageService.state = { type: 'documents', data: null };
    this.storageService.state = { type: 'labels', data: null };

    forkJoin(observables)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(
        (d) => {
          this.storageService.state.selectedDocs = d;
        },
        error => {
          const message = (error.error && error.error.message) ? error.error.message : 'Could not upload document';
          this.toastService.error(message);
          this.loading = false;
        },
        () => {
          this.storageService.state = { type: 'documents', data: this.storageService.state.selectedDocs };
          this.goBack();
        }
      );
  }

  addLabels() {
    this.logger.debug('adding labels', 'DocumentEditComponent');
    this.storageService.state = { type: 'form', data: this.myForm };
    this.storageService.state = { type: 'labels', data: this.allLabels() };
    this.storageService.state.back = { url: ['/p', this.currentProject._id, 'project-documents', 'edit'], label: 'Edit Document(s)' };
    this.router.navigate(['/p', this.currentProject._id, 'project-documents', 'edit', 'add-label']);
  }

  public togglePublish() {
    this.isPublished = !this.isPublished;
    const observables = [];
    this.documents.map(doc => {
      if (this.isPublished) {
        observables.push(this.documentService.publish(doc._id));
      } else {
        observables.push(this.documentService.unPublish(doc._id));
      }
      forkJoin(observables)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(
          () => {},
          error => {
            this.logger.error('update document publish status failed', 'DocumentEditComponent', error);
            alert('Uh-oh, couldn\'t update document\'s publish status');
          },
          () => {
            this.save();
            if (this.isPublished) {
              this.toastService.success('This document has been published.');
            } else {
              this.toastService.success('This document has been unpublished.');
            }
          }
        );
    });
  }

  register(myForm: UntypedFormGroup) {
    this.logger.debug('Successful registration', 'DocumentEditComponent', myForm.value);
  }

}
