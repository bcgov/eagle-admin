import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule, APP_INITIALIZER, ApplicationRef } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

// modules
import { AppRoutingModule } from 'app/app-routing.module';
import { ProjectModule } from 'app/project/project.module';
import { ProjectsModule } from 'app/projects/projects.module';
import { SharedModule } from './shared/shared.module';
import { EditorModule } from '@tinymce/tinymce-angular';

// components
import { AdministrationComponent } from 'app/administration/administration.component';
import { AppComponent } from 'app/app.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { FooterComponent } from 'app/footer/footer.component';
import { HeaderComponent } from 'app/header/header.component';
import { ToggleButtonComponent } from 'app/toggle-button/toggle-button.component';
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
import { ContactsComponent } from './contacts/contacts.component';
import { UserTableRowsComponent } from './contacts/user-table-rows/user-table-rows.component';
import { ActivityTableRowsComponent } from 'app/activity/activity-table-rows/activity-table-rows.component';
import { CurrencyPipe } from '@angular/common';
import { AddEditActivityComponent } from './activity/add-edit-activity/add-edit-activity.component';
import { RecentActivityService } from './services/recent-activity';
import { SearchHelpComponent } from './search-help/search-help.component';
import { ActivityDetailTableRowsComponent } from './activity/activity-detail-table-rows/activity-detail-table-rows.component';
import { PinsTableRowsComponent } from './project/pins-list/pins-table-rows/pins-table-rows.component';
import { GroupsTableRowsComponent } from './project/project-groups/project-groups-table-rows/project-groups-table-rows.component';
import { InputModalComponent } from './input-modal/input-modal.component';
import { GroupTableRowsComponent } from './project/project-groups/group-contact/group-table-rows/group-table-rows.component';
import { AddEditContactComponent } from './contacts/add-edit-contact/add-edit-contact.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationsTableRowsComponent } from './organizations/organizations-table-rows/organizations-table-rows.component';
import { AddEditOrganizationComponent } from './organizations/add-edit-organization/add-edit-organization.component';
import { LinkOrganizationComponent } from './shared/components/link-organization/link-organization.component';
import { LinkOrganizationTableRowsComponent } from './shared/components/link-organization/link-organization-table-rows/link-organization-table-rows.component';
import { NotificationProjectsComponent } from './notification-projects/notification-projects.component';
import { AddEditNotificationProjectComponent } from './notification-projects/add-edit-notification-project/add-edit-notification-project.component';
import { NotificationProjectService } from './services/notification-project.service';
import { NotificationProjectTableRowsComponent } from './notification-projects/notification-projects-table-rows/notification-project-table-rows.component';
import { NotificationProjectComponent } from './notification-project/notification-project.component';

export function kcFactory(keycloakService: KeycloakService) {
  return () => keycloakService.init();
}

@NgModule({
  declarations: [
    ActivityComponent,
    ActivityDetailTableRowsComponent,
    ActivityTableRowsComponent,
    AddEditActivityComponent,
    AddEditContactComponent,
    AddEditNotificationProjectComponent,
    AddEditOrganizationComponent,
    AddEditTopicComponent,
    AdministrationComponent,
    AppComponent,
    ConfirmComponent,
    ContactsComponent,
    DayCalculatorModalComponent,
    FooterComponent,
    GroupTableRowsComponent,
    HeaderComponent,
    HomeComponent,
    InputModalComponent,
    LoginComponent,
    MapComponent,
    MetricsComponent,
    NotAuthorizedComponent,
    NotificationProjectComponent,
    NotificationProjectsComponent,
    NotificationProjectTableRowsComponent,
    OrganizationsComponent,
    OrganizationsTableRowsComponent,
    PinsTableRowsComponent,
    ProjectComponent,
    SearchComponent,
    SearchHelpComponent,
    SidebarComponent,
    ToggleButtonComponent,
    TopicsComponent,
    TopicTableRowsComponent,
    UserTableRowsComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ProjectModule,
    ProjectsModule,
    SharedModule,
    EditorModule,
    AppRoutingModule, // <-- module import order matters - https://angular.io/guide/router#module-import-order-matters
    NgbModule.forRoot(),
    NgxPaginationModule,
    BootstrapModalModule.forRoot({ container: document.body }),
    NgSelectModule
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
    CurrencyPipe,
    DecisionService,
    DocumentService,
    NotificationProjectService,
    ProjectService,
    RecentActivityService,
    SearchService,
    SideBarService,
    TopicService,
    UserService,
    ValuedComponentService
  ],
  entryComponents: [
    ActivityDetailTableRowsComponent,
    ActivityTableRowsComponent,
    AddEditActivityComponent,
    AddEditContactComponent,
    AddEditOrganizationComponent,
    AddEditTopicComponent,
    ConfirmComponent,
    DayCalculatorModalComponent,
    GroupsTableRowsComponent,
    GroupTableRowsComponent,
    InputModalComponent,
    LinkOrganizationComponent,
    LinkOrganizationTableRowsComponent,
    NotificationProjectTableRowsComponent,
    OrganizationsTableRowsComponent,
    PinsTableRowsComponent,
    TopicTableRowsComponent,
    UserTableRowsComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
