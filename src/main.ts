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
import { TokenInterceptor } from './app/shared/utils/token-interceptor';
import { GlobalErrorHandler } from './app/services/global-error-handler';
import { loggingInterceptor } from './app/interceptors/logging.interceptor';
import { httpCacheInterceptor } from './app/interceptors/http-cache.interceptor';

if (environment.production) {
  enableProdMode();
}

function initConfig(
  configService: ConfigService,
  keycloakService: KeycloakService
) {
  return async () => {
    await configService.init();
    await keycloakService.init();
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
      const initializerFn = (initConfig)(inject(ConfigService), inject(KeycloakService));
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
});
