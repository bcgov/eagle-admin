import { ComponentFixture, TestBed, fakeAsync, flushMicrotasks } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ProjectDocumentsComponent } from './project-documents.component';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';
import { Constants } from 'src/app/shared/utils/constants';

describe('ProjectDocumentsComponent Actions menu', () => {
  let fixture: ComponentFixture<ProjectDocumentsComponent>;

  const pressArrowDown = (target: Element) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [ProjectDocumentsComponent],
      providers: [
        provideRouter([]),
        { provide: ConfigService, useValue: { lists: [], ensureListsLoaded: () => Promise.resolve() } },
        { provide: StorageService, useValue: { currentProjectData: { _id: 'proj123', demiId: '7', name: 'Test Project' }, state: {} } },
        { provide: DocumentService, useValue: { listNative: () => of({ rows: [], total: 0 }) } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['log', 'warn', 'error']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectDocumentsComponent);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  async function openActions(): Promise<HTMLButtonElement> {
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('#actionDropdown');
    toggle.click();
    fixture.detectChanges();
    await fixture.whenStable();
    return toggle;
  }

  it('renders the open Actions menu under document.body, outside the component', async () => {
    await openActions();

    const menu = document.querySelector('[aria-labelledby="actionDropdown"]');
    expect(menu).not.toBeNull();
    expect(document.body.contains(menu)).toBeTrue();
    expect(fixture.nativeElement.contains(menu)).toBeFalse();
  });

  it('makes Upload Document(s) a link to the project upload route', async () => {
    await openActions();

    const upload = document.querySelector('#button-upl');
    expect(upload.tagName).toBe('A');
    expect(upload.getAttribute('href')).toBe('/p/proj123/project-documents/upload');
  });

  it('moves focus through the enabled menu items with ArrowDown', async () => {
    const toggle = await openActions();

    pressArrowDown(toggle);
    expect(document.activeElement.id).toBe('button-as');

    pressArrowDown(document.activeElement);
    expect(document.activeElement.id).toBe('button-upl');
  });
});

// URL state: page 3 of a 10-per-page list sorted by name.
const urlParams = { currentPageCategorized: '3', pageSizeCategorized: '10', sortByCategorized: '+displayName' };

const lists = [
  { id: 'm1', type: 'label', legislation: 2002 },
  { id: 'm2', type: 'label', legislation: 2002 },
  { id: 't1', type: 'doctype', legislation: 2002 },
  { id: 'a1', type: 'author', legislation: 2002 },
  { id: 'ph1', type: 'projectPhase', legislation: 2002 }
];

// Legacy project from the route resolver: `_id` is the Eagle id, `demiId` the DEMI one.
let storage: any;

function doc(id: string, isPublished: boolean, eagleId: string | null = id) {
  return { id, eagleId, projectId: '7', displayName: id, isPublished };
}

describe('ProjectDocumentsComponent paging and sort', () => {
  let component: ProjectDocumentsComponent;
  let navigate: jasmine.Spy;
  let documentService: jasmine.SpyObj<DocumentService>;

  // Loads the page with the given rows on page 3 and total match count.
  function load(rows: any[], total: number, params: object = urlParams) {
    storage = { currentProjectData: { _id: 'p1', demiId: '7', legislationYear: 2002 }, state: {} };
    documentService = jasmine.createSpyObj('DocumentService', ['listNative', 'publish', 'unPublish', 'delete', 'downloadNative']);
    documentService.listNative.and.returnValue(of({ rows, total }));
    documentService.publish.and.returnValue(of({} as any));
    documentService.unPublish.and.returnValue(of({} as any));
    documentService.delete.and.returnValue(of({} as any));
    spyOn(window.history, 'replaceState');
    TestBed.configureTestingModule({
      imports: [ProjectDocumentsComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { params: of(params) } },
        { provide: ConfigService, useValue: { lists, ensureListsLoaded: () => Promise.resolve() } },
        { provide: StorageService, useValue: storage },
        { provide: NgbModal, useValue: { open: () => ({ componentInstance: {}, result: Promise.resolve(true) }) } },
        { provide: DocumentService, useValue: documentService },
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
    component.categorizedDocumentTableData.data.find(row => row.id === id).checkbox = true;
  }

  function navigatedParams(): any {
    return navigate.calls.mostRecent().args[0][3];
  }

  it('keeps the page after publishing', fakeAsync(() => {
    load([doc('d21', false)], 21);
    checkRow('d21');

    component.publishDocument();
    flushMicrotasks();

    expect(navigatedParams().currentPageCategorized).toBe(3);
  }));

  it('keeps the page after unpublishing', fakeAsync(() => {
    load([doc('d21', true)], 21);
    checkRow('d21');

    component.unpublishDocument();
    flushMicrotasks();

    expect(navigatedParams().currentPageCategorized).toBe(3);
  }));

  it('steps back a page when a delete empties the last page', fakeAsync(() => {
    load([doc('d21', false)], 21);
    checkRow('d21');

    component.deleteDocument();
    flushMicrotasks();

    expect(navigatedParams().currentPageCategorized).toBe(2);
  }));

  it('keeps the page when a delete leaves rows on the last page', fakeAsync(() => {
    load([doc('d21', false), doc('d22', false), doc('d23', false)], 23);
    checkRow('d22');

    component.deleteDocument();
    flushMicrotasks();

    expect(navigatedParams().currentPageCategorized).toBe(3);
  }));

  it('keeps the sort from the URL when a keyword search is submitted', fakeAsync(() => {
    load([doc('d21', false)], 21);
    component.tableParams.keywords = 'mine';

    component.onSubmit();

    expect(navigatedParams().sortByCategorized).toBe('+displayName');
  }));

  it('goes to page 1 when a column sort is clicked', fakeAsync(() => {
    load([doc('d21', false)], 21);

    component.setColumnSort(Constants.documentTypes.CATEGORIZED, 'displayName');

    expect(navigatedParams().currentPageCategorized).toBe(1);
  }));

  const listQuery = () => documentService.listNative.calls.mostRecent().args[0];

  it('lists documents by the DEMI project id with page, size, count and sort', fakeAsync(() => {
    load([doc('d21', false)], 21);

    expect(documentService.listNative).toHaveBeenCalledTimes(1);
    expect(listQuery()).toEqual({
      page: 3, pageSize: 10, count: true, sort: 'displayName', q: undefined,
      filters: {
        project: '7', documentSource: 'PROJECT', milestoneId: undefined, typeId: undefined, documentAuthorTypeId: undefined,
        projectPhaseId: undefined, datePostedStart: undefined, datePostedEnd: undefined
      }
    });
  }));

  it('sends URL filters and keywords under their native names', fakeAsync(() => {
    load([], 0, {
      ...urlParams, keywords: 'tailings%20dam', milestone: 'm1,m2', type: 't1', documentAuthorType: 'a1',
      projectPhase: 'ph1', datePostedStart: '2020-01-01', datePostedEnd: '2020-12-31'
    });

    expect(listQuery()).toEqual(jasmine.objectContaining({
      q: 'tailings dam',
      filters: {
        project: '7', documentSource: 'PROJECT', milestoneId: ['m1', 'm2'], typeId: ['t1'], documentAuthorTypeId: ['a1'],
        projectPhaseId: ['ph1'], datePostedStart: '2020-01-01', datePostedEnd: '2020-12-31'
      }
    }));
  }));

  it('sorts newest first when the URL sort is one DEMI cannot sort on', fakeAsync(() => {
    load([], 0, { ...urlParams, sortByCategorized: '+type' });
    expect(documentService.listNative.calls.mostRecent().args[0].sort).toBe('-datePosted');
  }));

  it('keeps only the first key of an old two-key URL sort', fakeAsync(() => {
    load([], 0, { ...urlParams, sortByCategorized: '-datePosted,+displayName' });
    expect(documentService.listNative.calls.mostRecent().args[0].sort).toBe('-datePosted');
  }));

  it('publishes by Eagle id and skips a row DEMI holds alone', fakeAsync(() => {
    load([doc('uuid-1', false, 'e1'), doc('uuid-2', false, null)], 21);
    checkRow('uuid-1');
    checkRow('uuid-2');

    component.publishDocument();
    flushMicrotasks();

    expect(documentService.publish).toHaveBeenCalledOnceWith('e1');
  }));

  it('hands the selected native rows to the edit screen', fakeAsync(() => {
    const row = doc('uuid-1', false, 'e1');
    load([row, doc('d22', false)], 21);
    checkRow('uuid-1');

    component.selectAction('edit');

    expect(storage.state.selectedDocs).toEqual([row]);
    expect(navigate).toHaveBeenCalledWith(['p', 'p1', 'project-documents', 'edit']);
  }));

  it('downloads each checked row through DEMI by its DEMI id', fakeAsync(() => {
    load([doc('uuid-1', true, 'e1')], 21);
    documentService.downloadNative.and.resolveTo();
    checkRow('uuid-1');

    component.selectAction('download');

    expect(documentService.downloadNative).toHaveBeenCalledOnceWith('uuid-1');
  }));
  it('leaves comment attachments out with documentSource=PROJECT', fakeAsync(() => {
    load([], 0);
    expect(listQuery()).toEqual(jasmine.objectContaining({ filters: jasmine.objectContaining({ documentSource: 'PROJECT' }) }));
  }));

  it('links a row to the route project when DEMI leaves out projectEagleId', fakeAsync(() => {
    load([doc('uuid-1', false, 'e1')], 21);
    expect(component.categorizedDocumentTableData.data[0].projectEagleId).toBe('p1');
  }));

  it('keeps Publish disabled when the only checked row has no Eagle id', fakeAsync(() => {
    load([doc('uuid-2', false, null)], 21);
    checkRow('uuid-2');

    component.updateSelectedRow(Constants.documentTypes.CATEGORIZED, { count: 1, activeLegislationYear: null });

    expect(component.isEnabled('publish')).toBeFalse();
  }));
});
