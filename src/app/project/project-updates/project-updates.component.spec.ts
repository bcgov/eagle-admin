import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { LoggingService } from 'src/app/services/logging.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { ProjectUpdatesComponent } from './project-updates.component';

describe('ProjectUpdatesComponent', () => {
  let fixture: ComponentFixture<ProjectUpdatesComponent>;
  let searchService: jasmine.SpyObj<SearchService>;
  let navigate: jasmine.Spy;

  function open(urlParams: Record<string, string> = {}, total = 3) {
    const rows = Array.from({ length: Math.min(total, 10) }, (_, i) => ({ _id: `a${i}`, headline: `Update ${i}`, dateAdded: '2026-09-01T00:00:00Z' }));
    searchService = jasmine.createSpyObj('SearchService', ['getSearchResults']);
    searchService.getSearchResults.and.returnValue(of([{ data: { meta: [{ searchResultsTotal: total }], searchResults: rows } }] as any));
    TestBed.configureTestingModule({
      imports: [ProjectUpdatesComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of(urlParams), snapshot: {}, parent: { snapshot: { paramMap: convertToParamMap({ projId: 'p1' }) } } } },
        { provide: SearchService, useValue: searchService },
        { provide: StorageService, useValue: { currentProjectData: { _id: 'p1', name: 'Mine' } } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'warn', 'error', 'info']) }
      ]
    });
    // updateUrl rewrites the browser address bar; keep the test runner's page where it is.
    spyOn(TestBed.inject(TableTemplateUtils), 'updateUrl');
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(ProjectUpdatesComponent);
    fixture.detectChanges();
  }

  const searchedSort = () => searchService.getSearchResults.calls.mostRecent().args[5];
  const navigatedParams = () => navigate.calls.mostRecent().args[0][3];

  function clickHeader(name: string) {
    const header = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('th'))
      .find(th => th.textContent!.trim() === name)!;
    header.click();
  }

  it('lists newest first by date added when the URL names no sort', () => {
    open();
    expect(searchedSort()).toBe('-dateAdded');
  });

  it('keeps the sort the URL names', () => {
    open({ sortBy: '+headline' });
    expect(searchedSort()).toBe('+headline');
  });

  it('sorts by headline A to Z when the Headline header is clicked', () => {
    open();
    clickHeader('Headline');
    expect(navigatedParams().sortBy).toBe('+headline');
    expect(navigatedParams().currentPage).toBe(1);
  });

  it('reverses the sort when the sorted column is clicked again', () => {
    open({ sortBy: '+headline' });
    clickHeader('Headline');
    expect(navigatedParams().sortBy).toBe('-headline');
  });

  it('sorts oldest first when Date is clicked from the newest-first default', () => {
    open();
    clickHeader('Date');
    expect(navigatedParams().sortBy).toBe('+dateAdded');
  });

  it('keeps the sort and page size when the page changes', async () => {
    open({ sortBy: '+headline', pageSize: '25' }, 60);
    const pageTwo = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('ngb-pagination a.page-link'))
      .find(link => link.textContent!.trim() === '2')!;
    pageTwo.click();
    // ngb-pagination emits pageChange asynchronously.
    await fixture.whenStable();
    expect(navigatedParams().currentPage).toBe(2);
    expect(navigatedParams().sortBy).toBe('+headline');
    expect(navigatedParams().pageSize).toBe(25);
  });
});
