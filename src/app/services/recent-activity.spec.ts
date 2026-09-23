import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './config.service';
import { KeycloakService } from './keycloak.service';
import { RecentActivityService } from './recent-activity';
import { RecentActivity } from '../models/recentActivity';

describe('RecentActivityService', () => {
  let service: RecentActivityService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api' } },
        KeycloakService
      ]
    });
    service = TestBed.inject(RecentActivityService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('archives through the DELETE route, which the API turns into status archived', async () => {
    const result = firstValueFrom(service.archive(new RecentActivity({ _id: 'a1' })));

    const req = http.expectOne('/api/recentActivity/a1');
    expect(req.request.method).toBe('DELETE');
    req.flush({ _id: 'a1', status: 'archived' });

    expect((await result).status).toBe('archived');
  });

  it('passes a 409 from save through with its status, so the form can say the row changed', async () => {
    const result = firstValueFrom(service.save(new RecentActivity({ _id: 'a1', dateUpdated: 'stale' })));

    http.expectOne('/api/recentActivity/a1').flush(null, { status: 409, statusText: 'Conflict' });

    await expectAsync(result).toBeRejectedWith(jasmine.objectContaining({ status: 409 }));
  });
});
