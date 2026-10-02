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

describe('AddEditCommentPeriodComponent', () => {
  let commentPeriodService: jasmine.SpyObj<CommentPeriodService>;

  // Form-logic specs skip detectChanges, so the TinyMCE template never renders.
  function openForEdit(period: CommentPeriod): AddEditCommentPeriodComponent {
    commentPeriodService = jasmine.createSpyObj('CommentPeriodService', ['save', 'add']);
    commentPeriodService.save.and.returnValue(of(period));

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
        { provide: DocumentService, useValue: jasmine.createSpyObj('DocumentService', ['getByMultiId']) },
        { provide: StorageService, useValue: { state: {} } },
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
});
