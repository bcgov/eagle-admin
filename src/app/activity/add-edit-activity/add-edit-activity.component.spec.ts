import { ApplicationRef, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NgbConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { AddEditActivityComponent } from './add-edit-activity.component';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { ProjectService } from 'src/app/services/project.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { SearchService } from 'src/app/services/search.service';
import { ToastService } from 'src/app/services/toast.service';

describe('AddEditActivityComponent', () => {
  let searchService: jasmine.SpyObj<SearchService>;
  let recentActivityService: jasmine.SpyObj<RecentActivityService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let documentService: jasmine.SpyObj<DocumentService>;
  let fixture: ComponentFixture<AddEditActivityComponent>;

  // Form-logic specs skip detectChanges; only the button specs render the template.
  function create(activityId: string | null, row: any = null, periods: any[] = [], realModal = false): AddEditActivityComponent {
    searchService = jasmine.createSpyObj('SearchService', ['getItem', 'getSearchResults']);
    searchService.getItem.and.returnValue(of({ data: row } as any));
    searchService.getSearchResults.and.returnValue(of([{ data: { searchResults: [] } }] as any));
    recentActivityService = jasmine.createSpyObj('RecentActivityService', ['add', 'save']);
    recentActivityService.add.and.returnValue(of({}));
    recentActivityService.save.and.returnValue(of({}));
    toastService = jasmine.createSpyObj('ToastService', ['success', 'error']);
    const projectService = jasmine.createSpyObj('ProjectService', ['getAll', 'getById']);
    projectService.getAll.and.returnValue(of({ data: [] }));
    projectService.getById.and.returnValue(of({ location: 'Kamloops' }));
    const notificationProjectService = jasmine.createSpyObj('NotificationProjectService', ['getAll']);
    notificationProjectService.getAll.and.returnValue(of({ data: [] }));
    const commentPeriodService = jasmine.createSpyObj('CommentPeriodService', ['getAllByProjectId']);
    commentPeriodService.getAllByProjectId.and.returnValue(of({ data: periods }));
    documentService = jasmine.createSpyObj('DocumentService', ['addWithProgress', 'downloadResource']);
    documentService.downloadResource.and.resolveTo(new Blob());

    TestBed.configureTestingModule({
      imports: [AddEditActivityComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(activityId ? { activityId } : {}) } } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        ...(realModal ? [] : [{ provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open']) }]),
        { provide: SearchService, useValue: searchService },
        { provide: RecentActivityService, useValue: recentActivityService },
        { provide: ToastService, useValue: toastService },
        { provide: ProjectService, useValue: projectService },
        { provide: NotificationProjectService, useValue: notificationProjectService },
        { provide: CommentPeriodService, useValue: commentPeriodService },
        { provide: DocumentService, useValue: documentService },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['warn', 'error', 'info', 'debug']) },
        { provide: ConfigService, useValue: { ensureListsLoaded: () => Promise.resolve(), listsSignal: signal([]), regions: [] } }
      ]
    });
    fixture = TestBed.createComponent(AddEditActivityComponent);
    const component = fixture.componentInstance;
    component.ngOnInit();
    return component;
  }

  function fillNews(component: AddEditActivityComponent) {
    component.myForm.patchValue({ type: 'News', category: 'Engagement', headline: 'H', content: '<p>Body</p>' });
    component.updateType();
    component.myForm.patchValue({ project: 'p1' });
    component.updateProject();
  }

  const sentBody = (spy: jasmine.Spy) => spy.calls.mostRecent().args[0];

  // ngOnInit runs again on the first detectChanges, so render before patching the form.
  function render(activityId: string | null, row: any = null, realModal = false): AddEditActivityComponent {
    const component = create(activityId, row, [], realModal);
    fixture.detectChanges();
    return component;
  }

  function footerButtons(): HTMLButtonElement[] {
    fixture.detectChanges();
    return Array.from(fixture.nativeElement.querySelectorAll('.btn-toolbar button'));
  }

  const footerLabels = () => footerButtons().map(b => b.textContent!.trim());
  const footerButton = (label: string) => footerButtons().find(b => b.textContent!.trim() === label)!;
  const query = (selector: string) => fixture.nativeElement.querySelector(selector);

  function chooseScheduleForLater() {
    (query('#publishLater') as HTMLInputElement).click();
    fixture.detectChanges();
  }

  describe('publishing choice and footer buttons', () => {
    const base = { _id: 'a1', type: 'News', project: 'p1', category: 'Engagement', headline: 'H', content: '<p>Body</p>', dateAdded: '2026-09-01T00:00:00Z' };

    it('starts a new Update on Publish immediately, with no date pickers and one Publish button', () => {
      const component = render(null);
      fillNews(component);
      expect(footerLabels()).toEqual(['Cancel', 'Preview', 'Save draft', 'Publish']);
      expect((query('#publishNow') as HTMLInputElement).checked).toBeTrue();
      expect(query('#publishDate')).toBeNull();
    });

    it('publishes now when the primary button is clicked under Publish immediately', () => {
      const component = render(null);
      fillNews(component);
      footerButton('Publish').click();
      expect(sentBody(recentActivityService.add).status).toBe('published');
      expect(sentBody(recentActivityService.add).publishDate).toBeNull();
    });

    it('turns the primary button into Schedule and sends the picked time under Schedule for later', () => {
      const component = render(null);
      fillNews(component);
      chooseScheduleForLater();
      expect(query('#publishDate')).not.toBeNull();
      component.myForm.patchValue({ publishDate: { year: 2099, month: 1, day: 2 }, publishTime: { hour: 14, minute: 30 } });
      expect(footerLabels()).toEqual(['Cancel', 'Preview', 'Save draft', 'Schedule']);
      footerButton('Schedule').click();
      expect(sentBody(recentActivityService.add).status).toBe('published');
      expect(sentBody(recentActivityService.add).publishDate).toEqual(new Date(2099, 0, 2, 14, 30));
    });

    it('keeps Schedule disabled until a date is picked', () => {
      const component = render(null);
      fillNews(component);
      component.myForm.patchValue({ publishWhen: 'later' });
      expect(footerButton('Schedule').disabled).toBeTrue();
    });

    it('saves a draft from Save draft, with no publish date under Publish immediately', () => {
      const component = render(null);
      fillNews(component);
      component.myForm.patchValue({ publishWhen: 'later', publishDate: { year: 2099, month: 1, day: 2 } });
      component.myForm.patchValue({ publishWhen: 'now' });
      footerButton('Save draft').click();
      expect(sentBody(recentActivityService.add).status).toBe('draft');
      expect(sentBody(recentActivityService.add).active).toBeFalse();
      expect(sentBody(recentActivityService.add).publishDate).toBeNull();
    });

    it('offers Update and Unpublish on a Published Update, and Update keeps it live with its date', () => {
      render('a1', { ...base, status: 'published', publishDate: '2026-09-02T17:30:00Z' });
      expect(footerLabels()).toEqual(['Cancel', 'Preview', 'Unpublish', 'Update']);
      expect(query('#publishNow')).toBeNull();
      footerButton('Update').click();
      expect(recentActivityService.add).not.toHaveBeenCalled();
      expect(sentBody(recentActivityService.save).status).toBe('published');
      expect(sentBody(recentActivityService.save).publishDate).toEqual(new Date('2026-09-02T17:30:00Z'));
    });

    it('moves a Published Update to draft after Unpublish is confirmed', async () => {
      render('a1', { ...base, status: 'published', publishDate: '2026-09-02T00:00:00Z' });
      const modalRef = { componentInstance: {} as any, result: Promise.resolve(true) };
      (TestBed.inject(NgbModal).open as jasmine.Spy).and.returnValue(modalRef);
      footerButton('Unpublish').click();
      await fixture.whenStable();
      expect(modalRef.componentInstance.title).toBe('Unpublish');
      expect(sentBody(recentActivityService.save).status).toBe('draft');
    });

    it('leaves a Published Update alone when Unpublish is cancelled', async () => {
      render('a1', { ...base, status: 'published', publishDate: '2026-09-02T00:00:00Z' });
      (TestBed.inject(NgbModal).open as jasmine.Spy).and.returnValue({ componentInstance: {}, result: Promise.resolve(false) });
      footerButton('Unpublish').click();
      await fixture.whenStable();
      expect(recentActivityService.save).not.toHaveBeenCalled();
    });

    it('preselects Schedule for later with the stored date on a Scheduled Update', () => {
      const component = render('a1', { ...base, status: 'published', publishDate: '2099-01-02T22:30:00Z' });
      expect((query('#publishLater') as HTMLInputElement).checked).toBeTrue();
      expect(component.myForm.get('publishDate')!.value).toEqual(jasmine.objectContaining({ year: 2099, month: 1 }));
      expect(footerLabels()).toEqual(['Cancel', 'Preview', 'Unschedule', 'Schedule']);
    });

    it('offers Save and Save draft on an Archived Update, and Save keeps it archived', () => {
      render('a1', { ...base, status: 'archived' });
      expect(footerLabels()).toEqual(['Cancel', 'Preview', 'Save draft', 'Save']);
      footerButton('Save').click();
      expect(sentBody(recentActivityService.save).status).toBe('archived');
    });
  });

  describe('preview', () => {
    it('shows the headline as the dialog title with no underline', () => {
      const component = render(null, null, true);
      TestBed.inject(NgbConfig).animation = false;
      component.myForm.patchValue({ headline: 'Bridge opens' });
      footerButton('Preview').click();
      TestBed.inject(ApplicationRef).tick();
      const title = document.getElementById('updatePreviewTitle')!;
      expect(title.textContent!.trim()).toBe('Bridge opens');
      expect(getComputedStyle(title).borderBottomStyle).toBe('none');
      expect(getComputedStyle(title).textTransform).toBe('none');
      expect(getComputedStyle(title.parentElement!).borderBottomStyle).toBe('none');
      TestBed.inject(NgbModal).dismissAll();
    });
  });

  describe('keeping saved project and comment period', () => {
    it('keeps the stored project of a post type with no project select', () => {
      const component = create('a1', {
        _id: 'a1', type: 'Project Notification Public Comment Period', project: 'pn1', dateAdded: '2026-09-01T00:00:00Z'
      });
      expect(component.myForm.get('project')!.value).toBe('pn1');
    });

    it('restores the saved comment period when the type is switched back to PCP', () => {
      const component = create('a1', {
        _id: 'a1', type: 'Public Comment Period', project: 'p1', pcp: 'c1', dateAdded: '2026-09-01T00:00:00Z'
      }, [{ _id: 'c1' }]);
      component.myForm.patchValue({ type: 'News' });
      component.updateType(true);
      component.myForm.patchValue({ type: 'Public Comment Period' });
      component.updateType(true);
      expect(component.myForm.get('pcp')!.value).toBe('c1');
    });
  });

  describe('loading an existing Update', () => {
    const row = {
      _id: 'a1', type: 'Project Notification News', project: 'pn1', dateAdded: '2026-09-01T00:00:00Z',
      status: 'published', publishDate: '2026-09-02T00:00:00Z', featuredImage: { document: 'd1', alt: 'Site' }
    };

    it('loads Project Notification News documents from the project notification source', () => {
      create('a1', row);
      // A second search loads the images uploaded from Update forms.
      expect(searchService.getSearchResults.calls.allArgs().map(args => args[6])).toEqual([
        { documentSource: 'PROJECT-NOTIFICATION' }, { documentSource: 'UPDATE' }
      ]);
    });

    it('keeps the saved featured image on load', () => {
      const component = create('a1', row);
      expect(component.myForm.get('featuredImageDocument')!.value).toBe('d1');
    });

    it('clears picked documents when the project changes', () => {
      const component = create('a1', row);
      component.myForm.patchValue({ attachments: ['d2'], project: 'pn2' });
      component.updateProject();
      expect(component.myForm.get('featuredImageDocument')!.value).toBeNull();
      expect(component.myForm.get('attachments')!.value).toEqual([]);
    });

    it('sends the stored publish date and time back on Save', () => {
      const component = create('a1', { ...row, publishDate: '2026-09-02T17:30:00Z' });
      component.save('keep');
      expect(sentBody(recentActivityService.save).publishDate).toEqual(new Date('2026-09-02T17:30:00Z'));
    });

    it('accepts a stored publish day before today in the picker', () => {
      const component = render('a1', { ...row, status: 'draft' });
      chooseScheduleForLater();
      component.myForm.get('publishDate')!.updateValueAndValidity();
      expect(component.myForm.get('publishDate')!.errors).toBeNull();
    });

    it('Save keeps a published Update published, through PUT', () => {
      const component = create('a1', row);
      component.save('keep');
      expect(recentActivityService.add).not.toHaveBeenCalled();
      expect(sentBody(recentActivityService.save).status).toBe('published');
    });
  });

  describe('edit conflicts', () => {
    const row = { _id: 'a1', type: 'News', project: 'p1', dateAdded: '2026-09-01T00:00:00Z', status: 'draft', dateUpdated: '2026-09-20T10:00:00.000Z' };

    it('sends the loaded dateUpdated in the PUT body', () => {
      const component = create('a1', row);
      component.save('keep');
      expect(sentBody(recentActivityService.save).dateUpdated).toBe('2026-09-20T10:00:00.000Z');
    });

    it('shows the changed-by-someone-else toast on 409 and stays on the form', () => {
      const component = create('a1', row);
      recentActivityService.save.and.returnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
      component.save('keep');
      expect(toastService.error).toHaveBeenCalledWith('This update was changed by someone else. Reload to see the latest.');
      expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
    });
  });

  describe('saving a new Update', () => {
    it('sends a draft as inactive, through POST', () => {
      const component = create(null);
      fillNews(component);
      component.save('draft');
      expect(sentBody(recentActivityService.add).status).toBe('draft');
      expect(sentBody(recentActivityService.add).active).toBeFalse();
    });

    it('sends Publish with no publish date', () => {
      const component = create(null);
      fillNews(component);
      component.save('publish');
      expect(sentBody(recentActivityService.add).publishDate).toBeNull();
    });

    it('sends Schedule with the chosen future date', () => {
      const component = create(null);
      fillNews(component);
      component.myForm.patchValue({ publishWhen: 'later', publishDate: { year: 2099, month: 1, day: 2 }, publishTime: { hour: 14, minute: 30 } });
      component.save('schedule');
      expect(sentBody(recentActivityService.add).publishDate).toEqual(new Date(2099, 0, 2, 14, 30));
    });

    it('does not send a Schedule whose date has passed, and says why', () => {
      const component = create(null);
      fillNews(component);
      component.myForm.patchValue({ publishWhen: 'later', publishDate: { year: 2020, month: 1, day: 1 } });
      component.save('schedule');
      expect(recentActivityService.add).not.toHaveBeenCalled();
      expect(toastService.error).toHaveBeenCalledWith(jasmine.stringMatching(/future/));
    });

    describe('publish time today', () => {
      beforeEach(() => jasmine.clock().install().mockDate(new Date(2026, 8, 23, 12, 0)));
      afterEach(() => jasmine.clock().uninstall());

      it('does not offer Schedule for a time earlier today', () => {
        const component = create(null);
        component.myForm.patchValue({ publishWhen: 'later', publishDate: { year: 2026, month: 9, day: 23 }, publishTime: { hour: 11, minute: 59 } });
        expect(component.canSchedule()).toBeFalse();
      });

      it('offers Schedule for a time later today', () => {
        const component = create(null);
        component.myForm.patchValue({ publishWhen: 'later', publishDate: { year: 2026, month: 9, day: 23 }, publishTime: { hour: 12, minute: 1 } });
        expect(component.canSchedule()).toBeTrue();
      });
    });

    it('does not accept a publish day before today in the picker', () => {
      const component = render(null);
      chooseScheduleForLater();
      component.myForm.patchValue({ publishDate: { year: 2020, month: 1, day: 1 } });
      expect(component.myForm.get('publishDate')!.hasError('ngbDate')).toBeTrue();
    });

    it('drops the subject unless the category is Corporate', () => {
      const component = create(null);
      fillNews(component);
      component.myForm.patchValue({ subject: 'Policy' });
      component.save('draft');
      expect(sentBody(recentActivityService.add).subject).toBeNull();
    });

    it('sends no featured image when none is picked, and a trimmed engagement URL', () => {
      const component = create(null);
      fillNews(component);
      component.myForm.patchValue({ engagementUrl: '  https://engage.gov.bc.ca/x  ' });
      component.save('draft');
      expect(sentBody(recentActivityService.add).featuredImage).toBeNull();
      expect(sentBody(recentActivityService.add).engagementUrl).toBe('https://engage.gov.bc.ca/x');
    });

    describe('switching to a type with no project', () => {
      function pickThenSwitchToPcp(): AddEditActivityComponent {
        const component = create(null);
        searchService.getSearchResults.and.returnValue(of([{ data: { searchResults: [
          { _id: 'd1', documentFileName: 'site.jpg' }, { _id: 'd2', documentFileName: 'report.pdf' }
        ] } }] as any));
        fillNews(component);
        component.myForm.patchValue({ featuredImageDocument: 'd1', featuredImageAlt: 'x', attachments: ['d2'] });
        component.myForm.patchValue({ type: 'Project Notification Public Comment Period' });
        component.updateType(true);
        return component;
      }

      it('sends no featured image and no attachments from the old project', () => {
        const component = pickThenSwitchToPcp();
        component.save('draft');
        expect(sentBody(recentActivityService.add).featuredImage).toBeNull();
        expect(sentBody(recentActivityService.add).attachments).toEqual([]);
      });

      it('stops listing the old project documents in the pickers', () => {
        const component = pickThenSwitchToPcp();
        expect(component.documents).toEqual([]);
        expect(component.imageDocuments).toEqual([]);
      });
    });

    it('sends project null for a post type with no project, and the form stays valid', () => {
      const component = create(null);
      component.myForm.patchValue({
        type: 'Project Notification Public Comment Period', category: 'Engagement', headline: 'H', content: '<p>Body</p>',
        notificationName: 'PN', documentUrl: 'https://engage.gov.bc.ca/pcp'
      });
      component.updateType();
      expect(component.myForm.valid).toBeTrue();
      component.save('publish');
      expect(sentBody(recentActivityService.add).project).toBeNull();
    });
  });

  describe('photos and featured image', () => {
    const publicDoc = (_id: string, name: string) => ({ _id, displayName: name, documentFileName: name, documentSource: 'PROJECT', read: ['public'] });
    const privateDoc = (_id: string, name: string) => ({ _id, displayName: name, documentFileName: name, documentSource: 'PROJECT', read: ['staff'] });
    const photoIds = (component: AddEditActivityComponent) => component.photoRows.map(row => row.document.value);
    const statusMessage = () => (query('[role=status] #altNeeded')?.textContent ?? '').trim();

    function withPhotos(...ids: string[]): AddEditActivityComponent {
      const component = create(null);
      fillNews(component);
      component.addPhotos(ids.map(id => ({ doc: publicDoc(id, `${id}.jpg`) })));
      return component;
    }

    it('sends each photo with trimmed alt and caption, and leaves out a blank credit', () => {
      const component = withPhotos('i1', 'i2');
      component.images.at(0).patchValue({ alt: ' Dam face ', caption: '  Spillway  ', credit: '   ' });
      component.images.at(1).patchValue({ alt: 'Weir', caption: '', credit: ' EAO ' });
      component.save('draft');
      const images = sentBody(recentActivityService.add).images;
      expect(images[0]).toEqual({ document: 'i1', alt: 'Dam face', caption: 'Spillway', credit: undefined });
      expect(images[1]).toEqual({ document: 'i2', alt: 'Weir', caption: undefined, credit: 'EAO' });
    });

    it('sends the featured image with trimmed text and leaves out a blank caption', () => {
      const component = create(null);
      fillNews(component);
      component.addFeaturedImage([{ doc: publicDoc('f1', 'top.jpg') }]);
      component.myForm.patchValue({ featuredImageAlt: ' Top ', featuredImageCaption: ' ', featuredImageCredit: ' BC Gov ' });
      component.save('draft');
      expect(sentBody(recentActivityService.add).featuredImage).toEqual({ document: 'f1', alt: 'Top', caption: undefined, credit: 'BC Gov' });
    });

    it('adds picked photos as rows in the order given', () => {
      expect(photoIds(withPhotos('i1', 'i2'))).toEqual(['i1', 'i2']);
    });

    it('adds no more than five photos', () => {
      expect(photoIds(withPhotos('i1', 'i2', 'i3', 'i4', 'i5', 'i6'))).toEqual(['i1', 'i2', 'i3', 'i4', 'i5']);
    });

    it('moves a photo down one place, taking its alt text with it', () => {
      const component = withPhotos('i1', 'i2', 'i3');
      component.images.at(0).patchValue({ alt: 'Dam' });
      component.moveImage({ index: 0, step: 1 });
      expect(photoIds(component)).toEqual(['i2', 'i1', 'i3']);
      expect(component.photoRows[1].alt.value).toBe('Dam');
    });

    it('moves a photo up one place', () => {
      const component = withPhotos('i1', 'i2', 'i3');
      component.moveImage({ index: 2, step: -1 });
      expect(photoIds(component)).toEqual(['i1', 'i3', 'i2']);
    });

    it('removes only the photo asked for', () => {
      const component = withPhotos('i1', 'i2', 'i3');
      component.removeImage(1);
      expect(photoIds(component)).toEqual(['i1', 'i3']);
    });

    describe('images the public cannot see', () => {
      function renderNews(projectDocs: any[] = []): AddEditActivityComponent {
        const component = render(null);
        searchService.getSearchResults.and.returnValue(of([{ data: { searchResults: projectDocs } }] as any));
        fillNews(component);
        return component;
      }

      it('turns Publish off and names a picked photo that is not public', () => {
        const component = renderNews();
        component.addPhotos([{ doc: privateDoc('i1', 'Site plan.jpg') }]);
        component.images.at(0).patchValue({ alt: 'Plan' });
        expect(footerButton('Publish').disabled).toBeTrue();
        expect(query('#publishBlocked').textContent).toContain('Site plan.jpg is not public');
      });

      it('turns Publish off and names a picked attachment that is not public', () => {
        const component = renderNews([privateDoc('d2', 'Report.pdf')]);
        component.myForm.patchValue({ attachments: ['d2'] });
        expect(footerButton('Publish').disabled).toBeTrue();
        expect(query('#publishBlocked').textContent).toContain('Report.pdf is not public');
      });

      it('leaves Publish on for a public attachment', () => {
        const component = renderNews([publicDoc('d2', 'Report.pdf')]);
        component.myForm.patchValue({ attachments: ['d2'] });
        expect(footerButton('Publish').disabled).toBeFalse();
        expect(query('#publishBlocked')).toBeNull();
      });

      it('still lets a draft with a non-public photo be saved', () => {
        const component = renderNews();
        component.addPhotos([{ doc: privateDoc('i1', 'Site plan.jpg') }]);
        component.images.at(0).patchValue({ alt: 'Plan' });
        expect(footerButton('Save draft').disabled).toBeFalse();
      });
    });

    it('previews public photos from the fetch URL and new uploads from their local copy, caption and credit on one line', () => {
      const component = render(null, null, true);
      TestBed.inject(NgbConfig).animation = false;
      fillNews(component);
      component.addPhotos([
        { doc: publicDoc('i1', 'dam.jpg') },
        { doc: { _id: 'u1', documentFileName: 'new.png', documentSource: 'UPDATE', read: [] }, src: 'blob:local-u1' },
        { doc: privateDoc('i3', 'plan.jpg') }
      ]);
      component.images.at(0).patchValue({ alt: 'Dam', caption: 'Spillway', credit: 'EAO' });
      component.images.at(1).patchValue({ alt: 'New' });
      footerButton('Preview').click();
      TestBed.inject(ApplicationRef).tick();
      const figures = Array.from(document.querySelectorAll('ngb-modal-window .row figure'));
      expect(figures.map(f => f.querySelector('img')!.getAttribute('src'))).toEqual(['/api/document/i1/fetch/dam.jpg', 'blob:local-u1']);
      expect(figures.map(f => f.querySelector('img')!.getAttribute('alt'))).toEqual(['Dam', 'New']);
      expect(figures.map(f => f.querySelector('figcaption')?.textContent!.trim() ?? null)).toEqual(['Spillway Credit: EAO', null]);
      TestBed.inject(NgbModal).dismissAll();
    });

    it('keeps Schedule off and asks for a future time when the time is cleared', () => {
      const component = render(null);
      fillNews(component);
      chooseScheduleForLater();
      component.myForm.patchValue({ publishDate: { year: 2099, month: 1, day: 2 }, publishTime: null });
      expect(footerButton('Schedule').disabled).toBeTrue();
      expect(fixture.nativeElement.textContent).toContain('Pick a date and time in the future.');
    });

    describe('missing alt text', () => {
      it('says so in the status region when a photo has none, and both save buttons point at it', () => {
        const component = render(null);
        fillNews(component);
        component.addPhotos([{ doc: publicDoc('i1', 'dam.jpg') }]);
        expect(footerButton('Save draft').getAttribute('aria-describedby')).toBe('altNeeded');
        expect(footerButton('Publish').getAttribute('aria-describedby')).toBe('altNeeded');
        expect(statusMessage()).toBe('Add alt text to every image before you save.');
      });

      it('says so when the featured image has none', () => {
        const component = render(null);
        fillNews(component);
        component.addFeaturedImage([{ doc: publicDoc('f1', 'top.jpg') }]);
        fixture.detectChanges();
        expect(statusMessage()).toBe('Add alt text to every image before you save.');
      });

      it('drops the message and the button link once every image has alt text', () => {
        const component = render(null);
        fillNews(component);
        component.addPhotos([{ doc: publicDoc('i1', 'dam.jpg') }]);
        component.images.at(0).patchValue({ alt: 'Dam' });
        expect(footerButton('Publish').getAttribute('aria-describedby')).toBeNull();
        expect(statusMessage()).toBe('');
      });
    });
  });

  describe('project document search', () => {
    const found = (id: string) => of([{ data: { searchResults: [{ _id: id, documentFileName: `${id}.pdf` }] } }] as any);

    it('clears the load error as soon as a new project search starts', () => {
      const component = create(null);
      searchService.getSearchResults.and.returnValue(throwError(() => new Error('search down')));
      fillNews(component);
      expect(component.documentsFailed).toBeTrue();
      searchService.getSearchResults.and.returnValue(new Subject<any>());
      component.myForm.patchValue({ project: 'p2' });
      component.updateProject();
      expect(component.documentsFailed).toBeFalse();
    });

    it('keeps the documents of the latest project when an older search answers late', () => {
      const component = create(null);
      const late = new Subject<any>();
      searchService.getSearchResults.and.callFake(((_keys: string, _schema: string, filters: any[]) =>
        filters[0].value === 'p1' ? late : found('p2doc')) as any);
      fillNews(component);
      component.myForm.patchValue({ project: 'p2' });
      component.updateProject();
      late.next([{ data: { searchResults: [{ _id: 'p1doc', documentFileName: 'p1doc.pdf' }] } }]);
      late.complete();
      expect(component.documents.map(doc => doc._id)).toEqual(['p2doc']);
    });
  });
});
