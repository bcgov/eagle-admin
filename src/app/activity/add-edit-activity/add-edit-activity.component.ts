import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RecentActivity } from 'src/app/models/recentActivity';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { ProjectService } from 'src/app/services/project.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { Constants } from 'src/app/shared/utils/constants';
import { Utils } from 'src/app/shared/utils/utils';

@Component({
  selector: 'app-add-edit-activity',
  templateUrl: './add-edit-activity.component.html',
  styleUrls: ['./add-edit-activity.component.scss']
})
export class AddEditActivityComponent implements OnInit, OnDestroy {
  public myForm: FormGroup;
  public isEditing = false;
  // private subscriptions: Subscription[] = [];
  private subscriptions = new Subscription();
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public loading = true;
  public projects = [];
  public projectNotifications = [];
  public types = [];
  public activityTypes = Constants.activityTypes.map(type => type.name);
  public periods = [];
  public activity: any;
  public typeIsPCP = false;
  public typeIsNotification = false;
  public typeIsProjectNotificationNews = false;
  public projectIsSelected = false;
  public snackBarTimeout = 1500;
  public isPublished = false;

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
    private router: Router,
    private route: ActivatedRoute,
    private utils: Utils,
    private snackBar: MatSnackBar,
    private recentActivityService: RecentActivityService,
    private projectService: ProjectService,
    private notificationProjectService: NotificationProjectService,
    private commentPeriodService: CommentPeriodService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.subscriptions.add(
      this.route.data.subscribe(res => {
        if (Object.keys(res).length === 0 && res.constructor === Object) {
          this.isPublished = false;
          this.buildForm({
            'headline': '',
            'content': '',
            'dateAdded': new Date(),
            'project': '',
            'projectLocation': '',
            'pinned': false,
            'notificationName': '',
            'type': '',
            'pcp': '',
            'contentUrl': '',
            'documentUrl': '',
            'complianceAndEnforcement': false
          });
        } else {
          this.isEditing = true;
          this.buildForm(res.activity.data);
          this.activity = res.activity.data;
          this.isPublished = res.activity.data.active ? true : false;
          // init flags
          this.updateProject();
          this.updateType();
        }
      })
    );

    this.subscriptions.add(
      this.projectService.getAll(1, 1000, '+name').subscribe((res2: any) => {
        if (res2) {
          this.projects = res2.data;
          // TODO: Later
          // Types
          // this.types = this.configService.lists.filter(item => {
          //   return item.type === 'headlineType';
          // });
        }

        // if the pcp selector is populated, try to set the saved value.
        if (this.typeIsPCP) {
          this.myForm.controls['pcp'].setValue(this.activity.pcp);
        }

        this.loading = false;
        this._changeDetectorRef.detectChanges();
      })
    );

