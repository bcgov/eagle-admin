import { Component, OnInit, DestroyRef, inject, computed, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ToastService } from 'src/app/services/toast.service';
import { DateTime } from 'luxon';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { convertFormGroupNGBDateToJSDate } from 'src/app/shared/utils/utils';
import { Document } from 'src/app/models/document';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadComponent } from 'src/app/file-upload/file-upload.component';
import { LoggingService } from 'src/app/services/logging.service';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-project-notification-upload',
    imports: [RouterModule, ReactiveFormsModule, NgbDatepickerModule, FileUploadComponent],
    templateUrl: './project-notification-upload.component.html',
    styleUrl: './project-notification-upload.component.css',
    
})
export class ProjectNotificationUploadComponent implements OnInit {
  private router = inject(Router);
  private storageService = inject(StorageService);
  private documentService = inject(DocumentService);
  private toastService = inject(ToastService);
  private configService = inject(ConfigService);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  private readonly lists = this.configService.listsSignal;

  public readonly filteredDoctypes2018 = computed(() =>
    this.lists().filter(i => i.type === 'doctype' && i.legislation === 2018)
      .sort((a, b) => a.listOrder - b.listOrder)
  );
  public readonly documentAuthorID = computed(() =>
    this.lists().filter(i =>
      (i.name === 'Proponent/Certificate Holder' || i.name === 'EAO') && i.legislation === 2018
    )
  );
  public readonly documentMilestoneID = computed(() =>
    this.lists().filter(i => i.name === 'Project Notification' && i.legislation === 2018)
  );
  public readonly documentPhaseID = computed(() =>
    this.lists().filter(i => i.name === 'Project Designation' && i.legislation === 2018)
  );

  public currentProject;
  public docTotal: number;
  public projectFiles: Array<File> = [];
  public documents: Document[] = [];
  public datePosted: NgbDateStruct = null;
  public dateUploaded: NgbDateStruct = null;
  public myForm: UntypedFormGroup;
  public loading = true;
  public docNameInvalid = false;
  public legislationYear = '2018';
  public publishDoc = false;
  public documentMilestone = ['Project Notification'];
  public documentAuthor = ['Proponent', 'EAO'];
  public documentPhase = ['Project Designation'];

  ngOnInit() {
    this.currentProject = this.storageService.currentProjectData;
    this.docTotal = this.storageService.state.currentProject.docTotal;
    this.buildForm();
    this.configService.ensureListsLoaded();
  }

  buildForm() {

    this.myForm = new UntypedFormGroup({
      'description': new UntypedFormControl('Project Notification Document'),
      'type': new UntypedFormControl(),
      'author': new UntypedFormControl({ value: this.documentAuthor[0] }),
      'date': new UntypedFormControl({ value: new Date() })
    });
    this.loading = false;
  }

  populateForm() {
    this.loading = false;
  }

  register(myForm: UntypedFormGroup) {
    this.logger.debug('Successful registration', 'ProjectNotificationUploadComponent', myForm.value);
  }

  public uploadAndPublish() {
    this.publishDoc = true;
    this.uploadDocuments();
  }


  public findID(name, objArr) {
    let id = 'null';
    for (let i = 0; i < objArr.length; i++) {
      if (objArr[i].name === name) {
        id = objArr[i]._id;
        break;
      }
    }
    return id;
  }

  public uploadDocuments() {
    this.loading = true;
    const observables = [];

    let docAuthor = this.myForm.controls.author.value;
    if (docAuthor === 'Proponent') {
      docAuthor = 'Proponent/Certificate Holder';
    }
    const authorID = this.findID(docAuthor, this.documentAuthorID());

    const milestoneID = this.findID(this.documentMilestone[0], this.documentMilestoneID());
    const phaseID = this.findID(this.documentPhase[0], this.documentPhaseID());


    this.documents.forEach(doc => {
      const formData = new FormData();

      formData.append('upfile', doc.upfile);
      formData.append('project', this.currentProject._id);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('documentSource', 'PROJECT-NOTIFICATION');
      formData.append('displayName', doc.documentFileName);
      formData.append('dateUploaded', new Date().toISOString());
      formData.append('datePosted', DateTime.fromJSDate(convertFormGroupNGBDateToJSDate(this.myForm.get('date').value)).toUTC().toISO());
      formData.append('milestone', milestoneID);
      formData.append('type', this.myForm.get('type').value);
      formData.append('description', this.myForm.get('description').value);
      formData.append('documentAuthorType', null);
      formData.append('documentAuthor', authorID);
      formData.append('projectPhase', phaseID);
      formData.append('legislation', '2018');

      observables.push(this.documentService.add(formData, this.publishDoc));
    }, this);

    this.storageService.state = { type: 'form', data: null };
    this.storageService.state = { type: 'documents', data: null };

    forkJoin(observables)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { /* onNext */ },
        error: error => {
          this.logger.error('document upload failed', 'ProjectNotificationUploadComponent', error);
          this.toastService.error(error.message || 'Could not upload document');
          this.loading = false;
        },
        complete: () => {
          this.toastService.success('Uploaded successfully!');
          this.router.navigate(['pn', this.currentProject._id, 'project-notification-documents']);
          this.loading = false;
        }
      });
  }

  public addDocuments(files: FileList) {
    if (this.documents.length + this.docTotal >= 20) {
      this.toastService.warning('Project Notifications can have a maximum of 20 files');
      return false;
    }

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
          document.legislation = 2018;

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
      this.router.navigate(['/pn', this.currentProject._id, 'project-notification-documents;notificationProjectId=' + this.currentProject._id]);
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
