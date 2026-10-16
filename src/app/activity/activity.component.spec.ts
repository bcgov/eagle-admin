import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { ActivityComponent } from './activity.component';
import { ProjectService } from '../services/project.service';
import { RecentActivityService } from '../services/recent-activity';
import { LoggingService } from '../services/logging.service';
import { ToastService } from '../services/toast.service';

describe('ActivityComponent', () => {
  let component: ActivityComponent;
  let navigate: jasmine.Spy;
  let updates: jasmine.SpyObj<RecentActivityService>;
  let logger: jasmine.SpyObj<LoggingService>;
  let toast: jasmine.SpyObj<ToastService>;

  function create(urlParams: Record<string, string>, page: Observable<any> = of({ rows: [], total: 0 })) {
    // Keep the Karma page URL untouched when the table utils rewrite the address bar.
    spyOn(window.history, 'replaceState');
    updates = jasmine.createSpyObj('RecentActivityService', ['list']);
    updates.list.and.returnValue(page);
    logger = jasmine.createSpyObj('LoggingService', ['error']);
    toast = jasmine.createSpyObj('ToastService', ['error']);
    const projects = [
      { id: 'track-1', eagleId: 'e1', name: 'One' }, { id: 'track-2', name: 'Track only' }, { id: 'track-3', eagleId: 'e3', name: 'Three' }
    ];
    TestBed.configureTestingModule({
      imports: [ActivityComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of(urlParams) } },
        { provide: ProjectService, useValue: { list: () => of({ rows: projects }) } },
        { provide: RecentActivityService, useValue: updates },
        { provide: LoggingService, useValue: logger },
        { provide: ToastService, useValue: toast }
      ]
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    // No detectChanges: the load runs in the constructor and the handlers need no rendered template.
    component = TestBed.createComponent(ActivityComponent).componentInstance;
  }

  const listed = () => updates.list.calls.mostRecent().args[0]!;
  const navigatedParams = (): any => navigate.calls.mostRecent().args[0][1];

  it('lists updates newest first, filtered by the project Eagle id and the type names', () => {
    create({ project: 'e1', type: 'news,pcp', keywords: 'dam', currentPage: '3', pageSize: '25' });

    expect(listed()).toEqual(jasmine.objectContaining({ page: 3, pageSize: 25, sort: '-dateAdded', q: 'dam' }));
    expect(listed().filters!.project).toEqual(['e1']);
    expect(listed().filters!.type).toEqual(['News', 'Public Comment Period']);
  });

  it('filters by several projects at once', () => {
    create({ project: 'e1,e3' });

    expect(listed().filters!.project).toEqual(['e1', 'e3']);
  });

  it('sends the date range as inclusive YYYY-MM-DD bounds', () => {
    create({ dateAddedStart: '2024-01-01', dateAddedEnd: '2024-12-31' });

    expect(listed().filters!.dateAddedStart).toBe('2024-01-01');
    expect(listed().filters!.dateAddedEnd).toBe('2024-12-31');
  });

  it('drops a URL date that is not a date, rather than sending DEMI a bad value', () => {
    create({ dateAddedStart: 'soon' });

    expect(listed().filters!.dateAddedStart).toBeUndefined();
  });

  it('sends the C&E filter only when the toggle is on', () => {
    create({ complianceAndEnforcement: 'true' });

    expect(listed().filters!.complianceAndEnforcement).toBe('true');
  });

  it('leaves the C&E filter out when the toggle is off', () => {
    create({});

    expect(listed().filters!.complianceAndEnforcement).toBeUndefined();
  });

  it('puts the date range and the C&E toggle in the URL on submit', () => {
    create({});
    component.filterForUI.dateAddedStart = { year: 2024, month: 3, day: 9 };
    component.filterForUI.complianceAndEnforcement = true;

    component.onSubmit();

    expect(navigatedParams().dateAddedStart).toBe('2024-03-09');
    expect(navigatedParams().complianceAndEnforcement).toBe('true');
  });

  it('clears the date range and the C&E toggle with Clear Filters', () => {
    create({ dateAddedEnd: '2024-12-31', complianceAndEnforcement: 'true' });

    component.clearAll();

    expect(component.isUiFiltered()).toBeFalse();
  });

  it('logs a failed list, tells the user, and goes to search', () => {
    const failure = new Error('DEMI 503');
    create({}, throwError(() => failure));

    expect(logger.error).toHaveBeenCalledWith('Update list failed', 'ActivityComponent', failure);
    expect(toast.error).toHaveBeenCalledWith('Could not load updates.');
    expect(navigate).toHaveBeenCalledWith(['/search']);
  });

  it('offers only projects with an Eagle id, which updates can point at', () => {
    create({});

    expect(component.projects.map(project => project._id)).toEqual(['e1', 'e3']);
  });

  it('falls back to newest first for a sort DEMI cannot apply', () => {
    create({ sortBy: '+projectName' });

    expect(listed().sort).toBe('-dateAdded');
    expect(component.tableParams.sortBy).toBe('-dateAdded');
  });

  it('keeps a date sort from the URL when a keyword search is submitted', () => {
    create({ sortBy: '+dateAdded' });
    component.tableParams.keywords = 'mine';

    component.onSubmit();

    expect(listed().sort).toBe('dateAdded');
    expect(navigatedParams().sortBy).toBe('+dateAdded');
  });

  it('flips the date sort and goes to page 1 when the Date column is clicked', () => {
    create({ currentPage: '3' });

    component.setColumnSort('dateAdded');

    expect(navigatedParams().sortBy).toBe('+dateAdded');
    expect(navigatedParams().currentPage).toBe(1);
  });

  it('sends a pinned sort from the URL', () => {
    create({ sortBy: '-pinned' });

    expect(listed().sort).toBe('-pinned');
  });

  it('sends a status sort from the URL', () => {
    create({ sortBy: '+status' });

    expect(listed().sort).toBe('status');
  });

  it('sorts every column but Project and Archive', () => {
    create({});

    expect(component.tableColumns.filter(column => !column.nosort).map(column => column.value))
      .toEqual(['pinned', 'headline', 'type', 'dateAdded', 'status']);
  });
});
