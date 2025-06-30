// Angular Core Modules
import { NgModule, APP_INITIALIZER, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Third-Party Modules
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { EditorModule } from '@tinymce/tinymce-angular';
import { CookieService } from 'ngx-cookie-service';

// Feature Modules
import { AppRoutingModule } from './app-routing.module';
import { SharedModule } from './shared/shared.module';

// Components
import { AppComponent } from './app.component';
import { AddCommentComponent } from './comment-period/add-comment/add-comment.component';
import { AddDocumentComponent } from './comment-periods/add-edit-comment-period/add-documents/add-documents.component';
import { AddDocumentTableRowsComponent } from './comment-periods/add-edit-comment-period/add-documents/add-document-table-rows/add-document-table-rows.component';
import { AddEditActivityComponent } from './activity/add-edit-activity/add-edit-activity.component';
import { AddEditCommentPeriodComponent } from './comment-periods/add-edit-comment-period/add-edit-comment-period.component';
import { AddEditContactComponent } from './contacts/add-edit-contact/add-edit-contact.component';
import { AddEditOrganizationComponent } from './organizations/add-edit-organization/add-edit-organization.component';
import { AddEditProjectNotificationComponent } from './project-notifications/add-edit-project-notification/add-edit-project-notification.component';
import { AddLabelComponent } from './project/project-documents/add-label/add-label.component';
import { ActivityComponent } from './activity/activity.component';
import { ActivityDetailTableRowsComponent } from './activity/activity-detail-table-rows/activity-detail-table-rows.component';
import { ActivityTableRowsComponent } from './activity/activity-table-rows/activity-table-rows.component';
import { ApplicationSortTableRowsComponent } from './project/project-documents/application-sort/application-sort-table-rows/application-sort-table-rows.component';
import { CommentPeriodBannerComponent } from './project/comment-period-banner/comment-period-banner.component';
import { CommentPeriodComponent } from './comment-period/comment-period.component';
import { CommentPeriodDetailsTabComponent } from './comment-period/comment-period-details-tabs/comment-period-details-tab.component';
import { CommentPeriodsComponent } from './comment-periods/comment-periods.component';
import { CommentPeriodsTableRowsComponent } from './comment-periods/comment-periods-table-rows/comment-periods-table-rows.component';
import { ConfirmComponent } from './confirm/confirm.component';
import { ContactsComponent } from './contacts/contacts.component';
import { DayCalculatorModalComponent } from './day-calculator-modal/day-calculator-modal.component';
import { DocumentApplicationSortComponent } from './project/project-documents/application-sort/application-sort.component';
import { DocumentDetailComponent } from './project/project-documents/detail/detail.component';
import { DocumentEditComponent } from './project/project-documents/document-edit/document-edit.component';
import { DocumentTableRowsComponent } from './project/project-documents/project-document-table-rows/project-document-table-rows.component';
import { FooterComponent } from './footer/footer.component';
import { GroupContactComponent } from './project/project-groups/group-contact/group-contact.component';
import { GroupContactSelectComponent } from './project/project-groups/group-contact/group-contact-select/group-contact-select.component';
import { GroupTableRowsComponent } from './project/project-groups/group-contact/group-table-rows/group-table-rows.component';
import { GroupsTableRowsComponent } from './project/project-groups/project-groups-table-rows/project-groups-table-rows.component';
import { HeaderComponent } from './header/header.component';
import { HomeComponent } from './home/home.component';
import { InputModalComponent } from './input-modal/input-modal.component';
import { LoginComponent } from './login/login.component';
import { MapComponent } from './map/map.component';
import { MetricsComponent } from './metrics/metrics.component';
import { MilestonesComponent } from './project/milestones/milestones.component';
import { NotAuthorizedComponent } from './not-authorized/not-authorized.component';
import { OrganizationsComponent } from './organizations/organizations.component';
import { OrganizationsTableRowsComponent } from './organizations/organizations-table-rows/organizations-table-rows.component';
import { PinsListComponent } from './project/pins-list/pins-list.component';
import { PinsTableRowsComponent } from './project/pins-list/pins-table-rows/pins-table-rows.component';
import { ProjectArchivedDetailComponent } from './project/project-archived-detail/project-archived-detail.component';
import { ProjectComponent } from './project/project.component';
import { ProjectDetailComponent } from './project/project-detail/project-detail.component';
import { ProjectDocumentsComponent } from './project/project-documents/project-documents.component';
import { ProjectGroupsComponent } from './project/project-groups/project-groups.component';
import { ProjectNotificationsComponent } from './project-notifications/project-notifications.component';
import { ProjectNotificationTableRowsComponent } from './project-notifications/project-notifications-table-rows/project-notifications-table-rows.component';
import { ProjectUpdatesComponent } from './project/project-updates/project-updates.component';
import { ReviewCommentComponent } from './comment-period/review-comment/review-comment.component';
import { ReviewCommentsTabComponent } from './comment-period/review-comments-tab/review-comments-tab.component';
import { ReviewCommentsTabTableRowsComponent } from './comment-period/review-comments-tab/review-comments-tab-table-rows/review-comments-tab-table-rows.component';
import { SearchComponent } from './search/search.component';
import { SearchDocumentTableRowsComponent } from './search/search-document-table-rows/search-document-table-rows.component';
import { SearchHelpComponent } from './search-help/search-help.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { ToggleButtonComponent } from './toggle-button/toggle-button.component';
import { ProjectDocumentsUploadComponent } from './project/project-documents/project-documents-upload/project-documents-upload.component';
import { UserTableRowsComponent } from './contacts/user-table-rows/user-table-rows.component';

// Services
import { ApiService } from './services/api';
import { CanDeactivateGuard } from './services/can-deactivate-guard.service';
import { CommentPeriodService } from './services/commentperiod.service';
import { CommentService } from './services/comment.service';
import { ConfigService } from './services/config.service';
import { DecisionService } from './services/decision.service';
import { DocumentService } from './services/document.service';
import { ExcelService } from './services/excel.service';
import { KeycloakService } from './services/keycloak.service';
import { NotificationProjectService } from './services/notification-project.service';
import { ProjectService } from './services/project.service';
import { RecentActivityService } from './services/recent-activity';
import { SearchService } from './services/search.service';
import { SideBarService } from './services/sidebar.service';
import { StorageService } from './services/storage.service';
import { UserService } from './services/user.service';

// Utilities / Interceptors
import { TokenInterceptor } from './shared/utils/token-interceptor';
import { ProjectNotificationDetailComponent } from './project-notification/detail/project-notification-detail.component';
import { PnDocumentTableRowsComponent } from './project-notification/documents/project-notification-document-table-rows/project-notification-document-table-rows.component';
import { ProjectNotificationDocumentsComponent } from './project-notification/documents/project-notification-documents.component';
import { ProjectNotificationComponent } from './project-notification/project-notification.component';
import { AddEditProjectComponent } from './projects/add-edit-project/add-edit-project.component';
import { FormTab2002Component } from './projects/add-edit-project/form-tab-2002/form-tab-2002.component';
import { FormTab2018Component } from './projects/add-edit-project/form-tab-2018/form-tab-2018.component';
import { ModificationsListTableRowsComponent } from './projects/add-edit-project/modifications-list-table-rows/modifications-list-table-rows.component';
import { ProjectListTableRowsComponent } from './projects/project-list/project-list-table-rows/project-list-table-rows.component';
import { ProjectListComponent } from './projects/project-list/project-list.component';
import { ProjectNotificationUploadComponent } from './project-notification/documents/project-notification-upload/project-notification-upload.component';

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
    AddEditOrganizationComponent,
    AddEditProjectNotificationComponent,
    AddLabelComponent,
    AppComponent,
    ApplicationSortTableRowsComponent,
    CommentPeriodBannerComponent,
    CommentPeriodComponent,
    CommentPeriodDetailsTabComponent,
    CommentPeriodsComponent,
    CommentPeriodsTableRowsComponent,
    ConfirmComponent,
    ContactsComponent,
    DayCalculatorModalComponent,
    DocumentApplicationSortComponent,
    DocumentDetailComponent,
    DocumentEditComponent,
    DocumentTableRowsComponent,
    FooterComponent,
    GroupContactComponent,
    GroupContactSelectComponent,
    GroupTableRowsComponent,
    GroupsTableRowsComponent,
    HeaderComponent,
    HomeComponent,
    InputModalComponent,
    LoginComponent,
    MapComponent,
    MetricsComponent,
    MilestonesComponent,
    NotAuthorizedComponent,
    OrganizationsComponent,
    OrganizationsTableRowsComponent,
    PinsListComponent,
    PinsTableRowsComponent,
    ProjectArchivedDetailComponent,
    ProjectComponent,
    ProjectDetailComponent,
    ProjectDocumentsComponent,
    ProjectGroupsComponent,
    ProjectNotificationTableRowsComponent,
    ProjectNotificationsComponent,
    ProjectUpdatesComponent,
    ReviewCommentComponent,
    ReviewCommentsTabComponent,
    ReviewCommentsTabTableRowsComponent,
    SearchComponent,
    SearchDocumentTableRowsComponent,
    SearchHelpComponent,
    SidebarComponent,
    ToggleButtonComponent,
    ProjectDocumentsUploadComponent,
    UserTableRowsComponent,
    ProjectNotificationUploadComponent,
    ProjectNotificationDetailComponent,
    ProjectNotificationComponent,
    ProjectNotificationDocumentsComponent,
    PnDocumentTableRowsComponent,
    AddEditProjectComponent,
    ProjectListComponent,
    ProjectListTableRowsComponent,
    FormTab2002Component,
    FormTab2018Component,
    ModificationsListTableRowsComponent
  ],
  bootstrap: [AppComponent],
  imports: [AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    CommonModule,
    EditorModule,
    FormsModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatTabsModule,
    NgbModule,
    NgSelectModule,
    NzPaginationModule,
    ReactiveFormsModule,
    SharedModule], providers: [
      ApiService,
      CanDeactivateGuard,
      CommentPeriodService,
      CommentService,
      ConfigService,
      CookieService,
      CurrencyPipe,
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
      provideHttpClient(withInterceptorsFromDi()),
    ]
})

export class AppModule {
  constructor(applicationRef: ApplicationRef) {
    Object.defineProperty(applicationRef, '_rootComponents', { get: () => applicationRef['components'] });
  }
}
