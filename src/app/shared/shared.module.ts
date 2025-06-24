import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatMenuModule } from '@angular/material/menu';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';

import { TableDirective } from './components/table-template/table.directive';
import { DropdownTemplateComponent } from './components/dropdown-template/dropdown-template.component';
import { TableTemplateUtils } from './utils/table-template-utils';
import { TableDocumentTemplateUtils } from './utils/table-document-template-utils';
import { CommentStatsComponent } from './components/comment-stats/comment-stats.component';
import { ListConverterPipe } from './pipes/list-converter.pipe';
import { SafeHtmlPipe } from './pipes/safe-html-converter.pipe';
import { OrgNamePipe } from './pipes/org-name.pipe';
import { Utils } from './utils/utils';
import { ContactSelectComponent } from './components/contact-select/contact-select.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // <== add the imports!
import { RouterModule } from '@angular/router';
import { LinkOrganizationComponent } from './components/link-organization/link-organization.component';
import { LinkOrganizationTableRowsComponent } from './components/link-organization/link-organization-table-rows/link-organization-table-rows.component';
import { NavigationStackUtils } from './utils/navigation-stack-utils';
import { ContactSelectTableRowsComponent } from './components/contact-select-table-rows/contact-select-table-rows.component';
import { ExtensionComponent } from './components/extension/extension.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FileUploadComponent } from '../file-upload/file-upload.component';
import { TableTemplateComponent } from './components/table-template/table-template.component';
import { NewlinesPipe } from './pipes/newlines.pipe';
import { ObjectFilterPipe } from './pipes/object-filter.pipe';
import { OrderByPipe } from './pipes/order-by.pipe';
import { PublishedPipe } from './pipes/published.pipe';
import { VarDirective } from './utils/ng-var.directive';

@NgModule({
    imports: [
        RouterModule,
        BrowserModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        MatMenuModule,
        NgbModule,
        NzPaginationModule,
        NzButtonModule,
    ],
    declarations: [
        CommentStatsComponent,
        ContactSelectComponent,
        ContactSelectTableRowsComponent,
        DropdownTemplateComponent,
        FileUploadComponent,
        LinkOrganizationComponent,
        LinkOrganizationTableRowsComponent,
        ListConverterPipe,
        SafeHtmlPipe,
        NewlinesPipe,
        ObjectFilterPipe,
        OrderByPipe,
        OrgNamePipe,
        PublishedPipe,
        TableDirective,
        TableTemplateComponent,
        VarDirective,
        ExtensionComponent
    ],
    exports: [
        CommentStatsComponent,
        ContactSelectComponent,
        ContactSelectTableRowsComponent,
        DropdownTemplateComponent,
        FileUploadComponent,
        LinkOrganizationComponent,
        LinkOrganizationTableRowsComponent,
        ListConverterPipe,
        SafeHtmlPipe,
        MatSlideToggleModule,
        MatSnackBarModule,
        NewlinesPipe,
        OrderByPipe,
        OrgNamePipe,
        PublishedPipe,
        TableTemplateComponent,
        VarDirective,
    ],
    providers: [
        TableTemplateUtils,
        TableDocumentTemplateUtils,
        NavigationStackUtils,
        Utils,
        { provide: NZ_I18N, useValue: en_US }
    ]
})

export class SharedModule { }
