import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule, APP_INITIALIZER, ApplicationRef } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';

// modules
import { AppRoutingModule } from 'app/app-routing.module';
import { ProjectModule } from 'app/project/project.module';
import { ProjectsModule } from 'app/projects/projects.module';
import { SharedModule } from './shared/shared.module';

// components
// import { AddEditUserComponent } from 'app/administration/users/add-edit-user/add-edit-user.component';
import { AdministrationComponent } from 'app/administration/administration.component';
import { AppComponent } from 'app/app.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { FooterComponent } from 'app/footer/footer.component';
import { HeaderComponent } from 'app/header/header.component';
import { HomeComponent } from 'app/home/home.component';
import { LoginComponent } from 'app/login/login.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { ProjectComponent } from './project/project.component';
import { SearchComponent } from 'app/search/search.component';
import { SidebarComponent } from 'app/sidebar/sidebar.component';
import { TopicsComponent } from 'app/administration/topics/topics.component';

// services
import { AuthenticationService } from 'app/services/authentication.service';
import { CanDeactivateGuard } from 'app/services/can-deactivate-guard.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { CommentService } from 'app/services/comment.service';
import { ConfigService } from 'app/services/config.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { FeatureService } from 'app/services/feature.service';
import { KeycloakService } from 'app/services/keycloak.service';
import { ProjectService } from 'app/services/project.service';
import { SearchService } from 'app/services/search.service';
import { UserService } from 'app/services/user.service';
import { TopicService } from 'app/services/topic.service';
import { SideBarService } from 'app/services/sidebar.service';
import { ValuedComponentService } from './services/valued-component.service';

// feature modules
import { TokenInterceptor } from 'app/shared/utils/token-interceptor';
import { DayCalculatorModalComponent } from './day-calculator-modal/day-calculator-modal.component';
import { AddEditTopicComponent } from 'app/administration/topics/add-edit-topic/add-edit-topic.component';
import { MapComponent } from './map/map.component';
import { MetricsComponent } from './metrics/metrics.component';
import { ActivityComponent } from './activity/activity.component';
import { TopicTableRowsComponent } from './administration/topics/topic-table-rows/topic-table-rows.component';

export function kcFactory(keycloakService: KeycloakService) {
  return () => keycloakService.init();
}

@NgModule({
  declarations: [
    // AddEditUserComponent,
    AdministrationComponent,
    AppComponent,
    ConfirmComponent,
    DayCalculatorModalComponent,
    AddEditTopicComponent,
    FooterComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    NotAuthorizedComponent,
    ProjectComponent,
    SearchComponent,
    SidebarComponent,
    TopicsComponent,
    TopicTableRowsComponent,
    MapComponent,
    MetricsComponent,
    ActivityComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ProjectModule,
    ProjectsModule,
    SharedModule,
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
    AuthenticationService,
    CanDeactivateGuard,
    CommentPeriodService,
    CommentService,
    ConfigService,
    CookieService,
    DecisionService,
    DocumentService,
    FeatureService,
    ProjectService,
    SearchService,
    UserService,
    TopicService,
    SideBarService,
    ValuedComponentService
  ],
  entryComponents: [
    // AddEditUserComponent,
    ConfirmComponent,
    DayCalculatorModalComponent,
    AddEditTopicComponent,
    TopicTableRowsComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
