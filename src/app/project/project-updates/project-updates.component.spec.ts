import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { LoggingService } from 'src/app/services/logging.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { ProjectUpdatesComponent } from './project-updates.component';

describe('ProjectUpdatesComponent', () => {
  let fixture: ComponentFixture<ProjectUpdatesComponent>;
  let updates: jasmine.SpyObj<RecentActivityService>;
  let navigate: jasmine.Spy;
  let logger: jasmine.SpyObj<LoggingService>;
  let toast: jasmine.SpyObj<ToastService>;

  function open(urlParams: Record<string, string> = {}, total = 3, project: any = { _id: 'eagle-p1', demiId: 'track-p1', name: 'Mine' }, page?: Observable<any>) {
    const rows = Array.from({ length: Math.min(total, 10) }, (_, i) => ({ id: `a${i}`, headline: `Update ${i}`, dateAdded: '2026-09-01T00:00:00Z' }));
    updates = jasmine.createSpyObj('RecentActivityService', ['list']);
    updates.list.and.returnValue(page ?? of({ rows, total } as any));
    logger = jasmine.createSpyObj('LoggingService', ['debug', 'warn', 'error', 'info']);
    toast = jasmine.createSpyObj('ToastService', ['error']);
    TestBed.configureTestingModule({
      imports: [ProjectUpdatesComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of(urlParams), snapshot: {}, parent: { snapshot: { paramMap: convertToParamMap({ projId: 'track-p1' }), data: { project } } } } },
        { provide: RecentActivityService, useValue: updates },
        { provide: StorageService, useValue: { currentProjectData: { _id: 'p1', name: 'Mine' } } },
        { provide: LoggingService, useValue: logger },
        { provide: ToastService, useValue: toast }
      ]
    });
    // updateUrl rewrites the browser address bar; keep the test runner's page where it is.
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(ProjectUpdatesComponent);
    fixture.detectChanges();
  }

  const listed = () => updates.list.calls.mostRecent().args[0]!;
  const navigatedParams = () => navigate.calls.mostRecent().args[0][3];

  function clickHeader(name: string) {
    const header = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('th'))
      .find(th => th.textContent!.trim() === name)!;
    header.querySelector('button')!.click();
  }

  it('lists the project\'s updates by its Eagle id, newest first when the URL names no sort', () => {
    open();
    expect(listed()).toEqual(jasmine.objectContaining({ sort: '-dateAdded', filters: { project: 'eagle-p1' } }));
    expect(fixture.nativeElement.textContent).toContain('3 results found');
  });

  it('sends the URL keywords and page as the native q and page', () => {
    open({ keywords: 'dam safety', currentPage: '2', pageSize: '25' }, 60);
    expect(listed()).toEqual(jasmine.objectContaining({ q: 'dam safety', page: 2, pageSize: 25 }));
  });

  it('logs a failed list, tells the user, and goes to search', () => {
    const failure = new Error('DEMI 503');
    open({}, 3, undefined, throwError(() => failure));
    expect(logger.error).toHaveBeenCalledWith('Project update list failed', 'ProjectUpdatesComponent', failure);
    expect(toast.error).toHaveBeenCalledWith('Could not load updates.');
    expect(navigate).toHaveBeenCalledWith(['/search']);
  });

  it('reads nothing for a project with no Eagle id, which cannot have updates', () => {
    open({}, 3, { _id: null, demiId: 'track-p1', name: 'Track only' });
    expect(updates.list).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('No results found');
  });

  it('falls back to newest first for a sort DEMI cannot apply', () => {
    open({ sortBy: '+headline' });
    expect(listed().sort).toBe('-dateAdded');
  });

  it('does not offer a headline sort, which DEMI cannot apply', () => {
    open();
    const header = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('th'))
      .find(th => th.textContent!.trim() === 'Headline')!;
    expect(header.querySelector('button')).toBeNull();
  });

  it('sorts oldest first when Date is clicked from the newest-first default', () => {
    open();
    clickHeader('Date');
    expect(navigatedParams().sortBy).toBe('+dateAdded');
    expect(navigatedParams().currentPage).toBe(1);
  });

  it('reverses the sort when the sorted column is clicked again', () => {
    open({ sortBy: '+dateAdded' });
    clickHeader('Date');
    expect(navigatedParams().sortBy).toBe('-dateAdded');
  });

  it('keeps the sort and page size when the page changes', async () => {
    open({ sortBy: '+dateAdded', pageSize: '25' }, 60);
    const pageTwo = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('ngb-pagination a.page-link'))
      .find(link => link.textContent!.trim() === '2')!;
    pageTwo.click();
    // ngb-pagination emits pageChange asynchronously.
    await fixture.whenStable();
    expect(navigatedParams().currentPage).toBe(2);
    expect(navigatedParams().sortBy).toBe('+dateAdded');
    expect(navigatedParams().pageSize).toBe(25);
  });
});
