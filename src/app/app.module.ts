import { NgModule, APP_INITIALIZER, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { CookieService } from 'ngx-cookie-service';

// modules
import { SharedModule } from 'app/shared.module';
import { ProjectsModule } from 'app/projects/projects.module';
import { AppRoutingModule } from 'app/app-routing.module';

// components
import { AppComponent } from 'app/app.component';
import { HomeComponent } from 'app/home/home.component';
import { SearchComponent } from 'app/search/search.component';
import { LoginComponent } from 'app/login/login.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { HeaderComponent } from 'app/header/header.component';
import { FooterComponent } from 'app/footer/footer.component';
import { SidebarComponent } from 'app/sidebar/sidebar.component';
import { AdministrationComponent } from 'app/administration/administration.component';
import { UsersComponent } from 'app/administration/users/users.component';
import { AddEditUserComponent } from 'app/administration/users/add-edit-user/add-edit-user.component';

// services
import { SearchService } from 'app/services/search.service';
import { FeatureService } from 'app/services/feature.service';
import { AuthenticationService } from 'app/services/authentication.service';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';
import { DecisionService } from 'app/services/decision.service';
import { UserService } from 'app/services/user.service';
import { CanDeactivateGuard } from 'app/services/can-deactivate-guard.service';
import { ConfigService } from 'app/services/config.service';
import { KeycloakService } from 'app/services/keycloak.service';

// feature modules
import { TokenInterceptor } from './utils/token-interceptor';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { ProjectsComponent } from './projects/projects.component';

export function kcFactory(keycloakService: KeycloakService) {
  return () => keycloakService.init();
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    SearchComponent,
    LoginComponent,
    ConfirmComponent,
    HeaderComponent,
    FooterComponent,
    ProjectsComponent,
    SidebarComponent,
    AdministrationComponent,
    UsersComponent,
    AddEditUserComponent,
    NotAuthorizedComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    ProjectsModule,
    AppRoutingModule, // <-- module import order matters - https://angular.io/guide/router#module-import-order-matters
    NgbModule.forRoot(),
    NgxPaginationModule,
    BootstrapModalModule.forRoot({ container: document.body })
  ],
  providers: [
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: kcFactory,
      deps: [KeycloakService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    },
    CookieService,
    SearchService,
    FeatureService,
    AuthenticationService,
    ProjectService,
    CommentPeriodService,
    CommentService,
    DocumentService,
    DecisionService,
    UserService,
    CanDeactivateGuard,
    ConfigService
  ],
  entryComponents: [
    ConfirmComponent,
    AddEditUserComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
