import { TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ProjectDocumentsComponent } from './project-documents.component';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { SearchService } from 'src/app/services/search.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { Constants } from 'src/app/shared/utils/constants';

// URL state: page 3 of a 10-per-page list sorted by name.
const urlParams = { currentPageCategorized: '3', pageSizeCategorized: '10', sortByCategorized: '+displayName' };

function doc(id: string, read: string[]) {
  return { _id: id, displayName: id, read };
}

describe('ProjectDocumentsComponent paging and sort', () => {
  let component: ProjectDocumentsComponent;
  let navigate: jasmine.Spy;

  // Loads the page with the given rows on page 3 and total match count.
  function load(rows: any[], total: number) {
    spyOn(window.history, 'replaceState');
    TestBed.configureTestingModule({
      imports: [ProjectDocumentsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of(urlParams) } },
        {
          provide: SearchService,
          useValue: { getSearchResults: () => of([{ data: { meta: [{ searchResultsTotal: total }], searchResults: rows } }]) }
        },
        { provide: ConfigService, useValue: { lists: [], ensureListsLoaded: () => Promise.resolve() } },
        { provide: StorageService, useValue: { currentProjectData: { _id: 'p1' }, state: {} } },
        { provide: NgbModal, useValue: { open: () => ({ componentInstance: {}, result: Promise.resolve(true) }) } },
        { provide: DocumentService, useValue: { publish: () => of({}), unPublish: () => of({}), delete: () => of({}) } },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['success', 'error']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) }
      ]
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    // No detectChanges: the handlers under test need no rendered template.
    component = TestBed.createComponent(ProjectDocumentsComponent).componentInstance;
    component.ngOnInit();
    flushMicrotasks();
  }

  function checkRow(id: string) {
    component.categorizedDocumentTableData.data.find(row => row._id === id).checkbox = true;
  }

  function navigatedParams(): any {
    return navigate.calls.mostRecent().args[0][3];
  }

  it('keeps the page after publishing', fakeAsync(() => {
    load([doc('d21', ['staff'])], 21);
    checkRow('d21');

    component.publishDocument();
    flushMicrotasks();

    expect(navigatedParams().currentPageCategorized).toBe(3);
  }));

  it('keeps the page after unpublishing', fakeAsync(() => {
    load([doc('d21', ['staff', 'public'])], 21);
    checkRow('d21');

    component.unpublishDocument();
    flushMicrotasks();

    expect(navigatedParams().currentPageCategorized).toBe(3);
  }));

  it('steps back a page when a delete empties the last page', fakeAsync(() => {
    load([doc('d21', ['staff'])], 21);
    checkRow('d21');

    component.deleteDocument();
    flushMicrotasks();

    expect(navigatedParams().currentPageCategorized).toBe(2);
  }));

  it('keeps the page when a delete leaves rows on the last page', fakeAsync(() => {
    load([doc('d21', ['staff']), doc('d22', ['staff']), doc('d23', ['staff'])], 23);
    checkRow('d22');

    component.deleteDocument();
    flushMicrotasks();

    expect(navigatedParams().currentPageCategorized).toBe(3);
  }));

  it('keeps the sort from the URL when a keyword search is submitted', fakeAsync(() => {
    load([doc('d21', ['staff'])], 21);
    component.tableParams.keywords = 'mine';

    component.onSubmit();

    expect(navigatedParams().sortByCategorized).toBe('+displayName');
  }));

  it('goes to page 1 when a column sort is clicked', fakeAsync(() => {
    load([doc('d21', ['staff'])], 21);

    component.setColumnSort(Constants.documentTypes.CATEGORIZED, 'displayName');

    expect(navigatedParams().currentPageCategorized).toBe(1);
  }));
});
