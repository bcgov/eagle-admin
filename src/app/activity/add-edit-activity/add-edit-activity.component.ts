import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, DestroyRef, TemplateRef, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbDatepickerModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { RecentActivity } from 'src/app/models/recentActivity';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { ConfigService } from 'src/app/services/config.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { ProjectService } from 'src/app/services/project.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { SearchService } from 'src/app/services/search.service';
import { Constants } from 'src/app/shared/utils/constants';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from 'src/app/shared/utils/utils';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import {
  CORPORATE_CATEGORY, PublishAction, SHORT_HEADLINE_MAX, SUMMARY_MAX, StatusFields, UPDATE_CONFLICT_MESSAGE, httpUrlValidator,
  isConflict, keepStatusFields, listNames, publishFields, statusLabel, summaryOrFallback, toLocalInputValue, updateRulesValidator
} from '../update-rules';

const IMAGE_FILE = /\.(png|jpe?g|gif|webp)$/i;

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
    NgbDatepickerModule,
    NgSelectModule
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
  private configService = inject(ConfigService);
  private modalService = inject(NgbModal);
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
  public statusText = 'Draft';
  public documents: any[] = [];
  public imageDocuments: any[] = [];

  public readonly shortHeadlineMax = SHORT_HEADLINE_MAX;
  public readonly summaryMax = SUMMARY_MAX;
  public readonly corporate = CORPORATE_CATEGORY;
  public readonly categories = computed(() => listNames(this.configService.listsSignal(), 'updateCategory'));
  public readonly subjects = computed(() => listNames(this.configService.listsSignal(), 'updateSubject'));
  public readonly minPublishDate = toLocalInputValue(new Date());
  public saving = false;
  private loadedProjectId: string | null = null;

  public get regionOptions(): string[] {
    return this.configService.regions;
  }

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
    this.configService.ensureListsLoaded();
    const activityId = this.route.snapshot.paramMap.get('activityId');
    if (activityId) {
      this.searchService.getItem(activityId, 'RecentActivity').pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res: any) => {
        this.isEditing = true;
        this.buildForm(res.data);
        this.activity = res.data;
        this.statusText = statusLabel(res.data);
        // Type first: it decides which document source updateProject() loads from.
        this.updateType();
        this.updateProject();
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
        'complianceAndEnforcement': false,
        'regions': [],
        'attachments': []
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

  public canSchedule(): boolean {
    const value = this.myForm?.get('publishDate')!.value;
    return !!value && new Date(value) > new Date();
  }

  public get isLive(): boolean {
    return this.statusText === 'Published' || this.statusText === 'Scheduled';
  }

  public save(action: PublishAction | 'keep') {
    if (action === 'draft' && this.isLive) {
      const modalRef = this.modalService.open(ConfirmComponent, { backdrop: 'static' });
      modalRef.componentInstance.title = 'Move to draft';
      modalRef.componentInstance.message = 'Saving as a draft removes this Update from the public site. Click <strong>OK</strong> to continue or <strong>Cancel</strong> to go back.';
      modalRef.componentInstance.okOnly = false;
      modalRef.result.then(ok => ok && this.send(action)).catch(() => { /* dismissed */ });
      return;
    }
    this.send(action);
  }

  private send(action: PublishAction | 'keep') {
    const form = this.myForm.controls;
    const type = form.type.value;
    const imageDoc = form.featuredImageDocument.value;
    const scheduled = form.publishDate.value ? new Date(form.publishDate.value) : null;
    let statusFields: StatusFields;
    try {
      statusFields = action === 'keep' ? keepStatusFields(this.activity, scheduled) : publishFields(action, scheduled);
    } catch (e) {
      this.toastService.error((e as Error).message);
      return;
    }
    const activity = new RecentActivity({
      _id: this.isEditing ? this.activity._id : undefined,
      headline: form.headline.value,
      content: form.content.value,
      dateAdded: this.isEditing ? convertFormGroupNGBDateToJSDate(form.dateAdded.value) : new Date(),
      project: form.project.value || null,
      type,
      pcp: form.pcp.value || null,
      notificationName: type === 'Project Notification Public Comment Period' ? form.notificationName.value : null,
      contentUrl: form.contentUrl.value,
      documentUrl: form.documentUrl.value,
      pinned: this.isEditing ? this.activity.pinned === true : false,
      dateUpdated: this.isEditing ? this.activity.dateUpdated : null,
      complianceAndEnforcement: form.complianceAndEnforcement.value,
      category: form.category.value,
      shortHeadline: form.shortHeadline.value,
      summary: form.summary.value,
      featuredImage: imageDoc ? { document: imageDoc, alt: form.featuredImageAlt.value.trim() } : null,
      attachments: form.attachments.value || [],
      regions: form.regions.value || [],
      location: form.location.value,
      engagementUrl: form.engagementUrl.value?.trim() || null,
      subject: form.category.value === CORPORATE_CATEGORY ? form.subject.value : null,
      ...statusFields
    });

    this.saving = true;
    const request = this.isEditing ? this.recentActivityService.save(activity) : this.recentActivityService.add(activity);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toastService.success('Update saved.');
        this.router.navigate(['/activity']);
      },
      error: (error: Error) => {
        this.saving = false;
        this.toastService.error(isConflict(error) ? UPDATE_CONFLICT_MESSAGE : `Update not saved: ${error.message}`);
        this._cdr.markForCheck();
      }
    });
  }

  public openPreview(template: TemplateRef<unknown>) {
    this.modalService.open(template, { size: 'lg', scrollable: true });
  }

  public get previewSummary(): string {
    return summaryOrFallback(this.myForm.get('summary')!.value, this.myForm.get('content')!.value);
  }

  public get previewImage(): { url: string; alt: string } | null {
    const doc = this.documents.find(d => d._id === this.myForm.get('featuredImageDocument')!.value);
    if (!doc) {
      return null;
    }
    const name = encodeURIComponent(doc.documentFileName || doc.displayName || 'image');
    return { url: `/api/document/${doc._id}/fetch/${name}`, alt: this.myForm.get('featuredImageAlt')!.value };
  }

  public updateCategory() {
    this.myForm.updateValueAndValidity();
    this._cdr.markForCheck();
  }

  public updateType(userChange = false) {
    // Loading a saved row keeps its project and pcp; only a user's type change clears them.
    const off = (name: string) => userChange
      ? this.myForm.controls[name].reset({ value: '', disabled: true })
      : this.myForm.controls[name].disable();
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
      off('pcp');
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
      off('project');
      off('pcp');
      this.myForm.get('documentUrl')!.setValidators(Validators.required);
      this.myForm.get('notificationName')!.setValidators(Validators.required);
      this.myForm.get('documentUrl')!.updateValueAndValidity();
      this.myForm.get('notificationName')!.updateValueAndValidity();
    } else if (this.myForm.get('type')!.value === this.activityTypes[3]) { //  projectNotificationNews
      this.typeIsNotification = false;
      this.typeIsPCP = false;
      this.typeIsProjectNotificationNews = true;
      this.myForm.get('project')!.enable();
      off('pcp');
      this.myForm.get('project')!.setValidators(Validators.required);
      this.myForm.get('project')!.updateValueAndValidity();
    } else { // News
      this.typeIsPCP = false;
      this.typeIsNotification = false;
      this.typeIsProjectNotificationNews = false;
      this.myForm.get('project')!.enable();
      off('pcp');
    }
    this.myForm.updateValueAndValidity();
    this._cdr.markForCheck();
  }

  public updateProject() {
    const currentProjectId = this.myForm.get('project')!.value || null;
    if (this.loadedProjectId && currentProjectId !== this.loadedProjectId) {
      // Picked documents belong to the previous project.
      this.myForm.patchValue({ featuredImageDocument: null, featuredImageAlt: '', attachments: [] });
    }
    this.loadedProjectId = currentProjectId;
    if (!currentProjectId) {
      this.projectIsSelected = false;
      this.setDocuments([]);
      this._cdr.markForCheck();
    } else {
      this.projectIsSelected = true;
      this._cdr.markForCheck();
      if (this.typeIsPCP) {
        this.loadPcpsForProject(currentProjectId);
      }
      this.loadProjectLocation(currentProjectId);
      this.loadProjectDocuments(currentProjectId);
    }
  }

  // Same project document search the comment period picker uses; first 1000, newest first.
  public loadProjectDocuments(projectId: string) {
    const documentSource = this.typeIsProjectNotificationNews ? 'PROJECT-NOTIFICATION' : 'PROJECT';
    this.searchService.getSearchResults('', 'Document', [{ name: 'project', value: projectId }], 1, 1000, '-datePosted', { documentSource })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res: any) => {
        this.setDocuments(res?.[0]?.data?.searchResults || []);
        this._cdr.markForCheck();
      });
  }

  private setDocuments(docs: any[]) {
    this.documents = docs;
    this.imageDocuments = docs.filter(d =>
      d.internalMime ? d.internalMime.startsWith('image/') : IMAGE_FILE.test(d.documentFileName || ''));
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
          const currentPcp = this.myForm.controls['pcp'].value || (this.isEditing ? this.activity?.pcp : '');
          this.myForm.controls['pcp'].setValue(this.periods.some((p: any) => p._id === currentPcp) ? currentPcp : '');
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
      // Rows from before categories existed stay editable without one.
      'category': new UntypedFormControl(data.category || null, this.isEditing ? null : Validators.required),
      'shortHeadline': new UntypedFormControl(data.shortHeadline || '', Validators.maxLength(SHORT_HEADLINE_MAX)),
      'summary': new UntypedFormControl(data.summary || '', Validators.maxLength(SUMMARY_MAX)),
      'featuredImageDocument': new UntypedFormControl(data.featuredImage?.document || null),
      'featuredImageAlt': new UntypedFormControl(data.featuredImage?.alt || ''),
      'attachments': new UntypedFormControl(data.attachments || []),
      'regions': new UntypedFormControl(data.regions || []),
      'location': new UntypedFormControl(data.location || ''),
      'engagementUrl': new UntypedFormControl(data.engagementUrl || '', httpUrlValidator),
      'subject': new UntypedFormControl(data.subject || null),
      'publishDate': new UntypedFormControl(toLocalInputValue(data.publishDate || null)),
    }, { validators: updateRulesValidator });
  }
}
