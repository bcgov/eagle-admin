import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ExtensionComponent } from './extension.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { StorageService } from 'src/app/services/storage.service';
import { ToastService } from 'src/app/services/toast.service';

const EAGLE_ID = '5885109faaecd9001b81314c';
const DEMI_ID = '7';
const STORED = { id: 'e1', type: 'Extension', appliedTo: 'Review', start: '2026-01-05T08:00:00.000Z', end: '2026-02-05T08:00:00.000Z' };

describe('ExtensionComponent', () => {
  let fixture: ComponentFixture<ExtensionComponent>;
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let toast: jasmine.SpyObj<ToastService>;
  let modal: jasmine.SpyObj<NgbModal>;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['error']);
    modal = jasmine.createSpyObj<NgbModal>('NgbModal', ['open']);
    TestBed.configureTestingModule({
      imports: [ExtensionComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api', lists: [] } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']) },
        { provide: ToastService, useValue: toast },
        { provide: NgbModal, useValue: modal },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            parent: { snapshot: { paramMap: convertToParamMap({ projId: EAGLE_ID }) } },
            snapshot: { routeConfig: { path: 'edit/edit-extension' } }
          }
        }
      ]
    });
    TestBed.inject(StorageService).state.extension = { ...STORED };
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ExtensionComponent);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  function clickSave() {
    fixture.nativeElement.querySelector('button[type="submit"]').click();
  }

  // The write goes to the DEMI id from a fresh read, not to the route's Eagle id.
  function answerRead() {
    http.expectOne(`/demi/api/projects/${EAGLE_ID}`).flush({ id: DEMI_ID, eagleId: EAGLE_ID, name: 'Ashcroft Ranch Landfill' });
  }

  it('edit PUTs projects/<demiId>/extensions/<id> and returns to the project edit form', () => {
    clickSave();
    answerRead();

    const req = http.expectOne(`/demi/api/projects/${DEMI_ID}/extensions/e1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.appliedTo).toBe('Review');
    req.flush({ reviewExtensions: [], reviewSuspensions: [] });

    expect(router.navigate).toHaveBeenCalledWith(['/p', EAGLE_ID, 'edit']);
  });

  it('a refused edit shows DEMI\'s message and stays on the form', () => {
    clickSave();
    answerRead();

    http.expectOne(`/demi/api/projects/${DEMI_ID}/extensions/e1`)
      .flush({ error: 'Invalid extension', fields: { end: 'must be after start' } }, { status: 400, statusText: 'Bad Request' });

    expect(toast.error).toHaveBeenCalledWith('Failed to edit extension. Invalid extension end: must be after start');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('confirmed delete DELETEs the stored item by id', async () => {
    const confirmed = Promise.resolve(true);
    modal.open.and.returnValue({ componentInstance: {}, result: confirmed } as ReturnType<NgbModal['open']>);

    fixture.nativeElement.querySelector('button.btn-danger').click();
    await confirmed;
    answerRead();

    expect(http.expectOne(`/demi/api/projects/${DEMI_ID}/extensions/e1`).request.method).toBe('DELETE');
  });
});
