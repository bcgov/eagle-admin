import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, DestroyRef, TemplateRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { EditorModule } from '@tinymce/tinymce-angular';
import { NgbDatepickerModule, NgbModal, NgbTimepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { AbstractControl, UntypedFormArray, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { ToastService } from 'src/app/services/toast.service';
import { RecentActivity, UpdateImage } from 'src/app/models/recentActivity';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { DocumentService } from 'src/app/services/document.service';
import { ConfigService } from 'src/app/services/config.service';
import { LoggingService } from 'src/app/services/logging.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { ProjectService } from 'src/app/services/project.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { SearchService } from 'src/app/services/search.service';
import { Constants } from 'src/app/shared/utils/constants';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from 'src/app/shared/utils/utils';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import {
  CORPORATE_CATEGORY, IMAGE_CAPTION_MAX, IMAGE_CREDIT_MAX, IMAGES_MAX, PublishAction, SHORT_HEADLINE_MAX, SUMMARY_MAX, StatusFields, StatusLabel, UPDATE_CONFLICT_MESSAGE,
  documentId, httpUrlValidator, imageRowValidator, isConflict, keepStatusFields, listNames, publishFields, statusLabel, summaryOrFallback,
  updateRulesValidator
} from '../update-rules';
import { AddedImage, ImageRow, UpdateImageFieldComponent } from '../update-image-field/update-image-field.component';
import {
  UPDATE_IMAGE_SOURCE, blocksPublish, captionLine, documentName, imageSrc, isPublicDocument, toUpdateImage
} from '../update-image-field/update-images';

const IMAGE_FILE = /\.(png|jpe?g|gif|webp)$/i;
const NO_FEATURED_TEXT = { featuredImageAlt: '', featuredImageCaption: '', featuredImageCredit: '' };

interface PreviewImage { url: string; alt: string; caption: string }

/** Label and confirm text for moving a live Update back to draft. */
const TO_DRAFT: Partial<Record<StatusLabel, { label: string; message: string }>> = {
  Published: { label: 'Unpublish', message: 'Unpublishing removes this Update from the public site and moves it to draft.' },
  Scheduled: { label: 'Unschedule', message: 'Unscheduling moves this Update to draft, so it will not go live on its date.' }
};

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
    NgbTimepickerModule,
    NgSelectModule,
    UpdateImageFieldComponent
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
  private documentService = inject(DocumentService);
  private configService = inject(ConfigService);
  private logger = inject(LoggingService);
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
  public statusText: StatusLabel = 'Draft';
  public documents: any[] = [];
  public imageDocuments: any[] = [];
  public documentsLoading = false;
  public documentsFailed = false;
  /** Every image document an image row may point at: project images, Update uploads, fresh uploads. */
  public readonly imageDocs = signal(new Map<string, any>());
  /** Previews that the public fetch URL cannot serve: fresh uploads and non-public documents. */
  public readonly imageSrcs = signal(new Map<string, string>());
  /** Ids whose private thumbnail is downloading. */
  private readonly srcsLoading = new Set<string>();
  private destroyed = false;
  public featuredRows: ImageRow[] = [];
  public photoRows: ImageRow[] = [];
  private readonly documentsFor = new Subject<{ projectId: string; source: string } | null>();

  public readonly shortHeadlineMax = SHORT_HEADLINE_MAX;
  public readonly summaryMax = SUMMARY_MAX;
  public readonly imagesMax = IMAGES_MAX;
  public readonly corporate = CORPORATE_CATEGORY;
  public readonly categories = computed(() => listNames(this.configService.listsSignal(), 'updateCategory'));
  public readonly subjects = computed(() => listNames(this.configService.listsSignal(), 'updateSubject'));
  public minPublishDate = convertJSDateToNGBDate(new Date());
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
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.imageSrcs().forEach(url => URL.revokeObjectURL(url));
    });
    this.watchProjectDocuments();
    this.configService.ensureListsLoaded();
    const activityId = this.route.snapshot.paramMap.get('activityId');
    if (activityId) {
      this.searchService.getItem(activityId, 'RecentActivity').pipe(takeUntilDestroyed(this.destroyRef)).subscribe((res: any) => {
        this.isEditing = true;
        this.buildForm(res.data);
        this.rememberDocs([res.data.featuredImage?.document, ...(res.data.images || []).map((image: UpdateImage) => image.document)]
          .filter(doc => doc?._id));
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
    const scheduled = this.myForm && this.scheduledDate();
    return !!scheduled && scheduled > new Date();
  }

  public get publishLater(): boolean {
    return this.myForm.get('publishWhen')!.value === 'later';
  }

  /** Drafts and scheduled Updates pick when to go live; published and archived ones keep their date. */
  public get choosesPublishTime(): boolean {
    return this.statusText === 'Draft' || this.statusText === 'Scheduled';
  }

  public get primaryAction(): { label: string; action: PublishAction | 'keep' } {
    if (this.statusText === 'Published') {
      return { label: 'Update', action: 'keep' };
    }
    if (this.statusText === 'Archived') {
      return { label: 'Save', action: 'keep' };
    }
    return this.publishLater ? { label: 'Schedule', action: 'schedule' } : { label: 'Publish', action: 'publish' };
  }

  /** Set when saving as a draft takes a live Update off its schedule or the public site. */
  public get toDraft(): { label: string; message: string } | undefined {
    return TO_DRAFT[this.statusText];
  }

  /** Null unless scheduling with a full date and time; a cleared timepicker is null too. */
  private scheduledDate(): Date | null {
    const date = this.myForm.get('publishDate')!.value;
    const time = this.myForm.get('publishTime')!.value;
    return this.publishLater && date && time ? convertFormGroupNGBDateToJSDate(date, time) : null;
  }

  public save(action: PublishAction | 'keep') {
    const toDraft = this.toDraft;
    if (action === 'draft' && toDraft) {
      const modalRef = this.modalService.open(ConfirmComponent, { backdrop: 'static' });
      modalRef.componentInstance.title = toDraft.label;
      modalRef.componentInstance.message = `${toDraft.message} Click <strong>OK</strong> to continue or <strong>Cancel</strong> to go back.`;
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
    const scheduled = this.scheduledDate();
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
      featuredImage: imageDoc ? toUpdateImage({
        document: imageDoc, alt: form.featuredImageAlt.value, caption: form.featuredImageCaption.value, credit: form.featuredImageCredit.value
      }) : null,
      images: this.images.getRawValue().map(toUpdateImage),
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
    this.modalService.open(template, { size: 'lg', scrollable: true, ariaLabelledBy: 'updatePreviewTitle' });
  }

  public get previewSummary(): string {
    return summaryOrFallback(this.myForm.get('summary')!.value, this.myForm.get('content')!.value);
  }

  public get previewImage(): PreviewImage | null {
    const form = this.myForm.controls;
    const url = this.imageUrl(form.featuredImageDocument.value);
    return url ? {
      url, alt: form.featuredImageAlt.value,
      caption: captionLine({ caption: form.featuredImageCaption.value, credit: form.featuredImageCredit.value })
    } : null;
  }

  public get previewImages(): PreviewImage[] {
    return this.images.getRawValue()
      .map(row => ({ url: this.imageUrl(row.document), alt: row.alt, caption: captionLine(row) }))
      .filter((row): row is PreviewImage => !!row.url);
  }

  private imageUrl(id: string | null): string | null {
    return imageSrc(id, this.imageDocs(), this.imageSrcs());
  }

  /** Picked images and attachments the public cannot see. The API refuses to publish an Update that shows them. */
  public get nonPublicImages(): string[] {
    const attachments = (this.myForm.get('attachments')!.value || [])
      .map((id: any) => this.documents.find(doc => doc._id === documentId(id)));
    return [...this.pickedImageIds().map(id => this.imageDocs().get(id)), ...attachments].filter(blocksPublish).map(documentName);
  }

  private pickedImageIds(): string[] {
    return [this.myForm.get('featuredImageDocument')!.value, ...this.images.getRawValue().map(row => row.document)].filter(Boolean);
  }

  /** Some picked image has no alt text, so the form is invalid until it gets one. */
  public get altNeeded(): boolean {
    return this.myForm.hasError('altRequired') || this.images.controls.some(row => row.hasError('altRequired'));
  }

  /** The primary action leaves the Update live, so its images must be public. */
  public get primaryGoesLive(): boolean {
    const action = this.primaryAction.action;
    return action === 'publish' || action === 'schedule' || this.statusText === 'Published' || this.statusText === 'Scheduled';
  }

  /** Rebuild the row arrays the image fields show. Call after every change to the picked images. */
  private syncImageRows() {
    const form = this.myForm.controls;
    const row = (control: (name: string) => AbstractControl, prefix = '') => ({
      document: control(prefix ? `${prefix}Document` : 'document') as UntypedFormControl,
      alt: control(prefix ? `${prefix}Alt` : 'alt') as UntypedFormControl,
      caption: control(prefix ? `${prefix}Caption` : 'caption') as UntypedFormControl,
      credit: control(prefix ? `${prefix}Credit` : 'credit') as UntypedFormControl
    });
    this.featuredRows = form.featuredImageDocument.value ? [row(name => form[name], 'featuredImage')] : [];
    this.photoRows = this.images.controls.map(group => row(name => group.get(name)!));
    this.releaseImageSrcs();
    this._cdr.markForCheck();
  }

  public get images(): UntypedFormArray {
    return this.myForm.get('images') as UntypedFormArray;
  }

  private imageRow(image?: Partial<UpdateImage>): UntypedFormGroup {
    return new UntypedFormGroup({
      'document': new UntypedFormControl(documentId(image?.document)),
      'alt': new UntypedFormControl(image?.alt || ''),
      'caption': new UntypedFormControl(image?.caption || '', Validators.maxLength(IMAGE_CAPTION_MAX)),
      'credit': new UntypedFormControl(image?.credit || '', Validators.maxLength(IMAGE_CREDIT_MAX))
    }, { validators: imageRowValidator });
  }

  public addFeaturedImage([image]: AddedImage[]) {
    this.addImageDocs([image]);
    this.myForm.patchValue({ featuredImageDocument: image.doc._id, ...NO_FEATURED_TEXT });
    this.syncImageRows();
  }

  public removeFeaturedImage() {
    this.myForm.patchValue({ featuredImageDocument: null, ...NO_FEATURED_TEXT });
    this.syncImageRows();
  }

  public addPhotos(added: AddedImage[]) {
    // Never drops in practice: the field caps adds at remaining(), which counts uploads in flight.
    const room = added.slice(0, IMAGES_MAX - this.images.length);
    this.addImageDocs(room);
    room.forEach(({ doc }) => this.images.push(this.imageRow({ document: doc._id })));
    this.syncImageRows();
  }

  public moveImage({ index, step }: { index: number; step: -1 | 1 }) {
    const row = this.images.at(index);
    this.images.removeAt(index, { emitEvent: false });
    this.images.insert(index + step, row);
    this.syncImageRows();
  }

  public removeImage(index: number) {
    this.images.removeAt(index);
    this.syncImageRows();
  }

  private addImageDocs(added: AddedImage[]) {
    this.rememberDocs(added.map(({ doc }) => doc));
    added.forEach(({ doc, src }) => src && this.setImageSrc(doc._id, src));
  }

  private setImageSrc(id: string, url: string) {
    const old = this.imageSrcs().get(id);
    if (old && old !== url) {
      URL.revokeObjectURL(old);
    }
    this.imageSrcs.update(current => new Map(current).set(id, url));
  }

  /** Revoke previews no row shows any more. */
  private releaseImageSrcs() {
    const picked = new Set(this.pickedImageIds());
    const stale = [...this.imageSrcs()].filter(([id]) => !picked.has(id));
    if (stale.length) {
      stale.forEach(([, url]) => URL.revokeObjectURL(url));
      this.imageSrcs.update(current => new Map([...current].filter(([id]) => picked.has(id))));
    }
  }

  private rememberDocs(docs: any[]) {
    if (docs.length) {
      this.imageDocs.update(current => new Map([...current, ...docs.map(doc => [doc._id, doc] as [string, any])]));
    }
  }

  /** The admin fetch URL needs no token only for public documents; load the rest with the staff token. */
  private loadPrivateThumbnails() {
    this.pickedImageIds()
      .filter(id => !this.imageSrcs().has(id) && !this.srcsLoading.has(id) && !isPublicDocument(this.imageDocs().get(id)))
      .forEach(id => {
        this.srcsLoading.add(id);
        this.documentService.downloadResource(id)
          .then(blob => {
            // The form may be gone or the image removed while the file downloaded.
            if (blob?.size && !this.destroyed && this.pickedImageIds().includes(id)) {
              this.setImageSrc(id, URL.createObjectURL(blob));
              this._cdr.markForCheck();
            }
          })
          .catch(() => { /* the row shows the placeholder */ })
          .finally(() => this.srcsLoading.delete(id));
      });
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
    // A type change can reset the project or its document source; updateProject() owns both.
    if (userChange) {
      this.updateProject();
    }
    this._cdr.markForCheck();
  }

  public updateProject() {
    const currentProjectId = this.myForm.get('project')!.value || null;
    if (this.loadedProjectId && currentProjectId !== this.loadedProjectId) {
      // Picked documents belong to the previous project.
      this.myForm.patchValue({ featuredImageDocument: null, ...NO_FEATURED_TEXT, attachments: [] });
      this.images.clear();
      this.syncImageRows();
    }
    this.loadedProjectId = currentProjectId;
    if (!currentProjectId) {
      this.projectIsSelected = false;
      this.documentsFor.next(null);
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

  public loadProjectDocuments(projectId: string) {
    this.documentsFor.next({ projectId, source: this.typeIsProjectNotificationNews ? 'PROJECT-NOTIFICATION' : 'PROJECT' });
  }

  /** Loads documents for the latest project only; a newer pick cancels the older search. */
  private watchProjectDocuments() {
    // Same project document search the comment period picker uses; first 1000, newest first. Null marks a failed search.
    const search = (projectId: string, source: string) => this.searchService
      .getSearchResults('', 'Document', [{ name: 'project', value: projectId }], 1, 1000, '-datePosted', { documentSource: source })
      .pipe(
        map((res: any): any[] | null => res?.[0]?.data?.searchResults || []),
        catchError(error => {
          this.logger.warn(`Project ${source} document search failed`, 'AddEditActivityComponent', error);
          return of(null);
        })
      );
    this.documentsFor.pipe(
      switchMap(request => {
        this.documentsLoading = !!request;
        this.documentsFailed = false;
        this._cdr.markForCheck();
        // Images uploaded from Update forms live apart from the project's Documents list.
        return request
          ? forkJoin([search(request.projectId, request.source), search(request.projectId, UPDATE_IMAGE_SOURCE)])
          : of([[], []]);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(([docs, updateImages]) => {
      this.documentsFailed = docs === null;
      this.setDocuments(docs ?? []);
      this.rememberDocs([...this.imageDocuments, ...(updateImages ?? [])]);
      this.documentsLoading = false;
      this.loadPrivateThumbnails();
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
    const published = data.publishDate ? new Date(data.publishDate) : null;
    const today = new Date();
    // A stored date before today must not fail the picker's minDate check, or the row cannot be saved.
    this.minPublishDate = convertJSDateToNGBDate(published && published < today ? published : today);
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
      'featuredImageDocument': new UntypedFormControl(documentId(data.featuredImage?.document)),
      'featuredImageAlt': new UntypedFormControl(data.featuredImage?.alt || ''),
      'featuredImageCaption': new UntypedFormControl(data.featuredImage?.caption || '', Validators.maxLength(IMAGE_CAPTION_MAX)),
      'featuredImageCredit': new UntypedFormControl(data.featuredImage?.credit || '', Validators.maxLength(IMAGE_CREDIT_MAX)),
      'images': new UntypedFormArray((data.images || []).map((image: UpdateImage) => this.imageRow(image)),
        Validators.maxLength(IMAGES_MAX)),
      'attachments': new UntypedFormControl(data.attachments || []),
      'regions': new UntypedFormControl(data.regions || []),
      'location': new UntypedFormControl(data.location || ''),
      'engagementUrl': new UntypedFormControl(data.engagementUrl || '', httpUrlValidator),
      'subject': new UntypedFormControl(data.subject || null),
      'publishWhen': new UntypedFormControl(published && published > today ? 'later' : 'now'),
      'publishDate': new UntypedFormControl(published ? convertJSDateToNGBDate(published) : null),
      'publishTime': new UntypedFormControl(
        published ? { hour: published.getHours(), minute: published.getMinutes() } : { hour: 9, minute: 0 }),
    }, { validators: updateRulesValidator });
    this.syncImageRows();
  }
}
