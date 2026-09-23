import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AddEditActivityComponent } from './add-edit-activity.component';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { ConfigService } from 'src/app/services/config.service';
import { NotificationProjectService } from 'src/app/services/notification-project.service';
import { ProjectService } from 'src/app/services/project.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { SearchService } from 'src/app/services/search.service';
import { ToastService } from 'src/app/services/toast.service';

describe('AddEditActivityComponent', () => {
  let searchService: jasmine.SpyObj<SearchService>;
  let recentActivityService: jasmine.SpyObj<RecentActivityService>;
  let toastService: jasmine.SpyObj<ToastService>;
  let fixture: ComponentFixture<AddEditActivityComponent>;

  // Form-logic specs skip detectChanges; only the button specs render the template.
  function create(activityId: string | null, row: any = null, periods: any[] = []): AddEditActivityComponent {
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

    TestBed.configureTestingModule({
      imports: [AddEditActivityComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap(activityId ? { activityId } : {}) } } },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open']) },
        { provide: SearchService, useValue: searchService },
        { provide: RecentActivityService, useValue: recentActivityService },
        { provide: ToastService, useValue: toastService },
        { provide: ProjectService, useValue: projectService },
        { provide: NotificationProjectService, useValue: notificationProjectService },
        { provide: CommentPeriodService, useValue: commentPeriodService },
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

  function buttonLabels(): string[] {
    fixture.detectChanges();
    return Array.from(fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>)
      .map(b => b.textContent!.trim());
  }

  describe('status buttons', () => {
    const base = { _id: 'a1', type: 'News', project: 'p1', dateAdded: '2026-09-01T00:00:00Z' };

    it('hides Publish on a Published Update and offers Save instead', () => {
      create('a1', { ...base, status: 'published', publishDate: '2026-09-02T00:00:00Z' });
      const labels = buttonLabels();
      expect(labels).not.toContain('Publish');
      expect(labels).toContain('Save');
    });

    it('offers Save on an Archived Update', () => {
      create('a1', { ...base, status: 'archived' });
      expect(buttonLabels()).toContain('Save');
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
      expect(searchService.getSearchResults.calls.mostRecent().args[6]).toEqual({ documentSource: 'PROJECT-NOTIFICATION' });
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
      component.myForm.patchValue({ publishDate: '2099-01-01T09:00' });
      component.save('schedule');
      expect(sentBody(recentActivityService.add).publishDate).toEqual(new Date('2099-01-01T09:00'));
    });

    it('does not send a Schedule whose date has passed, and says why', () => {
      const component = create(null);
      fillNews(component);
      component.myForm.patchValue({ publishDate: '2020-01-01T09:00' });
      component.save('schedule');
      expect(recentActivityService.add).not.toHaveBeenCalled();
      expect(toastService.error).toHaveBeenCalledWith(jasmine.stringMatching(/future/));
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
});
