import { TestBed } from '@angular/core/testing';
import { ApplicationSortTableRowsComponent } from './application-sort-table-rows.component';
import { StorageService } from 'src/app/services/storage.service';

describe('ApplicationSortTableRowsComponent', () => {
  let state: { editedDocs: any[] };
  let component: ApplicationSortTableRowsComponent;

  beforeEach(() => {
    state = { editedDocs: [] };
    TestBed.configureTestingModule({
      imports: [ApplicationSortTableRowsComponent],
      providers: [{ provide: StorageService, useValue: { state } }]
    });
    component = TestBed.createComponent(ApplicationSortTableRowsComponent).componentInstance;
  });

  it('keeps every edited row that has no Eagle id', () => {
    component.updateSelectedCount({ id: 'uuid-1', _id: null, sortOrder: 1 });
    component.updateSelectedCount({ id: 'uuid-2', _id: null, sortOrder: 2 });

    expect(state.editedDocs.map(doc => doc.id)).toEqual(['uuid-1', 'uuid-2']);
  });

  it('keeps the latest edit of a row seen again on a later page load', () => {
    component.updateSelectedCount({ id: 'doc-1', _id: 'doc-1', sortOrder: 5 });
    component.updateSelectedCount({ id: 'doc-1', _id: 'doc-1', sortOrder: 7 });

    expect(state.editedDocs.map(doc => doc.sortOrder)).toEqual([7]);
  });
});
