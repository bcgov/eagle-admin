import { TestBed } from '@angular/core/testing';

import { LoginComponent } from './login.component';
import { ApiService } from 'src/app/services/api';
import { KeycloakService } from 'src/app/services/keycloak.service';
import { Router } from '@angular/router';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigService } from 'src/app/services/config.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('LoginComponent', () => {
  async function render(keycloakEnabled: boolean): Promise<jasmine.SpyObj<Router>> {
    const router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        ApiService,
        ConfigService,
        { provide: KeycloakService, useValue: { keycloakEnabled } },
        { provide: Router, useValue: router },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    TestBed.createComponent(LoginComponent).detectChanges();
    return router;
  }

  it('sends the user to the main page when keycloak handles sign-in', async () => {
    const router = await render(true);

    expect(router.navigate).toHaveBeenCalledOnceWith(['/']);
  });

  it('stays on the login form when keycloak is off', async () => {
    const router = await render(false);

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
