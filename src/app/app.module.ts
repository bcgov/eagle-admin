import { BootstrapModalModule } from 'ng2-bootstrap-modal';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule, APP_INITIALIZER, ApplicationRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatTabsModule, MatMenuModule } from '@angular/material';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

// modules
import { AppRoutingModule } from 'app/app-routing.module';
import { ProjectModule } from 'app/project/project.module';
import { ProjectNotificationModule } from 'app/project-notification/project-notification.module';
import { ProjectsModule } from 'app/projects/projects.module';
import { SharedModule } from './shared/shared.module';
import { EditorModule } from '@tinymce/tinymce-angular';

// components
import { AppComponent } from 'app/app.component';
import { AddCommentComponent } from 'app/comment-period/add-comment/add-comment.component';
import { AddDocumentTableRowsComponent } from 'app/comment-periods/add-edit-comment-period/add-documents/add-document-table-rows/add-document-table-rows.component';
import { AddEditCommentPeriodComponent } from 'app/comment-periods/add-edit-comment-period/add-edit-comment-period.component';
import { AddLabelComponent } from 'app/project/project-documents/add-label/add-label.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { CommentPeriodComponent } from 'app/comment-period/comment-period.component';
import { CommentPeriodDetailsTabComponent } from 'app/comment-period/comment-period-details-tabs/comment-period-details-tab.component';
import { CommentPeriodsComponent } from 'app/comment-periods/comment-periods.component';
import { CommentPeriodsTableRowsComponent } from 'app/comment-periods/comment-periods-table-rows/comment-periods-table-rows.component';
import { AddDocumentComponent } from 'app/comment-periods/add-edit-comment-period/add-documents/add-documents.component';
import { FooterComponent } from 'app/footer/footer.component';
import { HeaderComponent } from 'app/header/header.component';
import { ToggleButtonComponent } from 'app/toggle-button/toggle-button.component';
import { HomeComponent } from 'app/home/home.component';
import { LoginComponent } from 'app/login/login.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { ProjectComponent } from './project/project.component';
import { ReviewCommentComponent } from 'app/comment-period/review-comment/review-comment.component';
import { ReviewCommentsTabComponent } from 'app/comment-period/review-comments-tab/review-comments-tab.component';
import { ReviewCommentsTabTableRowsComponent } from 'app/comment-period/review-comments-tab/review-comments-tab-table-rows/review-comments-tab-table-rows.component';
import { SearchComponent } from 'app/search/search.component';
import { SidebarComponent } from 'app/sidebar/sidebar.component';
import { UploadComponent } from 'app/project/project-documents/upload/upload.component';

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
import { SideBarService } from 'app/services/sidebar.service';

// feature modules
import { TokenInterceptor } from 'app/shared/utils/token-interceptor';
import { DayCalculatorModalComponent } from './day-calculator-modal/day-calculator-modal.component';
import { MapComponent } from './map/map.component';
import { MetricsComponent } from './metrics/metrics.component';
import { ActivityComponent } from './activity/activity.component';
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
import { ApplicationSortTableRowsComponent } from './project/project-documents/application-sort/application-sort-table-rows/application-sort-table-rows.component';
import { InputModalComponent } from './input-modal/input-modal.component';
import { GroupTableRowsComponent } from './project/project-groups/group-contact/group-table-rows/group-table-rows.component';
import { AddEditContactComponent } from './contacts/add-edit-contact/add-edit-contact.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationsTableRowsComponent } from './organizations/organizations-table-rows/organizations-table-rows.component';
import { AddEditOrganizationComponent } from './organizations/add-edit-organization/add-edit-organization.component';
import { LinkOrganizationComponent } from './shared/components/link-organization/link-organization.component';
import { LinkOrganizationTableRowsComponent } from './shared/components/link-organization/link-organization-table-rows/link-organization-table-rows.component';
import { ProjectNotificationsComponent } from './project-notifications/project-notifications.component';
import { AddEditProjectNotificationComponent } from './project-notifications/add-edit-project-notification/add-edit-project-notification.component';
import { NotificationProjectService } from './services/notification-project.service';
import { ProjectNotificationComponent } from './project-notification/project-notification.component';
import { ProjectNotificationTableRowsComponent } from './project-notifications/project-notifications-table-rows/project-notifications-table-rows.component';
import { ProjectNotificationDetailComponent } from './project-notification/detail/project-notification-detail.component';

export function initConfig(configService: ConfigService, keycloakService: KeycloakService) {
  return async () => {
    await configService.init();
    await keycloakService.init();
  };
}

@NgModule({
  declarations: [
    ActivityComponent,
    ActivityDetailTableRowsComponent,
    ActivityTableRowsComponent,
    AddCommentComponent,
    AddDocumentComponent,
    AddDocumentTableRowsComponent,
    AddEditActivityComponent,
    AddEditCommentPeriodComponent,
    AddEditContactComponent,
    AddEditProjectNotificationComponent,
    AddEditOrganizationComponent,
    AddLabelComponent,
    AppComponent,
    CommentPeriodComponent,
    CommentPeriodDetailsTabComponent,
    CommentPeriodsComponent,
    CommentPeriodsTableRowsComponent,
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
    ProjectNotificationDetailComponent,
    ProjectNotificationsComponent,
    ProjectNotificationTableRowsComponent,
    ProjectNotificationComponent,
    OrganizationsComponent,
    OrganizationsTableRowsComponent,
    PinsTableRowsComponent,
    ProjectComponent,
    ReviewCommentComponent,
    ReviewCommentsTabComponent,
    ReviewCommentsTabTableRowsComponent,
    SearchComponent,
    SearchHelpComponent,
    SidebarComponent,
    ToggleButtonComponent,
    UploadComponent,
    UserTableRowsComponent
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ProjectModule,
    ProjectNotificationModule,
    ProjectsModule,
    ProjectNotificationModule,
    SharedModule,
    EditorModule,
    AppRoutingModule, // <-- module import order matters - https://angular.io/guide/router#module-import-order-matters
    NgbModule,
    BootstrapModalModule.forRoot({ container: document.body }),
    NgSelectModule,
    MatMenuModule,
    MatTabsModule,
    MatSlideToggleModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initConfig,
      deps: [ConfigService, KeycloakService],
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
    KeycloakService,
    CookieService,
    CurrencyPipe,
    DecisionService,
    DocumentService,
    NotificationProjectService,
    ProjectService,
    RecentActivityService,
    SearchService,
    SideBarService,
    UserService
  ],
  entryComponents: [
    ActivityDetailTableRowsComponent,
    ActivityTableRowsComponent,
    AddDocumentTableRowsComponent,
    AddEditActivityComponent,
    AddEditContactComponent,
    AddEditOrganizationComponent,
    CommentPeriodComponent,
    CommentPeriodsComponent,
    CommentPeriodsTableRowsComponent,
    ConfirmComponent,
    DayCalculatorModalComponent,
    GroupsTableRowsComponent,
    ApplicationSortTableRowsComponent,
    GroupTableRowsComponent,
    InputModalComponent,
    LinkOrganizationComponent,
    LinkOrganizationTableRowsComponent,
    ProjectNotificationTableRowsComponent,
    OrganizationsTableRowsComponent,
    PinsTableRowsComponent,
    ReviewCommentsTabTableRowsComponent,
    UploadComponent,
    UserTableRowsComponent
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
