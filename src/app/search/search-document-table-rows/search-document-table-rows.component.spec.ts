import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { SearchDocumentTableRowsComponent } from './search-document-table-rows.component';

describe('SearchDocumentTableRowsComponent', () => {
  let component: SearchDocumentTableRowsComponent;
  let navigate: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [SearchDocumentTableRowsComponent], providers: [provideRouter([])] });
    navigate = spyOn(TestBed.inject(Router), 'navigate');
    component = TestBed.createComponent(SearchDocumentTableRowsComponent).componentInstance;
  });

  it('opens the document detail under its project', () => {
    component.goToItem({ id: 'd1', projectId: 'p1' });

    expect(navigate).toHaveBeenCalledOnceWith(['p', 'p1', 'project-documents', 'detail', 'd1']);
  });

  it('stays put when the row has no project', () => {
    component.goToItem({ id: 'd1', projectId: undefined });

    expect(navigate).not.toHaveBeenCalled();
  });
});
