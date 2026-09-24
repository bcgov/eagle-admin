import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ActivityComponent } from './activity.component';
import { ProjectService } from '../services/project.service';
import { SearchService } from '../services/search.service';

describe('ActivityComponent sorting', () => {
  let component: ActivityComponent;
  let navigate: jasmine.Spy;

  beforeEach(() => {
    // Keep the Karma page URL untouched when the table utils rewrite the address bar.
    spyOn(window.history, 'replaceState');
    TestBed.configureTestingModule({
      imports: [ActivityComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of({ sortBy: '+headline', currentPage: '3', pageSize: '25' }) } },
        { provide: ProjectService, useValue: { getAll: () => of({ data: [] }) } },
        { provide: SearchService, useValue: { getSearchResults: () => of([{ data: { meta: [], searchResults: [] } }]) } }
      ]
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    // No detectChanges: the load runs in the constructor and the handlers need no rendered template.
    component = TestBed.createComponent(ActivityComponent).componentInstance;
  });

  function navigatedParams(): any {
    return navigate.calls.mostRecent().args[0][1];
  }

  it('keeps the sort from the URL when a keyword search is submitted', () => {
    component.tableParams.keywords = 'mine';

    component.onSubmit();

    expect(navigatedParams().sortBy).toBe('+headline');
  });

  it('goes to page 1 when a column sort is clicked', () => {
    component.setColumnSort('headline');

    expect(navigatedParams().currentPage).toBe(1);
  });

  it('flips the direction when the sorted column is clicked', () => {
    component.setColumnSort('headline');

    expect(navigatedParams().sortBy).toBe('-headline');
  });
});
