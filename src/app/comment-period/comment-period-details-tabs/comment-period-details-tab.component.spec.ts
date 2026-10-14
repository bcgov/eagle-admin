import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { CommentPeriodDetailsTabComponent } from './comment-period-details-tab.component';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { toLegacyCommentPeriod } from 'src/app/comment-periods/comment-period-legacy';
import { nativeCommentPeriod } from 'src/app/models/demi/comment-period.fixture';
import { DemiCommentPeriod } from 'src/app/models/demi/comment-period';

const EXPORT_URL = '/demi/api/commentperiods/engage-7/comments/export';

describe('CommentPeriodDetailsTabComponent', () => {
  let fixture: ComponentFixture<CommentPeriodDetailsTabComponent>;
  let http: HttpTestingController;
  let link: jasmine.Spy;

  function create(row: Partial<DemiCommentPeriod> = {}) {
    TestBed.configureTestingModule({
      imports: [CommentPeriodDetailsTabComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getDemiApiPath: () => '/demi/api', lists: [] } },
        { provide: DocumentService, useValue: jasmine.createSpyObj('DocumentService', ['getByMultiId']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['info', 'error', 'success']) },
        { provide: StorageService, useValue: { state: { currentProject: { type: 'currentProject' }, canDeleteCommentPeriod: { data: false } } } }
      ]
    });
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(CommentPeriodDetailsTabComponent);
    const period = toLegacyCommentPeriod(nativeCommentPeriod({ id: 'engage-7', ...row }), ['sysadmin']);
    fixture.componentRef.setInput('commentPeriod', period);
    fixture.componentRef.setInput('project', { _id: '59679ade3acbf9001de7ea8b', name: 'Big Mine' });
    fixture.detectChanges();
  }

  function menuItems(): string[] {
    fixture.nativeElement.querySelector('#actionDropdown').click();
    fixture.detectChanges();
    const items: HTMLElement[] = Array.from(document.querySelectorAll('[ngbDropdownItem]'));
    return items.map(item => item.textContent.trim());
  }

  beforeEach(() => {
    link = spyOn(HTMLAnchorElement.prototype, 'click');
    spyOn(URL, 'createObjectURL').and.returnValue('blob:csv');
    spyOn(URL, 'revokeObjectURL');
  });

  afterEach(() => http.verify());

  describe('export', () => {
    beforeEach(() => create());

    it('asks DEMI for the staff file by the DEMI period id, with no audience', () => {
      fixture.componentInstance.exportCommentsForStaff();

      const req = http.expectOne(r => r.url === EXPORT_URL);
      expect(req.request.params.keys()).toEqual([]);
      expect(req.request.responseType).toBe('blob');
      req.flush(new Blob(['a,b']));
      expect((link.calls.mostRecent().object as HTMLAnchorElement).download).toMatch(/^Big_Mine-eao-.*\.csv$/);
    });

    it('asks DEMI for the proponent file with audience=proponent', () => {
      fixture.componentInstance.exportCommentsForProponents();

      const req = http.expectOne(r => r.url === EXPORT_URL);
      expect(req.request.params.get('audience')).toBe('proponent');
      req.flush(new Blob(['a,b']));
      expect((link.calls.mostRecent().object as HTMLAnchorElement).download).toMatch(/^Big_Mine-proponent-.*\.csv$/);
    });

    it('tells the user when the export fails', () => {
      fixture.componentInstance.exportCommentsForStaff();
      http.expectOne(r => r.url === EXPORT_URL).flush(new Blob(), { status: 500, statusText: 'Server Error' });

      expect(TestBed.inject(ToastService).error).toHaveBeenCalledWith('Failed to export comments.');
      expect(link).not.toHaveBeenCalled();
    });
  });

  describe('actions', () => {
    it('offers edit and publish on an Eagle period', () => {
      create();
      expect(menuItems()).toEqual(jasmine.arrayContaining(['Edit', 'Un-Publish']));
    });

    it('offers only the exports on an ENGAGE period', () => {
      create({ sourceSystem: 'engage' });
      expect(menuItems()).toEqual(['Export All Comments', 'Export Comments For Proponents']);
    });
  });
});
