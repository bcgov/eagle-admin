import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { RecentActivity } from 'src/app/models/recentActivity';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { ProjectService } from 'src/app/services/project.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { SearchService } from 'src/app/services/search.service';
import { Constants } from 'src/app/shared/utils/constants';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from 'src/app/shared/utils/utils';

@Component({
  selector: 'app-add-edit-activity',
  templateUrl: './add-edit-activity.component.html',
  styleUrl: './add-edit-activity.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    EditorModule,
    NgbDatepickerModule
  ]
})
export class AddEditActivityComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastService = inject(ToastService);
  private recentActivityService = inject(RecentActivityService);
  private projectService = inject(ProjectService);
  private notificationProjectService = inject(NotificationProjectService);
  private commentPeriodService = inject(CommentPeriodService);
  private searchService = inject(SearchService);
  private destroyRef = inject(DestroyRef);
  private _cdr = inject(ChangeDetectorRef);

  public myForm!: UntypedFormGroup;
  public isEditing = false;
  // private subscriptions: Subscription[] = [];
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
  public isPublished = false;

  public tinyMceSettings = {
    skin: false,
    browser_spellcheck: true,
    promotion: false,
    height: 240,
    plugins: ['lists', 'advlist', 'link'],
    toolbar: ['undo redo | formatselect | ' +
      ' bold italic backcolor | alignleft aligncenter ' +
      ' alignright alignjustify | bullist numlist outdent indent |' +
      ' removeformat | help'],
    // Strip all inline styles and Word/Office junk on paste.
    // Keeps semantic structure (paragraphs, links, bold/italic, lists)
    // but discards font-family, font-size, color, mso-* and SCXW/BCX class noise.
    valid_styles: {},
    extended_valid_elements: 'span',
    invalid_elements: 'style,script',
    paste_preprocess: (_plugin: any, args: any) => {
      // Strip all inline style attributes from pasted content
      args.content = args.content
        .replace(/ style="[^"]*"/gi, '')
        .replace(/ style='[^']*'/gi, '')
        // Remove Word Online wrapper classes (SCXW*, BCX*, OutlineElement, MsoNormal, etc.)
        .replace(/ class="[^"]*"/gi, '')
        .replace(/ class='[^']*'/gi, '')
        // Remove lang and xml:lang attributes
        .replace(/ (lang|xml:lang)="[^"]*"/gi, '')
        // Remove data-contrast and other Word Online data attributes
        .replace(/ data-[a-zA-Z-]+="[^"]*"/gi, '')
        // Flatten Word Online wrappers: OutlineElement divs, TextRun spans, NormalTextRun spans
        // by unwrapping <div> and <span> tags that have no remaining attributes
        .replace(/<(div|span)(\s*\/?)>/gi, '')
        .replace(/<\/(div|span)>/gi, '');
    }
  };

  ngOnInit() {
    const activityId = this.route.snapshot.paramMap.get('activityId');
    if (activityId) {
      this.searchService.getItem(activityId, 'RecentActivity').pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res: any) => {
        this.isEditing = true;
        this.buildForm(res.data);
        this.activity = res.data;
        this.isPublished = res.data.active ? true : false;
        this.updateProject();
        this.updateType();
      });
    } else {
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
    }

    this.projectService.getAll(1, 1000, '+name').pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res2: any) => {
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
        this._cdr.markForCheck();
      },
      error: () => { this.loading = false; this._cdr.markForCheck(); }
    });

    this.notificationProjectService.getAll(1, 1000, '+name').pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res3: any) => {
      if (res3) {
        this.projectNotifications = res3.data;
      }
    });
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
        dateAdded: convertFormGroupNGBDateToJSDate(this.myForm.get('dateAdded')!.value),
        project: this.myForm.get('project')!.value,
        type: this.myForm.get('type')!.value,
        pcp: this.myForm.get('pcp')!.value || null,
        notificationName: this.myForm.get('type')!.value === 'Project Notification Public Comment Period' ? this.myForm.controls.notificationName.value : null,
        contentUrl: this.myForm.controls.contentUrl.value,
        documentUrl: this.myForm.controls.documentUrl.value,
        active: this.isPublished,
        pinned: this.activity.pinned,
        complianceAndEnforcement: this.myForm.controls.complianceAndEnforcement.value
      });

      // ensure pinned is not null. If it is null, set to false
      activity.pinned = activity.pinned !== null ? activity.pinned : false;

      this.recentActivityService.save(activity)
        .subscribe({
          next: () => {
            this.toastService.success('Activity Saved!');
            this.router.navigate(['/activity']);
          },
          error: () => {
            this.toastService.error('Error saving activity. Please try again.');
          }
        });
    } else {
      const activity = new RecentActivity({
        headline: this.myForm.controls.headline.value,
        content: this.myForm.controls.content.value,
        dateAdded: new Date(),
        project: this.myForm.get('project')!.value,
        type: this.myForm.get('type')!.value,
        pcp: this.myForm.get('pcp')!.value || null,
        notificationName: this.myForm.get('type')!.value === 'Project Notification Public Comment Period' ? this.myForm.controls.notificationName.value : null,
        contentUrl: this.myForm.controls.contentUrl.value,
        documentUrl: this.myForm.controls.documentUrl.value,
        pinned: false,
        active: this.isPublished,
        complianceAndEnforcement: this.myForm.controls.complianceAndEnforcement.value
      });

      this.recentActivityService.add(activity)
        .subscribe({
          next: () => {
            this.toastService.success('Activity Added!');
            this.router.navigate(['/activity']);
          },
          error: () => {
            this.toastService.error('Error adding activity. Please try again.');
          }
        });
    }
  }

  public togglePublish() {
    this.isPublished = !this.isPublished;
    this.onSubmit();
  }

  public updateType() {
    // Clear all conditional validators before applying new ones for current type
    ['project', 'pcp', 'documentUrl', 'notificationName'].forEach(field => {
      this.myForm.get(field)!.clearValidators();
      this.myForm.get(field)!.updateValueAndValidity();
    });

    if (this.myForm.get('type')!.value === this.activityTypes[0]) { // PCP
      this.typeIsPCP = true;
      this.typeIsNotification = false;
      this.typeIsProjectNotificationNews = false;
      // pcp stays disabled until periods load — prevents black bar on empty select
      this.myForm.controls['pcp'].reset({ value: '', disabled: true });
      this.myForm.get('project')!.enable();
      this.myForm.get('project')!.setValidators(Validators.required);
      this.myForm.get('pcp')!.setValidators(Validators.required);
      this.myForm.get('project')!.updateValueAndValidity();
      this.myForm.get('pcp')!.updateValueAndValidity();
      if (this.projectIsSelected) {
        this.loadPcpsForProject(this.myForm.get('project')!.value);
        this.loadProjectLocation(this.myForm.get('project')!.value);
      }
    } else if (this.myForm.get('type')!.value === this.activityTypes[1]) { // Notification
      this.typeIsNotification = true;
      this.typeIsPCP = false;
      this.typeIsProjectNotificationNews = false;
      this.myForm.controls['project'].reset({ value: '', disabled: true });
      this.myForm.controls['pcp'].reset({ value: '', disabled: true });
      this.myForm.get('documentUrl')!.setValidators(Validators.required);
      this.myForm.get('notificationName')!.setValidators(Validators.required);
      this.myForm.get('documentUrl')!.updateValueAndValidity();
      this.myForm.get('notificationName')!.updateValueAndValidity();
    } else if (this.myForm.get('type')!.value === this.activityTypes[3]) { //  projectNotificationNews
      this.typeIsNotification = false;
      this.typeIsPCP = false;
      this.typeIsProjectNotificationNews = true;
      this.myForm.get('project')!.enable();
      this.myForm.controls['pcp'].reset({ value: '', disabled: true });
      this.myForm.get('project')!.setValidators(Validators.required);
      this.myForm.get('project')!.updateValueAndValidity();
    } else { // News
      this.typeIsPCP = false;
      this.typeIsNotification = false;
      this.typeIsProjectNotificationNews = false;
      this.myForm.get('project')!.enable();
      this.myForm.controls['pcp'].reset({ value: '', disabled: true });
    }
    this._cdr.markForCheck();
  }

  public updateProject() {
    const currentProjectId = this.myForm.get('project')!.value;
    if (!currentProjectId) {
      this.projectIsSelected = false;
      this._cdr.markForCheck();
    } else {
      this.projectIsSelected = true;
      this._cdr.markForCheck();
      if (this.typeIsPCP) {
        this.loadPcpsForProject(currentProjectId);
      }
      this.loadProjectLocation(currentProjectId);
    }
  }

  public loadProjectLocation(projectId: string) {
    this.projectService.getById(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        if (res) {
          this.myForm.controls['projectLocation'].setValue(res.location);
          this._cdr.markForCheck();
        }
      });
  }

  public loadPcpsForProject(projectId: string) {
    this.commentPeriodService.getAllByProjectId(projectId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        if (res) {
          this.periods = res.data;
          // Preserve the current PCP selection if it exists in the loaded periods.
          // Only reset when the current value is no longer valid (e.g. user switched projects).
          const currentPcp = this.myForm.controls['pcp'].value;
          if (!this.periods.some((p: any) => p._id === currentPcp)) {
            this.myForm.controls['pcp'].setValue('');
          }
          // Enable pcp select only when periods exist — prevents black bar on empty select
          if (this.typeIsPCP && this.periods.length > 0) {
            this.myForm.get('pcp')!.enable();
          } else {
            this.myForm.controls['pcp'].reset({ value: '', disabled: true });
          }
          this._cdr.markForCheck();
        }
      });
  }

  buildForm(data: any) {
    this.myForm = new UntypedFormGroup({
      'headline': new UntypedFormControl(data.headline, Validators.required),
      'content': new UntypedFormControl(data.content, Validators.required),
      'dateAdded': new UntypedFormControl(convertJSDateToNGBDate(new Date(data.dateAdded)), Validators.required),
      'project': new UntypedFormControl(data.project),
      'projectLocation': new UntypedFormControl({ value: data.projectLocation, disabled: true }),
      'type': new UntypedFormControl(data.type, Validators.required),
      'pcp': new UntypedFormControl({ value: data.pcp, disabled: true }),
      'notificationName': new UntypedFormControl(data.notificationName),
      'contentUrl': new UntypedFormControl(data.contentUrl),
      // For project notification this is the url
      'documentUrl': new UntypedFormControl(data.documentUrl),
      'complianceAndEnforcement': new UntypedFormControl(data.complianceAndEnforcement ? true : false),
    });
  }
}