    this.subscriptions.add(
      this.notificationProjectService.getAll(1, 1000, '+name').subscribe((res3: any) => {
        if (res3) {
          this.projectNotifications = res3.data;
        }
      })
    );
  }

  onCancel() {
    this.router.navigate(['/activity']);
  }

  onSubmit() {
    if (this.isEditing) {
      const activity = new RecentActivity({
        _id: this.activity._id,
        headline: this.myForm.controls.headline.value,
        content: this.myForm.controls.content.value,
        dateAdded: this.utils.convertFormGroupNGBDateToJSDate(this.myForm.get('dateAdded').value),
        project: this.myForm.get('project').value,
        type: this.myForm.get('type').value,
        pcp: this.myForm.get('pcp').value,
        notificationName: this.myForm.get('type').value === 'Project Notification Public Comment Period' ? this.myForm.controls.notificationName.value : null,
        contentUrl: this.myForm.controls.contentUrl.value,
        documentUrl: this.myForm.controls.documentUrl.value,
        active: this.isPublished,
        pinned: this.activity.pinned,
        complianceAndEnforcement: this.myForm.controls.complianceAndEnforcement.value
      });

      // ensure pinned is not null. If it is null, set to false
      activity.pinned = activity.pinned !== null ? activity.pinned : false;

      this.recentActivityService.save(activity)
        .subscribe(() => {
          this.snackBar.open('Activity Saved!', 'Close', { duration: this.snackBarTimeout });
          window.setTimeout(() => this.router.navigate(['/activity']), this.snackBarTimeout);
        });
    } else {
      const activity = new RecentActivity({
        headline: this.myForm.controls.headline.value,
        content: this.myForm.controls.content.value,
        dateAdded: new Date(),
        project: this.myForm.get('project').value,
        type: this.myForm.get('type').value,
        pcp: this.myForm.get('pcp').value,
        notificationName: this.myForm.get('type').value === 'Project Notification Public Comment Period' ? this.myForm.controls.notificationName.value : null,
        contentUrl: this.myForm.controls.contentUrl.value,
        documentUrl: this.myForm.controls.documentUrl.value,
        pinned: false,
        active: this.isPublished,
        complianceAndEnforcement: this.myForm.controls.complianceAndEnforcement.value
      });

      this.recentActivityService.add(activity)
        .subscribe(() => {
          this.snackBar.open('Activity Added!', 'Close', { duration: this.snackBarTimeout });
          window.setTimeout(() => this.router.navigate(['/activity']), this.snackBarTimeout);
        });
    }
  }

  public togglePublish() {
    this.isPublished = !this.isPublished;
    this.onSubmit();
  }

  public updateType() {
    if (this.myForm.get('type').value === this.activityTypes[0]) { // PCP
      this.typeIsPCP = true;
      this.typeIsNotification = false;
      this.typeIsProjectNotificationNews = false;
      this.myForm.get('pcp').enable();
      this.myForm.get('project').enable();
      if (this.projectIsSelected) {
        this.loadPcpsForProject(this.myForm.get('project').value);
        this.loadProjectLocation(this.myForm.get('project').value);
      }
    } else if (this.myForm.get('type').value === this.activityTypes[1]) { // Notification
      this.typeIsNotification = true;
      this.myForm.controls['project'].reset({ value: '', disabled: true });
      this.myForm.controls['pcp'].reset({ value: '', disabled: true });
      this.typeIsPCP = false;
    } else if (this.myForm.get('type').value === this.activityTypes[3]) { //  projectNotificationNews
      this.typeIsNotification = false;
      this.typeIsPCP = false;
      this.typeIsProjectNotificationNews = true;
      this.myForm.get('project').enable();
      this.myForm.controls['pcp'].reset({ value: '', disabled: true });
    } else { // News
      this.typeIsPCP = false;
      this.typeIsNotification = false;
      this.typeIsProjectNotificationNews = false;
      this.myForm.get('project').enable();
      this.myForm.controls['pcp'].reset({ value: '', disabled: true });
    }
    this._changeDetectorRef.detectChanges();
  }

  public updateProject() {
    const currentProjectId = this.myForm.get('project').value;
    if (currentProjectId === undefined) {
      this.projectIsSelected = false;
    } else {
      this.projectIsSelected = true;
      if (this.typeIsPCP) {
        this.loadPcpsForProject(currentProjectId);
      }
      this.loadProjectLocation(currentProjectId);
    }
    this._changeDetectorRef.detectChanges();
  }

  public loadProjectLocation(projectId) {
    this.projectService.getById(projectId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.myForm.controls['projectLocation'].setValue(res.location);
          this._changeDetectorRef.detectChanges();
        }
      });
  }

  public loadPcpsForProject(projectId) {
    this.commentPeriodService.getAllByProjectId(projectId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.periods = res.data;
          this.myForm.controls['pcp'].setValue('');
          this._changeDetectorRef.detectChanges();
        }
      });
  }

  buildForm(data) {
    this.myForm = new FormGroup({
      'headline': new FormControl(data.headline),
      'content': new FormControl(data.content),
      'dateAdded': new FormControl(this.utils.convertJSDateToNGBDate(new Date(data.dateAdded))),
      'project': new FormControl(data.project),
      'projectLocation': new FormControl({ value: data.projectLocation, disabled: true }),
      'type': new FormControl(data.type),
      'pcp': new FormControl({ value: data.pcp, disabled: true }),
      'notificationName': new FormControl(data.notificationName),
      'contentUrl': new FormControl(data.contentUrl),
      // For project notification this is the url
      'documentUrl': new FormControl(data.documentUrl),
      'complianceAndEnforcement': new FormControl(data.complianceAndEnforcement ? true : false),
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
