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

  function open(path: string, stored: object | null) {
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['error', 'success']);
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
            snapshot: { routeConfig: { path } }
          }
        }
      ]
    });
    TestBed.inject(StorageService).state.extension = stored;
    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ExtensionComponent);
    fixture.detectChanges();
  }

  afterEach(() => http.verify());

  function button(selector: string): HTMLButtonElement {
    return fixture.nativeElement.querySelector(selector);
  }

  function type(id: string, value: string) {
    const input: HTMLInputElement = fixture.nativeElement.querySelector(`input[name="${id}"]`);
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  // The write goes to the DEMI id from a fresh read, not to the route's Eagle id.
  function answerRead() {
    http.expectOne(`/demi/api/projects/${EAGLE_ID}`).flush({ id: DEMI_ID, eagleId: EAGLE_ID, name: 'Ashcroft Ranch Landfill' });
  }

  it('edit PUTs projects/<demiId>/extensions/<id> and returns to the project edit form', () => {
    open('edit/edit-extension', { ...STORED });
    button('button[type="submit"]').click();
    answerRead();

    const req = http.expectOne(`/demi/api/projects/${DEMI_ID}/extensions/e1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.type).toBe('Extension');
    expect(req.request.body.appliedTo).toBe('Review');
    req.flush({ reviewExtensions: [], reviewSuspensions: [] });

    expect(router.navigate).toHaveBeenCalledWith(['/p', EAGLE_ID, 'edit']);
  });

  it('a refused edit shows DEMI\'s message and enables the buttons again', () => {
    open('edit/edit-extension', { ...STORED });
    button('button[type="submit"]').click();
    fixture.detectChanges();
    expect(button('button[type="submit"]').disabled).toBe(true);
    expect(button('button.btn-danger').disabled).toBe(true);
    expect(button('#button-cl').disabled).toBe(true);
    answerRead();

    http.expectOne(`/demi/api/projects/${DEMI_ID}/extensions/e1`)
      .flush({ error: 'Invalid extension', fields: { end: 'must be after start' } }, { status: 400, statusText: 'Bad Request' });
    fixture.detectChanges();

    expect(toast.error).toHaveBeenCalledWith('Failed to edit extension. Invalid extension end: must be after start');
    expect(button('button[type="submit"]').disabled).toBe(false);
    expect(button('button.btn-danger').disabled).toBe(false);
    expect(button('#button-cl').disabled).toBe(false);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('add ignores a leftover stored item, POSTs a suspension and keeps Save off while leaving', () => {
    open('edit/add-suspension', { ...STORED });
    expect(button('button.btn-danger')).toBeNull();
    type('appliedTo', 'Application');
    type('start', '2026-03-01');
    type('end', '2026-04-01');
    fixture.detectChanges();
    button('button[type="submit"]').click();
    answerRead();

    const req = http.expectOne(`/demi/api/projects/${DEMI_ID}/extensions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.type).toBe('Suspension');
    expect(req.request.body.appliedTo).toBe('Application');
    expect(req.request.body.start).toEqual(new Date(2026, 2, 1));
    expect(req.request.body.end).toEqual(new Date(2026, 3, 1));
    req.flush({ reviewExtensions: [], reviewSuspensions: [] });
    fixture.detectChanges();

    expect(toast.success).toHaveBeenCalledWith('Suspension added.');
    expect(router.navigate).toHaveBeenCalledWith(['/p', EAGLE_ID, 'edit']);
    expect(button('button[type="submit"]').disabled).toBe(true);
  });

  it('edit with no stored item sends nothing and goes back', () => {
    open('edit/edit-suspension', null);

    expect(toast.error).toHaveBeenCalledWith('No suspension selected to edit.');
    expect(router.navigate).toHaveBeenCalledWith(['/p', EAGLE_ID, 'edit']);
  });

  it('confirmed delete DELETEs the stored item by id', async () => {
    open('edit/edit-extension', { ...STORED });
    const confirmed = Promise.resolve(true);
    modal.open.and.returnValue({ componentInstance: {}, result: confirmed } as ReturnType<NgbModal['open']>);

    button('button.btn-danger').click();
    await confirmed;
    answerRead();

    expect(http.expectOne(`/demi/api/projects/${DEMI_ID}/extensions/e1`).request.method).toBe('DELETE');
  });
});
