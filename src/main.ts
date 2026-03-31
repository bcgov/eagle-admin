import { enableProdMode, importProvidersFrom, inject, provideAppInitializer } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { environment } from './environments/environment';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
// --- services ---
import { ApiService } from './app/services/api';
import { CommentPeriodService } from './app/services/commentperiod.service';
import { CommentService } from './app/services/comment.service';
import { ConfigService } from './app/services/config.service';
import { DecisionService } from './app/services/decision.service';
import { DocumentService } from './app/services/document.service';
import { ExcelService } from './app/services/excel.service';
import { KeycloakService } from './app/services/keycloak.service';
import { NotificationProjectService } from './app/services/notification-project.service';
import { ProjectService } from './app/services/project.service';
import { RecentActivityService } from './app/services/recent-activity';
import { SearchService } from './app/services/search.service';
import { SideBarService } from './app/services/sidebar.service';
import { StorageService } from './app/services/storage.service';
import { UserService } from './app/services/user.service';
import { Utils } from './app/shared/utils/utils';
import { TableTemplateUtils } from './app/shared/utils/table-template-utils';
import { NavigationStackUtils } from './app/shared/utils/navigation-stack-utils';
import { TokenInterceptor } from './app/shared/utils/token-interceptor';

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
    importProvidersFrom(
      AppRoutingModule
    ),
    provideAppInitializer(() => {
      const initializerFn = (initConfig)(inject(ConfigService), inject(KeycloakService));
      return initializerFn();
    }),
    provideAnimations(),
    provideHttpClient(
      withInterceptorsFromDi(),
    ),
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
    ApiService,
    CommentPeriodService,
    CommentService,
    ConfigService,
    DecisionService,
    DocumentService,
    ExcelService,
    KeycloakService,
    NotificationProjectService,
    ProjectService,
    RecentActivityService,
    SearchService,
    SideBarService,
    StorageService,
    UserService,
    Utils,
    TableTemplateUtils,
    NavigationStackUtils,
    { provide: NZ_I18N, useValue: en_US },
  ]
});
