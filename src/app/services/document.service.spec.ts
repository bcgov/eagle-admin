import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';

import { DocumentService } from './document.service';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { LoggingService } from './logging.service';
import { ToastService } from './toast.service';
import { DemiDocument } from '../models/demi/document';

describe('DocumentService native reads', () => {
  let service: DocumentService;
  let http: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;
  let logger: jasmine.SpyObj<LoggingService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj('ToastService', ['error']);
    logger = jasmine.createSpyObj('LoggingService', ['error', 'warn', 'info', 'debug']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: { keycloakEnabled: true } },
        { provide: LoggingService, useValue: logger },
        { provide: ToastService, useValue: toast }
      ]
    });
    service = TestBed.inject(DocumentService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('lists one project by its DEMI id with a total count', async () => {
    const page = firstValueFrom(service.listNative({ count: true, filters: { project: '7' } }));

    const req = http.expectOne(r => r.url === '/demi/api/documents');
    expect(req.request.params.get('project')).toBe('7');
    expect(req.request.params.get('count')).toBe('true');
    req.flush([{ id: 'd1', projectId: '7', displayName: 'Report' }], { headers: { 'x-total-count': '871' } });

    const { rows, total } = await page;
    expect(rows.map(r => r.id)).toEqual(['d1']);
    expect(total).toBe(871);
  });

  it('passes sort and filters through under DEMI names', () => {
    service.listNative({ sort: '-datePosted', filters: { typeId: ['t1', 't2'], datePostedStart: '2020-01-01' } }).subscribe();

    const req = http.expectOne(r => r.url === '/demi/api/documents');
    expect(req.request.params.get('sort')).toBe('-datePosted');
    expect(req.request.params.getAll('typeId')).toEqual(['t1', 't2']);
    expect(req.request.params.get('datePostedStart')).toBe('2020-01-01');
    req.flush([]);
  });

  it('answers an empty page and a toast when the list fails', async () => {
    const page = firstValueFrom(service.listNative({ filters: { project: '7' } }));

    http.expectOne(r => r.url === '/demi/api/documents').flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect((await page).rows).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('Failed to load documents.');
  });

  it('reads one document by id', async () => {
    const doc = firstValueFrom(service.getNative('5886936ba4acd4014b81ef3c'));

    http.expectOne('/demi/api/documents/5886936ba4acd4014b81ef3c')
      .flush({ id: '5886936ba4acd4014b81ef3c', projectId: '7', displayName: 'Appendix D' });

    expect((await doc)?.displayName).toBe('Appendix D');
  });

  it('answers null when one document cannot be read', async () => {
    const doc = firstValueFrom(service.getNative('missing'));

    http.expectOne('/demi/api/documents/missing').flush({ error: 'Not found' }, { status: 404, statusText: 'Not Found' });

    expect(await doc).toBeNull();
    expect(toast.error).toHaveBeenCalledWith('Failed to load document.');
  });

  it('reads documents by id with the ids filter', async () => {
    const docs = firstValueFrom(service.byIdsNative(['a', 'b']));

    const req = http.expectOne(r => r.url === '/demi/api/documents');
    expect(req.request.params.get('ids')).toBe('a,b');
    req.flush([{ id: 'a' }, { id: 'b' }] as DemiDocument[]);

    expect((await docs).map(d => d.id)).toEqual(['a', 'b']);
  });

  it('answers no rows and a toast when the ids read fails', async () => {
    const docs = firstValueFrom(service.byIdsNative(['a']));

    http.expectOne(r => r.url === '/demi/api/documents').flush({ error: 'boom' }, { status: 500, statusText: 'Server Error' });

    expect(await docs).toEqual([]);
    expect(toast.error).toHaveBeenCalledWith('Failed to load documents.');
  });

  describe('downloadNative', () => {
    let open: jasmine.Spy;

    beforeEach(() => {
      open = spyOn(window, 'open');
    });

    it('navigates to the presigned URL instead of fetching the file', async () => {
      const done = service.downloadNative('d 1');

      http.expectOne('/demi/api/documents/d%201/download')
        .flush({ url: 'https://store.example/d1?sig=x', expiresIn: 300, fileName: 'd1.pdf', displayName: 'D1' });
      await done;

      expect(open).toHaveBeenCalledWith('https://store.example/d1?sig=x', '_self');
    });

    it('refuses and logs a URL that is not https', async () => {
      const done = service.downloadNative('d1');

      http.expectOne('/demi/api/documents/d1/download')
        .flush({ url: 'javascript:alert(1)', expiresIn: 300, fileName: 'd1.pdf', displayName: 'D1' });
      await done;

      expect(open).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Failed to download document.');
    });

    it('refuses a plain http URL', async () => {
      const done = service.downloadNative('d1');

      http.expectOne('/demi/api/documents/d1/download')
        .flush({ url: 'http://store.example/d1?sig=x', expiresIn: 300, fileName: 'd1.pdf', displayName: 'D1' });
      await done;

      expect(open).not.toHaveBeenCalled();
    });

    it('refuses an answer with no URL', async () => {
      const done = service.downloadNative('d1');

      http.expectOne('/demi/api/documents/d1/download').flush(null);
      await done;

      expect(open).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Failed to download document.');
    });

    it('shows a toast and does not navigate when DEMI hides the document', async () => {
      const done = service.downloadNative('d1');

      http.expectOne('/demi/api/documents/d1/download').flush({ error: 'Not found' }, { status: 404, statusText: 'Not Found' });
      await done;

      expect(open).not.toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Failed to download document.');
    });
  });
});
