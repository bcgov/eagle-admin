import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { MIRROR_PENDING_MESSAGE, mirrorNoticeInterceptor } from './mirror-notice.interceptor';

describe('mirrorNoticeInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let toast: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['info', 'warning', 'success', 'error', 'show']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([mirrorNoticeInterceptor])),
        provideHttpClientTesting(),
        { provide: ToastService, useValue: toast }
      ]
    });
    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
  });

  afterEach(() => backend.verify());

  it('shows the search-delay notice once when a POST comes back with mirrored false', async () => {
    const result = firstValueFrom(http.post('/api/project', { name: 'p' }));
    backend.expectOne('/api/project').flush({ _id: 'p1', mirrored: false });
    await result;

    expect(toast.info).toHaveBeenCalledOnceWith('Saved. It will appear in search within a few minutes.');
  });

  it('shows the notice for a DELETE with mirrored false', async () => {
    const result = firstValueFrom(http.delete('/api/document/d1'));
    backend.expectOne('/api/document/d1').flush({ mirrored: false });
    await result;

    expect(toast.info).toHaveBeenCalledOnceWith(MIRROR_PENDING_MESSAGE);
  });

  it('shows nothing when a POST comes back with mirrored true', async () => {
    const result = firstValueFrom(http.post('/api/project', { name: 'p' }));
    backend.expectOne('/api/project').flush({ _id: 'p1', mirrored: true });
    await result;

    expect(toast.info).not.toHaveBeenCalled();
  });

  it('shows nothing for a GET even when the body has mirrored false', async () => {
    const result = firstValueFrom(http.get('/api/project/p1'));
    backend.expectOne('/api/project/p1').flush({ _id: 'p1', mirrored: false });
    await result;

    expect(toast.info).not.toHaveBeenCalled();
  });

  it('shows nothing when a PUT returns an empty body', async () => {
    const result = firstValueFrom(http.put('/api/project/p1', {}));
    backend.expectOne('/api/project/p1').flush(null);
    await result;

    expect(toast.info).not.toHaveBeenCalled();
  });

  it('shows nothing when a POST returns a text body', async () => {
    const result = firstValueFrom(http.post('/api/project', {}, { responseType: 'text' }));
    backend.expectOne('/api/project').flush('mirrored: false');
    await result;

    expect(toast.info).not.toHaveBeenCalled();
  });

  it('passes the response body through unchanged', async () => {
    const result = firstValueFrom(http.post<{ _id: string; mirrored: boolean }>('/api/project', {}));
    backend.expectOne('/api/project').flush({ _id: 'p1', mirrored: false });

    const body = await result;
    expect(body._id).toBe('p1');
    expect(body.mirrored).toBeFalse();
  });
});
