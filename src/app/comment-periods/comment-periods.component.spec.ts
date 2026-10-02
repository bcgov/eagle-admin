import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CommentPeriodsComponent } from './comment-periods.component';
import { CommentPeriodService } from '../services/commentperiod.service';
import { StorageService } from '../services/storage.service';

function createFixture(periods: object[]): ComponentFixture<CommentPeriodsComponent> {
  // Keep the Karma page URL untouched when the table utils rewrite the address bar.
  spyOn(window.history, 'replaceState');
  TestBed.configureTestingModule({
    imports: [CommentPeriodsComponent],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: { params: of({}), parent: { snapshot: { paramMap: convertToParamMap({ projId: 'p1' }) } } }
      },
      {
        provide: CommentPeriodService,
        useValue: { getAllByProjectId: () => of({ totalCount: periods.length, data: periods }), getSummaryById: () => of({}) }
      },
      { provide: StorageService, useValue: { state: { currentProject: { type: 'currentProject', data: { _id: 'p1', name: 'Mine' } } } } }
    ]
  });
  const fixture = TestBed.createComponent(CommentPeriodsComponent);
  fixture.detectChanges();
  return fixture;
}

const basePeriod = {
  _id: 'cp1', project: 'p1', read: ['public'], commentPeriodStatus: 'Open',
  dateStarted: '2026-09-01', dateCompleted: '2026-09-30', daysRemaining: '6 days'
};

describe('CommentPeriodsComponent headers', () => {
  let fixture: ComponentFixture<CommentPeriodsComponent>;

  beforeEach(() => {
    fixture = createFixture([basePeriod]);
  });

  function header(name: string): HTMLElement {
    const cells: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('thead th'));
    return cells.find(th => th.textContent.trim() === name);
  }

  it('renders Days Remaining as plain text with no sort button', () => {
    expect(header('Days Remaining').querySelector('button')).toBeNull();
  });

  it('still renders End Date as a sort button', () => {
    expect(header('End Date').querySelector('button')).not.toBeNull();
  });
});

describe('CommentPeriodsComponent Published cell', () => {
  function publishedCells(periods: object[]): string[] {
    const fixture = createFixture(periods);
    const cells: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('td[data-label="Published"]'));
    return cells.map(td => td.textContent.trim());
  }

  it('follows isPublished, not read, so the cell matches the sort key', () => {
    expect(publishedCells([
      { ...basePeriod, _id: 'cp1', read: ['public'], isPublished: null },
      { ...basePeriod, _id: 'cp2', read: ['staff'], isPublished: true }
    ])).toEqual(['Not Published', 'Published']);
  });
});
