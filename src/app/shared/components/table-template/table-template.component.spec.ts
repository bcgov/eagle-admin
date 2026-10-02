import { ChangeDetectorRef, Component, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TableTemplateComponent } from './table-template.component';
import { TableColumn, TableObject } from './table-object';
import { TableParamsObject } from './table-params-object';

@Component({ selector: 'app-stub-rows', template: '' })
class StubRowsComponent {
  data = input<any>();
  columnData = input<any>();
  smallTable = input<boolean>();
}

const columns: TableColumn[] = [
  { name: 'Name', value: 'name', width: '30%' },
  { name: 'Date Posted', value: 'datePosted', width: '20%' },
  { name: 'Contact', value: 'lastName,+firstName', width: '30%' },
  { name: 'Status', value: 'status', width: '20%', nosort: true }
];

function render(sortBy: string, cols: TableColumn[] = columns, rows: any[] = []): ComponentFixture<TableTemplateComponent> {
  const fixture = TestBed.createComponent(TableTemplateComponent);
  const params = new TableParamsObject(10, 1, 0, sortBy);
  fixture.componentRef.setInput('data', new TableObject(StubRowsComponent, rows, params));
  fixture.componentRef.setInput('columns', cols);
  fixture.detectChanges();
  return fixture;
}

function header(fixture: ComponentFixture<TableTemplateComponent>, name: string): HTMLElement {
  const cells: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('thead th'));
  return cells.find(th => th.textContent.trim() === name);
}

