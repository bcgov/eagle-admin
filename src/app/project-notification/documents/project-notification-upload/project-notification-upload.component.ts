import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment-timezone';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { StorageService } from 'src/app/services/storage.service';
import { Utils } from 'src/app/shared/utils/utils';
import { Document } from 'src/app/models/document';

@Component({
  selector: 'app-project-notification-upload',
  templateUrl: './project-notification-upload.component.html',
  styleUrls: ['./project-notification-upload.component.scss']
})
export class ProjectNotificationUploadComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

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
  public filteredDoctypes2018: any[] = [];
  public documentMilestone = ['Project Notification'];
  public documentAuthor = ['Proponent', 'EAO'];
  public documentPhase = ['Project Designation'];
  public documentMilestoneID: any[] = [];
  public documentAuthorID: any[] = [];
  public documentPhaseID: any[] = [];



  constructor(
    private router: Router,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService: StorageService,
    private documentService: DocumentService,
    private snackBar: MatSnackBar,
    private configService: ConfigService,
    private utils: Utils
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;
    this.docTotal = this.storageService.state.currentProject.docTotal;
    this.buildForm();
    this.getLists();
    this.filteredDoctypes2018.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : -1);
  }

  buildForm() {

    this.myForm = new UntypedFormGroup({
      'description': new UntypedFormControl('Project Notification Document'),
      'type': new UntypedFormControl({ value: this.filteredDoctypes2018[0] }),
      'author': new UntypedFormControl({ value: this.documentAuthor[0] }),
      'date': new UntypedFormControl({ value: new Date() })
    });
    this.loading = false;
  }

  populateForm() {
    this.loading = false;
  }

  register(myForm: UntypedFormGroup) {
    console.log('Successful registration');
    console.log(myForm);
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
    const authorID = this.findID(docAuthor, this.documentAuthorID);

    const milestoneID = this.findID(this.documentMilestone[0], this.documentMilestoneID);
    const phaseID = this.findID(this.documentPhase[0], this.documentPhaseID);


    this.documents.forEach(doc => {
      const formData = new FormData();

      formData.append('upfile', doc.upfile);
      formData.append('project', this.currentProject._id);
      formData.append('documentFileName', doc.documentFileName);
      formData.append('documentSource', 'PROJECT-NOTIFICATION');
      formData.append('displayName', doc.documentFileName);
      formData.append('dateUploaded', new Date().toISOString());
      formData.append('datePosted', moment(this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('date').value)).toDate().toISOString());
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

    this.subscriptions.add(
      forkJoin(observables)
        .subscribe({
          next: () => { /* onNext */ },
          error: error => {
            console.log('error =', error);
            alert('Document upload failed due to a service error.');
            this.router.navigate(['pn', this.currentProject._id, 'project-notification-documents']);
            this.loading = false;
          },
          complete: () => {
            this.router.navigate(['pn', this.currentProject._id, 'project-notification-documents']);
            this.loading = false;
          }
        })
    );
  }

  public addDocuments(files: FileList) {
    if (this.documents.length + this.docTotal >= 20) {
      this.snackBar.open('Project Notifications can have a maximum of 20 files', null, {
        duration: 2000,
      });
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
    this._changeDetectionRef.detectChanges();
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

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  getLists() {
    this.configService.lists.forEach(item => {
      switch (item.name) {
        case 'Proponent/Certificate Holder':
          if (item.legislation === 2018) {
            this.documentAuthorID.push(Object.assign({}, item));
          }
          break;
        case 'EAO':
          if (item.legislation === 2018) {
            this.documentAuthorID.push(Object.assign({}, item));
          }
          break;
        case 'Project Notification':
          if (item.legislation === 2018) {
            this.documentMilestoneID.push(Object.assign({}, item));
          }
          break;
        case 'Project Designation':
          if (item.legislation === 2018) {
            this.documentPhaseID.push(Object.assign({}, item));
          }
          break;
      }
      switch (item.type) {
        case 'doctype':
          if (item.legislation === 2018) {
            this.filteredDoctypes2018.push(Object.assign({}, item));
          }
          break;
      }

    }, this);
  }
}
