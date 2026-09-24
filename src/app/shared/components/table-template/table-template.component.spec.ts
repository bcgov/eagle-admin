import { Component, input } from '@angular/core';
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

function render(sortBy: string): ComponentFixture<TableTemplateComponent> {
  const fixture = TestBed.createComponent(TableTemplateComponent);
  const params = new TableParamsObject(10, 1, 0, sortBy);
  fixture.componentRef.setInput('data', new TableObject(StubRowsComponent, [], params));
  fixture.componentRef.setInput('columns', columns);
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

  it('marks columns that are not the current sort as none', () => {
    const fixture = render('+name');

    expect(header(fixture, 'Date Posted').getAttribute('aria-sort')).toBe('none');
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
});
