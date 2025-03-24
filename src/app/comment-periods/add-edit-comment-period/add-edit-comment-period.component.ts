import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs/Subject';
import * as moment from 'moment';
import { CommentPeriod } from 'app/models/commentPeriod';

import { CommentPeriodService } from 'app/services/commentperiod.service';
import { ConfigService } from 'app/services/config.service';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';

import { Utils } from 'app/shared/utils/utils';
import { Project } from 'app/models/project';

// tiny mce imports for plugins
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';

@Component({
  selector: 'app-add-edit-comment-period',
  templateUrl: './add-edit-comment-period.component.html',
  styleUrls: ['./add-edit-comment-period.component.scss']
})




export class AddEditCommentPeriodComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  public currentProject: { type: string, data: Project };
  public componentBaseUrl: string;
  public commentPeriod = new CommentPeriod;
  public milestones: any[] = [];

  public isEditing = false;

  public infoForCommentPreview = '%information for comment%';
  public descriptionPreview = '%description%';

  public publishedState = 'unpublished';
  public commentPeriodForm: FormGroup;

  public startMeridian = true;

  public loading = true;

  public areDatesInvalid = false;

  public tinyMceSettings = {
    skin: false,
    browser_spellcheck: true,
    height: 240,
    plugins: ['lists, advlist, link'],
    toolbar: ['undo redo | formatselect | ' +
      ' bold italic backcolor | alignleft aligncenter ' +
      ' alignright alignjustify | bullist numlist outdent indent |' +
      ' removeformat | help']
  };

  constructor(
    private route: ActivatedRoute,
    private _changeDetectionRef: ChangeDetectorRef,
    private commentPeriodService: CommentPeriodService,
    private configService: ConfigService,
    private documentService: DocumentService,
    private formBuilder: FormBuilder,
    private router: Router,
    private snackBar: MatSnackBar,
    public storageService: StorageService,
    private utils: Utils
  ) { }

  ngOnInit() {
    // BUG: Go to add docs. refresh. it will redirect and have errors.
    this.currentProject = this.storageService.state.currentProject;

    // Set the base navigation route to use depending on if viewing a project or project notification.
    this.componentBaseUrl = this.currentProject.type === 'currentProject' ? '/p' : '/pn';

    this.configService.lists.forEach(listItem => {
      if (listItem && listItem.type === 'label' && listItem.legislation === this.currentProject.data.legislationYear) {
        this.milestones.push(Object.assign({}, listItem));
      }
    });
    this.milestones.sort((a, b) => (a.listOrder > b.listOrder) ? 1 : -1);

    // Check if we're editing
    this.route.url.subscribe(segments => {
      segments.map(segment => {
        if (segment.path === 'edit') {
          this.isEditing = true;
          // get data from route resolver
          this.route.data
            .takeUntil(this.ngUnsubscribe)
            .subscribe(
              (data: any) => {
                if (data.commentPeriod) {
                  this.commentPeriod = data.commentPeriod;
                  this.storageService.state.currentCommentPeriod = { type: 'currentCommentPeriod', data: this.commentPeriod };
                  this.initSelectedDocs();
                  this.initForm();

                  this.loading = false;
                  this._changeDetectionRef.detectChanges();
                } else {
                  alert('Uh-oh, couldn\'t load comment periods');
                  // project not found --> navigate back to search
                  this.router.navigate(['/search']);
                }
                this.loading = false;
                this._changeDetectionRef.detectChanges();
              }
            );
        } else {
          this.initForm();
          this.loading = false;
          this._changeDetectionRef.detectChanges();
        }
      });
    });
  }

  private initForm() {
    if (this.storageService.state.addEditCPForm == null) {
      // Prep comment period form.
      this.commentPeriodForm = new FormGroup({
        'startDate': new FormControl(),
        'startTime': new FormControl(),
        'endDate': new FormControl(),
        'endTime': new FormControl(),
        'publishedStateSel': new FormControl(),
        'infoForCommentText': new FormControl(),
        'descriptionText': new FormControl(),
        'commentTipText': new FormControl(),
        'milestoneSel': new FormControl(),
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
    this.commentPeriodForm.controls.startDate.setValue(this.utils.convertJSDateToNGBDate(this.commentPeriod.dateStarted));
    this.commentPeriodForm.controls.startTime.setValue({ hour: this.commentPeriod.dateStarted.getHours(), minute: this.commentPeriod.dateStarted.getMinutes() });
    this.commentPeriodForm.controls.endDate.setValue(this.utils.convertJSDateToNGBDate(this.commentPeriod.dateCompleted));
    this.commentPeriodForm.controls.endTime.setValue({ hour: this.commentPeriod.dateCompleted.getHours(), minute: this.commentPeriod.dateCompleted.getMinutes() });

    // Publish state
    this.commentPeriodForm.controls.publishedStateSel.setValue(this.commentPeriod.isPublished ? 'published' : 'unpublished');

    // Instructions
    this.extractVarsFromInstructions(this.commentPeriod.instructions, this.commentPeriodForm);

    // Comment Tip
    this.commentPeriodForm.controls.commentTipText.setValue(this.commentPeriod.commentTip);

    // Milestone
    this.commentPeriodForm.controls.milestoneSel.setValue(this.commentPeriod.milestone);

    // Open houses
    if (this.commentPeriod.openHouses.length > 0) {
      this.commentPeriod.openHouses.map(openHouse => {
        this.addOpenHouseRowWithFields(
          this.formBuilder.group({
            eventDate: this.utils.convertJSDateToNGBDate(new Date(openHouse['eventDate'])),
            description: openHouse['description']
          })
        );
      });
    } else {
      this.addOpenHouseRow();
    }

    this._changeDetectionRef.detectChanges();
  }

  private initSelectedDocs() {
    if (this.storageService.state.selectedDocumentsForCP == null) {
      if (this.commentPeriod.relatedDocuments && this.commentPeriod.relatedDocuments.length > 0) {
        this.documentService.getByMultiId(this.commentPeriod.relatedDocuments)
          .takeUntil(this.ngUnsubscribe)
          .subscribe(
            data => {
              this.storageService.state.selectedDocumentsForCP = { type: 'selectedDocumentsForCP', data: data };
            }
          );
      } else {
        this.storageService.state.selectedDocumentsForCP = { type: 'selectedDocumentsForCP', data: this.commentPeriod.relatedDocuments };
      }
    }
  }

  public onSubmit() {
    this.loading = true;
    // TODO: Calulator integration.
    // TODO: Custom validation for start and end date.

    // Check start and end date
    this.commentPeriod.dateStarted = this.utils.convertFormGroupNGBDateToJSDate(this.commentPeriodForm.get('startDate').value, this.commentPeriodForm.get('startTime').value);
    this.commentPeriod.dateCompleted = this.utils.convertFormGroupNGBDateToJSDate(this.commentPeriodForm.get('endDate').value, this.commentPeriodForm.get('endTime').value);
    if (moment(this.commentPeriod.dateStarted) > moment(this.commentPeriod.dateCompleted)) {
      this.areDatesInvalid = true;
      this.loading = false;
      return;
    } else {
      this.areDatesInvalid = false;
    }

    // Check published state
    if (this.commentPeriodForm.get('publishedStateSel').value === 'published') {
      this.commentPeriod.isPublished = true;
    } else {
      this.commentPeriod.isPublished = false;
    }

    // Check info for comment
    // Check description
    this.commentPeriod.instructions = `Comment Period on the ${this.commentPeriodForm.get('infoForCommentText').value}`;
    this.commentPeriod.instructions += ` for ${this.currentProject.data.name} Project.`;

    // wrap comment header in h4 tag

    this.commentPeriod.instructions = `<h4>${this.commentPeriod.instructions}</h4>`;

    // add description
    this.commentPeriod.instructions += ` ${this.commentPeriodForm.get('descriptionText').value === null ? '' : this.commentPeriodForm.get('descriptionText').value}`;



    // Check comment tip
    this.commentPeriod.commentTip = this.commentPeriodForm.get('commentTipText').value ? this.commentPeriodForm.get('commentTipText').value : '';

    if (this.storageService.state.selectedDocumentsForCP) {
      let docIdArray = [];
      if (this.storageService.state.selectedDocumentsForCP.data) {
        this.storageService.state.selectedDocumentsForCP.data.map(element => {
          docIdArray.push(element._id);
        });
      }
      this.commentPeriod.relatedDocuments = docIdArray;
    }

    // Check milestones
    this.commentPeriod.milestone = this.commentPeriodForm.get('milestoneSel').value;

    // Check open house date
    this.commentPeriod.openHouses = [];
    this.commentPeriodForm.get('openHouses').value.map(openHouse => {
      if (openHouse.description !== null && openHouse.eventDate !== null) {
        this.commentPeriod.openHouses.push({
          description: openHouse.description,
          eventDate: this.utils.convertFormGroupNGBDateToJSDate(openHouse.eventDate)
        });
      } else if (openHouse.description !== null || openHouse.eventDate !== null) {
        // TODO: We should use form errors.
        this.openSnackBar('Error: Both description and event date must not be empty.', 'Close');
        return;
      }
    });

    // Submit
    if (this.isEditing) {
      this.commentPeriodService.save(this.commentPeriod)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          () => {
            alert('Uh-oh, couldn\'t edit comment period');
          },
          () => { // onCompleted
            this.loading = false;
            this.openSnackBar('This comment period was created successfully.', 'Close');
            this.router.navigate([this.componentBaseUrl, this.currentProject.data._id, 'cp', this.commentPeriod._id]);
          }
        );
    } else {
      this.commentPeriod.project = this.currentProject.data._id;
      this.commentPeriodService.add(this.commentPeriod)
        .takeUntil(this.ngUnsubscribe)
        .subscribe(
          () => { },
          () => {
            alert('Uh-oh, couldn\'t add new comment period');
          },
          () => { // onCompleted
            this.loading = false;
            this.openSnackBar('This comment period was created successfully.', 'Close');
            this.router.navigate([this.componentBaseUrl, this.currentProject.data._id, 'comment-periods']);
          }
        );
    }
    this.storageService.state.selectedDocumentsForCP = null;
  }

  public onCancel() {
    if (confirm(`Are you sure you want to discard all changes?`)) {
      this.storageService.state.selectedDocumentsForCP = null;
      if (this.isEditing) {
        this.router.navigate([this.componentBaseUrl, this.currentProject.data._id, 'cp', this.commentPeriod._id]);
      } else {
        this.router.navigate([this.componentBaseUrl, this.currentProject.data._id, 'comment-periods']);
      }
    }
  }

  public addDocuments() {
    this.storageService.state.addEditCPForm = { type: 'addEditCPForm', data: this.commentPeriodForm };
    if (this.isEditing) {
      this.router.navigate([this.componentBaseUrl, this.commentPeriod.project, 'cp', this.commentPeriod._id, 'edit', 'add-documents']);
    } else {
      this.router.navigate([this.componentBaseUrl, this.currentProject.data._id, 'comment-periods', 'add', 'add-documents']);
    }
  }

  public register() {
    console.log('Successful registration');
    console.log(this.commentPeriodForm);
  }

  private extractVarsFromInstructions(instructionString: String, form: FormGroup) {
    form.controls.infoForCommentText.setValue(instructionString.split(' for')[0].replace('<h4>Comment Period on the ', ''));
    form.controls.descriptionText.setValue(instructionString.split('</h4>')[1]);
    this.updateDescriptionPreview();
  }

  private initOpenHouseRow(): FormGroup {
    return this.formBuilder.group({
      eventDate: null,
      description: null
    });
  }

  public addOpenHouseRow(): void {
    const openHouseArray = <FormArray>this.commentPeriodForm.controls['openHouses'];
    openHouseArray.push(this.initOpenHouseRow());
  }

  public addOpenHouseRowWithFields(openHouse): void {
    const openHouseArray = <FormArray>this.commentPeriodForm.controls['openHouses'];
    openHouseArray.push(openHouse);
  }

  public removeOpenHouseRow(rowIndex: number): void {
    const openHousesArray = <FormArray>this.commentPeriodForm.controls['openHouses'];
    if (openHousesArray.length > 1) {
      openHousesArray.removeAt(rowIndex);
    } else {
      alert('You cannot delete the last row.');
    }
  }

  public updateDescriptionPreview() {
    this.infoForCommentPreview = this.commentPeriodForm.get('infoForCommentText').value;
    this.descriptionPreview = this.commentPeriodForm.get('descriptionText').value;
    this._changeDetectionRef.detectChanges();
  }

  public removeSelectedDoc(doc) {
    this.storageService.state.selectedDocumentsForCP.data = this.storageService.state.selectedDocumentsForCP.data.filter(obj => obj._id !== doc._id);
  }

  public openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000,
    });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
