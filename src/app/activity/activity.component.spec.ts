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
    const projects = [{ id: 'track-1', eagleId: 'e1', name: 'One' }, { id: 'track-2', name: 'Track only' }];
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

    expect(listed()).toEqual({
      page: 3, pageSize: 25, sort: '-dateAdded', q: 'dam',
      filters: { project: 'e1', type: ['News', 'Public Comment Period'] }
    });
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

    expect(component.projects.map(project => project._id)).toEqual(['e1']);
  });

  it('falls back to newest first for a sort DEMI cannot apply', () => {
    create({ sortBy: '+headline' });

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

  it('sorts only by date', () => {
    create({});

    expect(component.tableColumns.filter(column => !column.nosort).map(column => column.value)).toEqual(['dateAdded']);
  });
});
