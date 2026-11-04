import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivityTableRowsComponent } from './activity-table-rows.component';
import { ConfigService } from 'src/app/services/config.service';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';

describe('ActivityTableRowsComponent', () => {
  let component: ActivityTableRowsComponent;
  let http: HttpTestingController;
  let toastService: jasmine.SpyObj<ToastService>;
  let modal: jasmine.SpyObj<NgbModal>;

  beforeEach(() => {
    toastService = jasmine.createSpyObj('ToastService', ['error']);
    modal = jasmine.createSpyObj('NgbModal', ['open']);
    TestBed.configureTestingModule({
      imports: [ActivityTableRowsComponent],
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        KeycloakService,
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) },
        { provide: ToastService, useValue: toastService },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) },
        { provide: NgbModal, useValue: modal }
      ]
    });
    // No detectChanges: togglePin and archiveActivity need no rendered rows. Inputs set so a stray tick cannot fail ngOnInit.
    const fixture = TestBed.createComponent(ActivityTableRowsComponent);
    fixture.componentRef.setInput('data', new TableObject(ActivityTableRowsComponent, []));
    fixture.componentRef.setInput('columnData', []);
    fixture.componentRef.setInput('smallTable', false);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('opens a row by its DEMI id and shows the joined project name', () => {
    const fixture = TestBed.createComponent(ActivityTableRowsComponent);
    fixture.componentRef.setInput('data', new TableObject(ActivityTableRowsComponent, [{ id: 'a1', projectName: 'Site C', headline: 'H' }]));
    fixture.componentRef.setInput('columnData', Array(7).fill({ width: '10%' }));
    fixture.componentRef.setInput('smallTable', false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('td[data-label="Project"]').textContent.trim()).toBe('Site C');
    fixture.nativeElement.querySelector('td[data-label="Headline"]').click();
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(['/activity', 'a1', 'edit']);
  });

  it('togglePin PUTs {pinned} only', () => {
    const row = { id: 'a1', eagleId: 'e1', pinned: false, headline: 'H', _etag: '"etag-1"', dateUpdated: 'd1' };

    component.togglePin(row);

    const req = http.expectOne('/demi/api/updates/a1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ pinned: true });
    req.flush({ ...row, pinned: true });
    expect(row.pinned).toBeTrue();
  });

  it('flips the pin back and toasts DEMI\'s reason when the PUT is refused', () => {
    const row = { id: 'a1', eagleId: 'e1', pinned: false };

    component.togglePin(row);
    http.expectOne('/demi/api/updates/a1').flush({ error: 'Forbidden.' }, { status: 403, statusText: 'Forbidden' });

    expect(row.pinned).toBeFalse();
    expect(toastService.error).toHaveBeenCalledWith('Failed to pin update. Forbidden.');
  });

  describe('archiveActivity', () => {
    async function confirmArchive(row: object) {
      const result = Promise.resolve(true);
      modal.open.and.returnValue({ componentInstance: {}, result } as any);
      component.archiveActivity(row);
      await result;
    }

    it('archive DELETEs updates/<id>', async () => {
      const row = { id: 'a1', eagleId: 'e1', status: 'published', active: true };

      await confirmArchive(row);
      const req = http.expectOne('/demi/api/updates/a1');
      expect(req.request.method).toBe('DELETE');
      req.flush({ id: 'a1', status: 'archived', active: false });

      expect(row.status).toBe('archived');
      expect(row.active).toBeFalse();
      expect(toastService.error).not.toHaveBeenCalled();
    });

    function askArchive(row: object) {
      const componentInstance: any = {};
      modal.open.and.returnValue({ componentInstance, result: new Promise(() => {}) } as any);
      component.archiveActivity(row);
      return componentInstance;
    }

    it('asks in plain words, with Archive and Keep buttons', () => {
      const dialog = askArchive({ id: 'a1', eagleId: 'a1', status: 'published', publishDate: '2026-01-01T00:00:00Z' });

      expect(dialog.title).toBe('Archive this Update?');
      expect(dialog.message).toBe('It will be removed from the public site.');
      expect(dialog.okLabel).toBe('Archive');
      expect(dialog.cancelLabel).toBe('Keep');
    });

    it('tells a scheduled Update it will not go live', () => {
      const dialog = askArchive({ id: 'a1', eagleId: 'a1', status: 'published', publishDate: '2099-01-01T00:00:00Z' });

      expect(dialog.message).toBe('It will not go live on its date.');
    });

    it('says nothing about the public site for a draft', () => {
      const dialog = askArchive({ id: 'a1', eagleId: 'a1', status: 'draft' });

      expect(dialog.message).toBe('It will be marked as archived.');
    });

    it('sends no archive request when Keep is chosen', async () => {
      const row = { id: 'a1', eagleId: 'a1', status: 'published', active: true };
      const result = Promise.reject(false);
      modal.open.and.returnValue({ componentInstance: {}, result } as any);

      component.archiveActivity(row);
      await result.catch(() => undefined);

      http.expectNone('/demi/api/updates/a1');
      expect(row.status).toBe('published');
    });

    it('keeps the row and toasts DEMI\'s reason when the archive fails', async () => {
      const row = { id: 'a1', eagleId: 'e1', status: 'published', active: true };

      await confirmArchive(row);
      http.expectOne('/demi/api/updates/a1').flush({ error: 'Not found.' }, { status: 404, statusText: 'Not Found' });

      expect(row.status).toBe('published');
      expect(toastService.error).toHaveBeenCalledWith('Failed to archive update. Not found.');
    });
  });

  describe('status flags', () => {
    // WCAG 2 relative luminance of a computed rgb() colour.
    function luminance(rgb: string): number {
      const [r, g, b] = rgb.match(/\d+/g)!.slice(0, 3).map(v => Number(v) / 255)
        .map(c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    function flagContrast(status: string): number {
      const fixture = TestBed.createComponent(ActivityTableRowsComponent);
      fixture.componentRef.setInput('data', new TableObject(ActivityTableRowsComponent, [{ id: 'a1', eagleId: 'a1', headline: 'H', status }]));
      fixture.componentRef.setInput('columnData', Array(7).fill({ width: '10%' }));
      fixture.componentRef.setInput('smallTable', false);
      fixture.detectChanges();
      const style = getComputedStyle(fixture.nativeElement.querySelector('td[data-label="Status"] span'));
      const [light, dark] = [luminance(style.color), luminance(style.backgroundColor)].sort((a, b) => b - a);
      return (light + 0.05) / (dark + 0.05);
    }

    it('gives the Published flag AA text contrast', () => {
      expect(flagContrast('published')).toBeGreaterThanOrEqual(4.5);
    });

    it('gives the Draft flag AA text contrast', () => {
      expect(flagContrast('draft')).toBeGreaterThanOrEqual(4.5);
    });
  });
});
