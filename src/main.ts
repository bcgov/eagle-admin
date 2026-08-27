import { enableProdMode, inject, provideAppInitializer, ErrorHandler } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { provideRouter, withComponentInputBinding, withNavigationErrorHandler, withRouterConfig } from '@angular/router';
import { Router } from '@angular/router';
import { routes } from './app/app-routing.module';
import { provideHttpClient, withInterceptorsFromDi, withInterceptors, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { environment } from './environments/environment';
// --- services needed at bootstrap init ---
import { ConfigService } from './app/services/config.service';
import { KeycloakService } from './app/services/keycloak.service';
import { GateService } from './app/services/gate.service';
import { TokenInterceptor } from './app/shared/utils/token-interceptor';
import { GlobalErrorHandler } from './app/services/global-error-handler';
import { loggingInterceptor } from './app/interceptors/logging.interceptor';
import { httpCacheInterceptor } from './app/interceptors/http-cache.interceptor';

if (environment.production) {
  enableProdMode();
}

function initConfig(
  configService: ConfigService,
  keycloakService: KeycloakService,
  gateService: GateService
) {
  return async () => {
    await configService.init();
    // Keycloak's login-required redirect fires inside init(), so it must not run while the
    // access curtain is up — GateComponent starts it once the visitor is let through.
    if (gateService.open()) {
      await keycloakService.init();
    }
  };
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({ paramsInheritanceStrategy: 'always' }),
      withNavigationErrorHandler((error) => {
        const router = inject(Router);
        console.error('Navigation error:', error);
        router.navigate(['/search']);
      })
    ),
    provideAppInitializer(() => {
      const initializerFn = (initConfig)(inject(ConfigService), inject(KeycloakService), inject(GateService));
      return initializerFn();
    }),
    provideAnimations(),
    provideHttpClient(
      withInterceptorsFromDi(),
      withInterceptors([httpCacheInterceptor, loggingInterceptor]),
    ),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ]
}).catch(err => {
  // Bootstrap failed — config fetch or Keycloak. Stay cause-agnostic: keycloak.service
  // rejects with no argument, so never blame a specific step in the user-facing text.
  console.error('Bootstrap failed:', err);
  const alert = document.createElement('p');
  alert.setAttribute('role', 'alert');
  alert.textContent = 'The EPIC admin console could not start. Please try again shortly.';
  // Replace app-root rather than appending: index.html ships a placeholder spinner inside it,
  // and nothing else removes it, so appending leaves the page saying "loading" and "could not
  // start" at the same time.
  (document.querySelector('app-root') ?? document.body).replaceChildren(alert);
});
