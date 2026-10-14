import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, TestRequest, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CommentPeriodsComponent } from './comment-periods.component';
import { ConfigService } from '../services/config.service';
import { LoggingService } from '../services/logging.service';
import { StorageService } from '../services/storage.service';
import { ToastService } from '../services/toast.service';
import { DemiCommentPeriod } from '../models/demi/comment-period';
import { nativeCommentPeriod } from '../models/demi/comment-period.fixture';

const EAGLE_PROJECT = '59679ade3acbf9001de7ea8b';
const DEMI_PROJECT = '207';

let http: HttpTestingController;

function createFixture(routeParams: object = {}, parent: { params: object; data?: object } = {
  params: { projId: EAGLE_PROJECT }, data: { project: { _id: EAGLE_PROJECT, demiId: DEMI_PROJECT } }
}): ComponentFixture<CommentPeriodsComponent> {
  // Keep the Karma page URL untouched when the table utils rewrite the address bar.
  spyOn(window.history, 'replaceState');
  TestBed.configureTestingModule({
    imports: [CommentPeriodsComponent],
    providers: [
      provideRouter([]),
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
      { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) },
      { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error']) },
      {
        provide: ActivatedRoute,
        useValue: { params: of(routeParams), parent: { snapshot: { paramMap: convertToParamMap(parent.params), data: parent.data ?? {} } } }
      },
      { provide: StorageService, useValue: { state: { currentProject: { type: 'currentProject', data: { _id: EAGLE_PROJECT, name: 'Mine' } } } } }
    ]
  });
  http = TestBed.inject(HttpTestingController);
  const fixture = TestBed.createComponent(CommentPeriodsComponent);
  fixture.detectChanges();
  return fixture;
}

function listRequest(): TestRequest {
  return http.expectOne(req => req.url === '/demi/api/comment-periods');
}

function show(fixture: ComponentFixture<CommentPeriodsComponent>, rows: DemiCommentPeriod[]) {
  listRequest().flush(rows, { headers: { 'x-total-count': String(rows.length) } });
  fixture.detectChanges();
  http.match(req => req.url.endsWith('/summary')).forEach(req => req.flush(null));
}

describe('CommentPeriodsComponent list query', () => {
  it('asks DEMI for the project periods by DEMI project id, newest first', () => {
    createFixture();
    const params = listRequest().request.params;
    expect(params.get('project')).toBe(DEMI_PROJECT);
    expect(params.get('sort')).toBe('-dateStarted');
    expect(params.get('page')).toBe('1');
    expect(params.get('pageSize')).toBe('10');
    expect(params.get('count')).toBe('true');
  });

  it('asks for a notification periods by the notification id', () => {
    createFixture({}, { params: { notificationProjectId: '5f0a6c1b2e3f4a5b6c7d8e01' } });
    expect(listRequest().request.params.get('project')).toBe('5f0a6c1b2e3f4a5b6c7d8e01');
  });

  it('sends an ascending sort without the plus sign, which DEMI would read as a space', () => {
    createFixture({ sortBy: '+dateCompleted', currentPage: 2, pageSize: 25 });
    const params = listRequest().request.params;
    expect(params.get('sort')).toBe('dateCompleted');
    expect(params.get('page')).toBe('2');
    expect(params.get('pageSize')).toBe('25');
  });

  it('falls back to the default sort for a column DEMI cannot sort on', () => {
    createFixture({ sortBy: '-isPublished' });
    expect(listRequest().request.params.get('sort')).toBe('-dateStarted');
  });
});

describe('CommentPeriodsComponent table', () => {
  let fixture: ComponentFixture<CommentPeriodsComponent>;

  function header(name: string): HTMLElement {
    const cells: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('thead th'));
    return cells.find(th => th.textContent.trim() === name);
  }

  function cells(label: string): string[] {
    const tds: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll(`td[data-label="${label}"]`));
    return tds.map(td => td.textContent.trim());
  }

  beforeEach(() => {
    fixture = createFixture();
    show(fixture, [
      nativeCommentPeriod({ id: 'cp1', isPublished: false }),
      nativeCommentPeriod({ id: 'cp2', isPublished: true, dateStarted: '2020-01-01', dateCompleted: '2020-02-01' })
    ]);
  });

  afterEach(() => http.verify());

  it('renders Days Remaining as plain text with no sort button', () => {
    expect(header('Days Remaining').querySelector('button')).toBeNull();
  });

  it('renders Published as plain text, since DEMI cannot sort on it', () => {
    expect(header('Published').querySelector('button')).toBeNull();
  });

  it('still renders End Date as a sort button', () => {
    expect(header('End Date').querySelector('button')).not.toBeNull();
  });

  it('shows the published state and status of each native row', () => {
    expect(cells('Published')).toEqual(['Not Published', 'Published']);
    expect(cells('Status')[1]).toBe('Closed');
  });
});
