import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
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
  function openForEdit(period: CommentPeriod): AddEditCommentPeriodComponent {
    commentPeriodService = jasmine.createSpyObj('CommentPeriodService', ['save', 'add']);
    commentPeriodService.save.and.returnValue(of(period));
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
            snapshot: { paramMap: convertToParamMap({ projId: 'p1', commentPeriodId: 'cp1' }) },
            url: of([{ path: 'edit' }])
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
    fixture.componentRef.setInput('project', { _id: 'p1', name: 'Site C', legislationYear: 2018 });
    fixture.componentRef.setInput('commentPeriod', period);
    fixture.componentInstance.ngOnInit();
    return fixture.componentInstance;
  }

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

    expect(commentPeriodService.save.calls.mostRecent().args[0].isPublished).toBe(true);
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
