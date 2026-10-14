import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRouteSnapshot, RedirectCommand, convertToParamMap, provideRouter } from '@angular/router';
import { Observable, firstValueFrom } from 'rxjs';

import { commentPeriodResolver } from './comment-period.resolver';
import { ConfigService } from '../services/config.service';
import { KeycloakService } from '../services/keycloak.service';
import { LoggingService } from '../services/logging.service';
import { ToastService } from '../services/toast.service';
import { LegacyCommentPeriod } from '../comment-periods/comment-period-legacy';
import { nativeCommentPeriod } from '../models/demi/comment-period.fixture';

const PERIOD = '598b6eb61ecbc9001dfeba55';

describe('commentPeriodResolver', () => {
  let http: HttpTestingController;
  let keycloak: jasmine.SpyObj<KeycloakService>;

  beforeEach(() => {
    keycloak = jasmine.createSpyObj<KeycloakService>('KeycloakService', ['getToken', 'getUserRoles']);
    keycloak.getToken.and.returnValue('token');
    keycloak.getUserRoles.and.returnValue(['sysadmin']);
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigService, useValue: { getApiPath: () => '/api', getDemiApiPath: () => '/demi/api' } },
        { provide: KeycloakService, useValue: keycloak },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error', 'debug']) },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error']) }
      ]
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function resolve(commentPeriodId: string): Promise<LegacyCommentPeriod | RedirectCommand> {
    const route = { paramMap: convertToParamMap({ commentPeriodId }) } as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() => commentPeriodResolver(route, null));
    return firstValueFrom(result as Observable<LegacyCommentPeriod | RedirectCommand>);
  }

  function answer(row: object, summary: object | null) {
    http.expectOne(`/demi/api/comment-periods/${PERIOD}`).flush(row);
    http.expectOne(`/demi/api/comment-periods/${PERIOD}/summary`).flush(summary);
  }

  it('gives the screens the legacy period with its summary, Eagle ids and token roles', async () => {
    const result = resolve(PERIOD);
    answer(nativeCommentPeriod(), { id: PERIOD, total: 3, eaoStatus: { Pending: 2, Published: 1, Rejected: 0, Deferred: 0 } });

    const period = await result as LegacyCommentPeriod;
    expect(period._id).toBe(PERIOD);
    expect(period.project).toBe('59679ade3acbf9001de7ea8b');
    expect(period.summary.Pending).toBe(2);
    expect(period.userCan).toBe('sysadmin');
    expect(period.readOnly).toBeFalse();
  });

  it('marks an ENGAGE period read-only', async () => {
    const result = resolve(PERIOD);
    answer(nativeCommentPeriod({ sourceSystem: 'engage' }), null);

    expect((await result as LegacyCommentPeriod).readOnly).toBeTrue();
  });

  it('redirects to search when the period cannot be read', async () => {
    const result = resolve(PERIOD);
    http.expectOne(`/demi/api/comment-periods/${PERIOD}`).flush({ error: 'Comment period not found' }, { status: 404, statusText: 'Not Found' });
    http.expectOne(`/demi/api/comment-periods/${PERIOD}/summary`).flush(null);

    expect(await result).toBeInstanceOf(RedirectCommand);
  });
});