describe('TableTemplateComponent headers', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [TableTemplateComponent] });
  });

  it('marks the sorted column ascending for a + sort', () => {
    const fixture = render('+name');

    expect(header(fixture, 'Name').getAttribute('aria-sort')).toBe('ascending');
  });

  it('marks the sorted column descending for a - sort', () => {
    const fixture = render('-name');

    expect(header(fixture, 'Name').getAttribute('aria-sort')).toBe('descending');
  });

  it('leaves aria-sort off columns that are not the current sort', () => {
    const fixture = render('+name');

    expect(header(fixture, 'Date Posted').hasAttribute('aria-sort')).toBeFalse();
  });

  it('shows the up arrow only on an ascending column', () => {
    const arrow = header(render('+name'), 'Name').querySelector('i.sort');

    expect(arrow.classList).toContain('sort-asc');
    expect(arrow.classList).not.toContain('sort-desc');
  });

  it('shows the down arrow only on a descending column', () => {
    const arrow = header(render('-name'), 'Name').querySelector('i.sort');

    expect(arrow.classList).toContain('sort-desc');
    expect(arrow.classList).not.toContain('sort-asc');
  });

  it('shows no arrow direction on an unsorted column', () => {
    const arrow = header(render('+name'), 'Date Posted').querySelector('i.sort');

    expect(arrow.classList).not.toContain('sort-asc');
    expect(arrow.classList).not.toContain('sort-desc');
  });

  it('matches a multi-key sort on its first key', () => {
    const fixture = render('-datePosted,+displayName');

    expect(header(fixture, 'Date Posted').getAttribute('aria-sort')).toBe('descending');
  });

  it('marks a column whose own value is multi-key when that sort is active', () => {
    const fixture = render('+lastName,+firstName');

    expect(header(fixture, 'Contact').getAttribute('aria-sort')).toBe('ascending');
  });

  it('renders a nosort column without a sort button', () => {
    expect(header(render('+name'), 'Status').querySelector('button')).toBeNull();
  });

  it('renders a nosort column without the sortable class or aria-sort', () => {
    const status = header(render('+name'), 'Status');

    expect(status.classList).not.toContain('sortable');
    expect(status.hasAttribute('aria-sort')).toBeFalse();
  });

  it('renders the sort control as a native button so Enter and Space activate it', () => {
    const button: HTMLButtonElement = header(render('+name'), 'Name').querySelector('button');

    expect(button.type).toBe('button');
  });

  it('emits the column value when the header button is clicked', () => {
    const fixture = render('+name');
    const emitted: string[] = [];
    fixture.componentInstance.onColumnSort.subscribe(value => emitted.push(value));

    header(fixture, 'Date Posted').querySelector('button').click();

    expect(emitted).toEqual(['datePosted']);
  });

  describe('select all', () => {
    const selectColumn: TableColumn = { name: 'select_all_box', value: 'select_all_box', width: '5%', nosort: true };
    const selectButton = (fixture: ComponentFixture<TableTemplateComponent>): HTMLButtonElement =>
      fixture.nativeElement.querySelector('thead button.select-all-button');
    // A click on a row checkbox marks the table for check; ticking rows in a test does not.
    const rowsTicked = (fixture: ComponentFixture<TableTemplateComponent>) => {
      fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
      fixture.detectChanges();
    };
    const selectIcon = (fixture: ComponentFixture<TableTemplateComponent>): string =>
      selectButton(fixture).querySelector('i').textContent.trim();
    // Tick the rows the way the documents pages do: they ignore the payload and read the rows.
    const tickLikeDocumentsPage = (fixture: ComponentFixture<TableTemplateComponent>, rows: any[], emitted: any[]) =>
      fixture.componentInstance.selectAllClicked.subscribe(value => {
        emitted.push(value);
        const someSelected = rows.some(row => row.checkbox === true);
        rows.forEach(row => row.checkbox = !someSelected);
      });

    it('is a button that selects every row, then offers to clear', () => {
      const rows = [{ checkbox: false }];
      const fixture = render('+name', [selectColumn, ...columns], rows);
      const emitted: any[] = [];
      tickLikeDocumentsPage(fixture, rows, emitted);

      expect(selectButton(fixture).getAttribute('aria-label')).toBe('Select all rows');
      selectButton(fixture).click();
      fixture.detectChanges();

      expect(emitted).toEqual([{ selectAll: true }]);
      expect(selectButton(fixture).getAttribute('aria-label')).toBe('Clear selection');
    });

    it('offers Select all rows again once every row is unticked', () => {
      const fixture = render('+name', [selectColumn, ...columns], [{ checkbox: false }]);

      // Nothing ticks the rows, as when staff untick each one after select all.
      selectButton(fixture).click();
      fixture.detectChanges();

      expect(selectButton(fixture).getAttribute('aria-label')).toBe('Select all rows');
    });

    it('is labelled Clear selection when some rows are checked, since a click clears them', () => {
      const fixture = render('+name', [selectColumn, ...columns], [{ checkbox: true }, { checkbox: false }]);
      const emitted: any[] = [];
      fixture.componentInstance.selectAllClicked.subscribe(value => emitted.push(value));

      expect(selectButton(fixture).getAttribute('aria-label')).toBe('Clear selection');
      selectButton(fixture).click();

      expect(emitted).toEqual([{ selectAll: false }]);
    });

    it('shows a ticked icon once every row is ticked by hand', () => {
      const rows = [{ checkbox: false }, { checkbox: false }];
      const fixture = render('+name', [selectColumn, ...columns], rows);

      rows.forEach(row => row.checkbox = true);
      rowsTicked(fixture);

      expect(selectIcon(fixture)).toBe('check_box');
    });

    it('follows the rows, not its last click, once staff untick them by hand', () => {
      const rows = [{ checkbox: false }, { checkbox: false }];
      const fixture = render('+name', [selectColumn, ...columns], rows);
      const emitted: any[] = [];
      tickLikeDocumentsPage(fixture, rows, emitted);
      selectButton(fixture).click();

      rows.forEach(row => row.checkbox = false);
      rowsTicked(fixture);
      expect(selectIcon(fixture)).toBe('check_box_outline_blank');
      selectButton(fixture).click();

      expect(emitted).toEqual([{ selectAll: true }, { selectAll: true }]);
    });
  });
});
