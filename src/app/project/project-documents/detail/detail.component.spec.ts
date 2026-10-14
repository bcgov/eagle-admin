import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { DocumentDetailComponent } from './detail.component';
import { DemiDocument } from 'src/app/models/demi/document';
import { ConfigService } from 'src/app/services/config.service';
import { DocumentService } from 'src/app/services/document.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

const nativeDoc: DemiDocument = {
  id: 'uuid-1',
  eagleId: 'e1',
  projectId: '7',
  projectEagleId: 'p1',
  displayName: 'Appendix D',
  documentFileName: 'Appendix D.pdf',
  description: 'Decision appendix',
  type: 'Decision Materials',
  typeId: 't1',
  milestone: 'Decision',
  projectPhase: 'Referral',
  documentAuthorType: 'EAO',
  datePosted: '2011-09-09T19:00:00.000Z',
  dateUploaded: '2011-09-09T13:06:00.000Z',
  legislation: 2002,
  fileSize: '411449',
  isPublished: false
};

describe('DocumentDetailComponent', () => {
  let fixture: ComponentFixture<DocumentDetailComponent>;
  let documentService: jasmine.SpyObj<DocumentService>;

  function render(doc: DemiDocument) {
    documentService = jasmine.createSpyObj('DocumentService', ['publish', 'unPublish', 'downloadNative']);
    documentService.publish.and.returnValue(of({} as any));
    TestBed.configureTestingModule({
      imports: [DocumentDetailComponent],
      providers: [
        provideRouter([]),
        { provide: DocumentService, useValue: documentService },
        { provide: ConfigService, useValue: { getDemiApiPath: () => '/demi/api' } },
        { provide: StorageService, useValue: { currentProjectData: { _id: 'p1', demiId: '7', name: 'Ashcroft' }, state: {} } },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['success', 'error']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error']) }
      ]
    });
    fixture = TestBed.createComponent(DocumentDetailComponent);
    fixture.componentRef.setInput('resolvedDocument', doc);
    fixture.detectChanges();
  }

  const text = (id: string) => fixture.nativeElement.querySelector(`#${id}`)?.textContent.trim();

  async function openActions(): Promise<HTMLElement> {
    fixture.nativeElement.querySelector('#actionDropdown').click();
    fixture.detectChanges();
    await fixture.whenStable();
    return document.querySelector('[aria-labelledby="actionDropdown"]');
  }

  const menuItem = (menu: HTMLElement, label: string) =>
    Array.from(menu.querySelectorAll('button')).find(b => b.textContent.trim() === label);

  afterEach(() => fixture.destroy());

  it('renders the native fields, list names included', () => {
    render(nativeDoc);

    expect(text('displayName')).toBe('Appendix D');
    expect(text('documentFileName')).toBe('Appendix D.pdf');
    expect(text('type')).toBe('Decision Materials');
    expect(text('milestone')).toBe('Decision');
    expect(text('projectPhase')).toBe('Referral');
    expect(text('documentAuthor')).toBe('EAO');
    expect(text('legislation')).toBe('2002');
    expect(text('fileSize')).toBe('401.81 KB');
    expect(fixture.nativeElement.textContent).toContain('Not Published');
  });

  it('offers Open only for a published file and says why otherwise', async () => {
    render(nativeDoc);
    const menu = await openActions();

    expect(menuItem(menu, 'Open')).toBeUndefined();
    expect(menu.querySelector('#open-unavailable')).not.toBeNull();
  });

  it('opens a published file inline through DEMI', async () => {
    render({ ...nativeDoc, isPublished: true });
    const open = spyOn(window, 'open');
    const menu = await openActions();

    menuItem(menu, 'Open').click();

    expect(open).toHaveBeenCalledWith('/demi/api/documents/uuid-1/download?inline=1', '_blank', 'noopener');
  });

  it('publishes by the Eagle id', async () => {
    render(nativeDoc);
    const menu = await openActions();

    menuItem(menu, 'Publish').click();

    expect(documentService.publish).toHaveBeenCalledOnceWith('e1');
  });

  it('offers no publish toggle for a row DEMI holds alone', async () => {
    render({ ...nativeDoc, eagleId: null });
    const menu = await openActions();

    expect(menuItem(menu, 'Publish')).toBeUndefined();
  });
});
