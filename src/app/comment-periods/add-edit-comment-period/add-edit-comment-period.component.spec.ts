import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AddEditCommentPeriodComponent } from './add-edit-comment-period.component';
import { CommentPeriod } from 'src/app/models/commentPeriod';
import { CommentPeriodService } from 'src/app/services/commentperiod.service';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { toLegacyCommentPeriod } from '../comment-period-legacy';
import { nativeCommentPeriod } from 'src/app/models/demi/comment-period.fixture';

describe('AddEditCommentPeriodComponent', () => {
  let commentPeriodService: jasmine.SpyObj<CommentPeriodService>;
  let documentService: jasmine.SpyObj<DocumentService>;
  let storage: { state: any };

  // Form-logic specs skip detectChanges, so the TinyMCE template never renders.
  function open(
    params: Record<string, string>, path: string, project: object, period?: CommentPeriod
  ): AddEditCommentPeriodComponent {
    commentPeriodService = jasmine.createSpyObj('CommentPeriodService', ['save', 'add']);
    commentPeriodService.save.and.returnValue(of(nativeCommentPeriod()));
    commentPeriodService.add.and.returnValue(of(nativeCommentPeriod()));
    documentService = jasmine.createSpyObj('DocumentService', ['byIdsNative']);
    documentService.byIdsNative.and.returnValue(of([
      { id: '5c0a6c1b2e3f4a5b6c7d8e01', eagleId: '5c0a6c1b2e3f4a5b6c7d8e01', projectId: 'track-1', displayName: 'Notice', documentFileName: 'notice.pdf' }
    ]));
    storage = { state: {} };

    TestBed.configureTestingModule({
      imports: [AddEditCommentPeriodComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(params) },
            url: of([{ path }])
          }
        },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: CommentPeriodService, useValue: commentPeriodService },
        { provide: ConfigService, useValue: { lists: [] } },
        { provide: DocumentService, useValue: documentService },
        { provide: StorageService, useValue: storage },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['success', 'error']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['warn', 'error', 'info', 'debug']) }
      ]
    });
    const fixture = TestBed.createComponent(AddEditCommentPeriodComponent);
    fixture.componentRef.setInput('project', project);
    fixture.componentRef.setInput('commentPeriod', period);
    fixture.componentInstance.ngOnInit();
    return fixture.componentInstance;
  }

  function openForEdit(period: CommentPeriod): AddEditCommentPeriodComponent {
    return open({ projId: 'p1', commentPeriodId: 'cp1' }, 'edit', { _id: 'p1', name: 'Site C', legislationYear: 2018 }, period);
  }

  function submitNew(component: AddEditCommentPeriodComponent) {
    component.commentPeriodForm.patchValue({
      startDate: { year: 2026, month: 3, day: 1 }, endDate: { year: 2026, month: 4, day: 1 }, infoForCommentText: 'Application'
    });
    component.onSubmit();
  }

  it('add under /p POSTs projectId = project demiId and returns to the route parent', () => {
    // A DEMI-minted project has no Eagle _id; the route carries its DEMI id.
    const component = open({ projId: 'demi-p1' }, 'add', { _id: null, demiId: 'demi-p1', name: 'Site C' });

    submitNew(component);

    expect(commentPeriodService.add).toHaveBeenCalledOnceWith(jasmine.any(Object), 'demi-p1');
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/p', 'demi-p1', 'comment-periods']);
  });

  it('add under /pn POSTs projectId = notification demiId', () => {
    const notification = { _id: '5f0a6c1b2e3f4a5b6c7d8e01', demiId: '7c1d2e3f-0a1b-4c5d-8e9f-0a1b2c3d4e5f', name: 'Notice' };
    const component = open({ notificationProjectId: notification._id }, 'add', notification);

    submitNew(component);

    expect(commentPeriodService.add).toHaveBeenCalledOnceWith(jasmine.any(Object), notification.demiId);
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/pn', notification._id, 'comment-periods']);
  });

  it('stays on the form when the add is refused', () => {
    const component = open({ projId: 'p1' }, 'add', { _id: 'p1', demiId: 'demi-p1', name: 'Site C' });
    commentPeriodService.add.and.returnValue(throwError(() => new Error('refused')));

    submitNew(component);

    expect(component.loading).toBeFalse();
    expect(TestBed.inject(Router).navigate).not.toHaveBeenCalled();
  });

  it('keeps a legacy public period published when it is saved unchanged', () => {
    const component = openForEdit(new CommentPeriod({
      _id: 'cp1',
      dateStarted: '2026-01-05T17:00:00Z',
      dateCompleted: '2026-02-05T17:00:00Z',
      instructions: '<h4>Comment Period on the Application for Site C Project.</h4> Details',
      read: ['public', 'staff', 'sysadmin'],
      isPublished: null
    }));

    component.onSubmit();

    // No published state to set: the form showed the legacy period as published.
    expect(commentPeriodService.save.calls.mostRecent().args[1]).toBeUndefined();
  });

  describe('published state on save', () => {
    function editStaffPeriod(isPublished: boolean) {
      const period = toLegacyCommentPeriod(nativeCommentPeriod({ isPublished }), ['sysadmin']);
      return { period, component: openForEdit(period) };
    }

    it('asks to publish when the form turns a hidden period published', () => {
      const { period, component } = editStaffPeriod(false);
      component.commentPeriodForm.patchValue({ publishedStateSel: 'published' });

      component.onSubmit();

      expect(commentPeriodService.save).toHaveBeenCalledOnceWith(jasmine.objectContaining({ demiId: period.demiId }), true);
    });

    it('asks to un-publish when the form hides a published period', () => {
      const { component } = editStaffPeriod(true);
      component.commentPeriodForm.patchValue({ publishedStateSel: 'unpublished' });

      component.onSubmit();

      expect(commentPeriodService.save.calls.mostRecent().args[1]).toBeFalse();
    });

    it('leaves the loaded period unchanged when the save is refused', () => {
      const { period, component } = editStaffPeriod(false);
      commentPeriodService.save.and.returnValue(throwError(() => new Error('refused')));
      component.commentPeriodForm.patchValue({ publishedStateSel: 'published', commentTipText: 'New tip' });

      component.onSubmit();

      expect(period.isPublished).toBeFalse();
      expect(period.commentTip).not.toBe('New tip');
      expect(component.loading).toBeFalse();
    });
  });

  describe('open houses', () => {
    const DATE = { year: 2026, month: 3, day: 10 };

    function openWithRow(row: { description: string | null; eventDate: unknown }) {
      const component = open({ projId: 'p1' }, 'add', { _id: 'p1', demiId: 'demi-p1', name: 'Site C' });
      component.commentPeriodForm.get('openHouses').setValue([row]);
      return component;
    }

    for (const [label, row] of [
      ['a blank description', { description: '   ', eventDate: DATE }],
      ['no date', { description: 'Town hall', eventDate: null }],
      ['a date that does not parse', { description: 'Town hall', eventDate: '31/02/20x6' }]
    ] as const) {
      it(`stops the submit and sends nothing for a row with ${label}`, () => {
        const component = openWithRow(row);

        submitNew(component);

        expect(TestBed.inject(ToastService).error).toHaveBeenCalledWith('Each open house needs a description and a valid event date.');
        expect(commentPeriodService.add).not.toHaveBeenCalled();
        expect(component.loading).toBeFalse();
      });
    }

    it('drops a row left blank', () => {
      submitNew(openWithRow({ description: '', eventDate: null }));

      expect(commentPeriodService.add.calls.mostRecent().args[0].openHouses).toEqual([]);
    });

    it('lets the last row be removed', () => {
      const component = openWithRow({ description: '', eventDate: null });

      component.removeOpenHouseRow(0);

      expect(component.commentPeriodForm.get('openHouses').value).toEqual([]);
    });
  });

  it('sends a read-only period back to its details page without opening the form', () => {
    const period = toLegacyCommentPeriod(nativeCommentPeriod({ sourceSystem: 'engage' }), ['sysadmin']);
    const component = openForEdit(period);

    expect(TestBed.inject(ToastService).error).toHaveBeenCalledWith('This comment period cannot be edited here.');
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/p', 'p1', 'cp', period._id]);
    expect(component.commentPeriodForm).toBeUndefined();
    expect(commentPeriodService.save).not.toHaveBeenCalled();
  });

  it('reads the related documents from DEMI by id as rows keyed on the Eagle id', () => {
    openForEdit(new CommentPeriod({ _id: 'cp1', relatedDocuments: ['5c0a6c1b2e3f4a5b6c7d8e01'], read: ['staff'] }));

    expect(documentService.byIdsNative).toHaveBeenCalledWith(['5c0a6c1b2e3f4a5b6c7d8e01']);
    const [doc] = storage.state.selectedDocumentsForCP.data;
    expect(doc._id).toBe('5c0a6c1b2e3f4a5b6c7d8e01');
    expect(doc.documentFileName).toBe('notice.pdf');
  });
});
