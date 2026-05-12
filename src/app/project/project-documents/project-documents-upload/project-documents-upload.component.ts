import { Component, OnInit, inject, computed, DestroyRef, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { NgbDateStruct, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DateTime } from 'luxon';
import { ToastService } from 'src/app/services/toast.service';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { convertFormGroupNGBDateToJSDate } from 'src/app/shared/utils/utils';
import { Document } from 'src/app/models/document';
import { FileUploadComponent } from 'src/app/file-upload/file-upload.component';
import { ReactiveFormsModule } from '@angular/forms';
import { LoggingService } from 'src/app/services/logging.service';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-project-documents-upload',
  imports: [FileUploadComponent, NgbDatepickerModule, ReactiveFormsModule, RouterModule],
  templateUrl: './project-documents-upload.component.html',
  styleUrl: './project-documents-upload.component.css',

})
export class ProjectDocumentsUploadComponent implements OnInit {
  private router = inject(Router);
  private storageService = inject(StorageService);
  private toastService = inject(ToastService);
  private documentService = inject(DocumentService);
  private configService = inject(ConfigService);
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

  public currentProject;
  public projectFiles: Array<File> = [];
  public documents: Document[] = [];
  public datePosted: NgbDateStruct = null;
  public dateUploaded: NgbDateStruct = null;
  public myForm: UntypedFormGroup;
  public docNameInvalid = false;
  public legislationYear = '2018';
  public publishDoc = false;
  public uploadInProgress = false;

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    this.buildForm();
    this.configService.ensureListsLoaded();
  }

  buildForm() {
    this.myForm = new UntypedFormGroup({
      'docLegislationRadio': new UntypedFormControl(this.legislationYear),
      'doctypesel': new UntypedFormControl(),
      'authorsel': new UntypedFormControl(),
      'labelsel': new UntypedFormControl(),
      'datePosted': new UntypedFormControl(),
      'dateUploaded': new UntypedFormControl(),
      'displayName': new UntypedFormControl(),
      'description': new UntypedFormControl(),
      'projectphasesel': new UntypedFormControl()
    });
    const today = new Date();
    const todayObj = {
      year: today.getFullYear(),
      month: today.getMonth() + 1,
      day: today.getDate()
    };
    this.myForm.controls.datePosted.setValue(todayObj);
    this.myForm.controls.dateUploaded.setValue(todayObj);
  }

  addLabels() {
    this.storageService.state = { type: 'form', data: this.myForm };
    this.storageService.state = { type: 'documents', data: this.documents };
    this.storageService.state = { type: 'labels', data: this.allLabels() };
    this.storageService.state.back = { url: ['/p', this.currentProject._id, 'project-documents', 'upload'], label: 'Upload Document(s)' };
    this.router.navigate(['/p', this.currentProject._id, 'project-documents', 'upload', 'add-label']);
  }

  public changeLegislation(event) {
    this.legislationYear = event.target.value;
    this.myForm.controls.doctypesel.setValue(null);
    this.myForm.controls.authorsel.setValue(null);
    this.myForm.controls.labelsel.setValue(null);
    this.myForm.controls.projectphasesel.setValue(null);
  }

  register(myForm: UntypedFormGroup) {
    this.logger.debug('Successful registration', 'ProjectDocumentsUploadComponent', myForm.value);
  }

  public uploadAndPublish() {
    this.publishDoc = true;
    this.uploadDocuments();
  }

  public uploadDocuments() {
    this.uploadInProgress = true;

    // go through and upload one at a time.
    const observables = [];

    // NB: If multi upload, then switch to use documentFileName as displayName

    this.documents.forEach(doc => {
      const formData = new FormData();
      formData.append('upfile', doc.upfile);
      formData.append('project', this.currentProject._id);

      formData.append('documentFileName', doc.documentFileName);

      formData.append('documentSource', 'PROJECT');

      formData.append('displayName', this.documents.length > 1 ? doc.documentFileName : this.myForm.value.displayName);
      formData.append('milestone', this.myForm.value.labelsel);
      formData.append('dateUploaded', DateTime.fromJSDate(convertFormGroupNGBDateToJSDate(this.myForm.get('dateUploaded').value)).toUTC().toISO());
      formData.append('datePosted', DateTime.fromJSDate(convertFormGroupNGBDateToJSDate(this.myForm.get('datePosted').value)).toUTC().toISO());
      formData.append('type', this.myForm.value.doctypesel);
      formData.append('description', this.myForm.value.description);
      formData.append('documentAuthorType', this.myForm.value.authorsel);
      formData.append('projectPhase', this.myForm.value.projectphasesel);
      formData.append('legislation', this.legislationYear);
      observables.push(this.documentService.add(formData, this.publishDoc));
    });

    this.storageService.state = { type: 'form', data: null };
    this.storageService.state = { type: 'documents', data: null };
    this.storageService.state = { type: 'labels', data: null };

    forkJoin(observables)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {},
        error: error => {
            this.logger.error('document upload failed', 'ProjectDocumentsUploadComponent', error);
            let message = 'Could not upload document';
            if (error?.error?.message) {
              message = error.error.message;
            } else if (error?.message) {
              message = error.message;
            } else if (error?.statusText) {
              message = `Upload failed: ${error.statusText}`;
            }
            this.toastService.error(message);
            this.uploadInProgress = false;
          },
        complete: () => {
          this.toastService.success('Uploaded Successfully!');
          this.router.navigate(['p', this.currentProject._id, 'project-documents']);
          this.uploadInProgress = false;
        }
      });
  }

  public docNameExists() {
    // Doc name "exists" if the form has a value, or if the form has more than one document
    // this does not check name validity (validateChars does that)
    return (this.myForm.value.displayName && this.myForm.value.displayName.length > 0) ||
      (this.documents && this.documents.length > 1);
  }

  public validateChars() {
    if (this.myForm.value.displayName.match(/[\/|\\:*?"<>]/g)) {
      this.docNameInvalid = true;
    } else {
      this.docNameInvalid = false;
    }
  }

  public addDocuments(files: FileList) {
    if (files) { // safety check
      for (let i = 0; i < files.length; i++) {
        if (files[i]) {
          // ensure file is not already in the list

          if (this.documents.find(x => x.documentFileName === files[i].name)) {
            // this.snackBarRef = this.snackBar.open('Can\'t add duplicate file', null, { duration: 2000 });
            continue;
          }

          this.projectFiles.push(files[i]);

          const document = new Document();
          document.upfile = files[i];
          document.documentFileName = files[i].name;

          // save document for upload to db when project is added or saved
          this.documents.push(document);
        }
      }

      if (this.documents && this.documents.length > 1) {
        this.docNameInvalid = false;
      }
    }
  }

  goBack() {
    if (this.storageService.state.back && this.storageService.state.back.url) {
      this.router.navigate(this.storageService.state.back.url);
    } else {
      this.router.navigate(['/p', this.currentProject._id, 'project-documents']);
    }
  }

  public deleteDocument(doc: Document) {
    if (doc && this.documents) { // safety check
      // remove doc from current list
      this.projectFiles = this.projectFiles.filter(item => (item.name !== doc.documentFileName));
      this.documents = this.documents.filter(item => (item.documentFileName !== doc.documentFileName));
    }
  }
}
