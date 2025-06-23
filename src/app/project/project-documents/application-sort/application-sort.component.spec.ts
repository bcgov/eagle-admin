import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ApiService } from 'src/app/services/api';
import { StorageService } from 'src/app/services/storage.service';
import { SearchService } from 'src/app/services/search.service';
import { DocumentService } from 'src/app/services/document.service';
import { ConfigService } from 'src/app/services/config.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Utils } from 'src/app/shared/utils/utils';
import { TableTemplateUtils } from 'src/app/shared/utils/table-template-utils';
import { AjaxData } from 'src/app/shared/utils/mock-data';
import { TableParamsObject } from 'src/app/shared/components/table-template/table-params-object';

import { DocumentApplicationSortComponent } from './application-sort.component';

describe('DocumentApplicationSortComponent', () => {
  let component: DocumentApplicationSortComponent;
  let fixture: ComponentFixture<DocumentApplicationSortComponent>;

  const mockApiService = jasmine.createSpyObj('ApiService', [
    'downloadDocument'
  ]);

  const mockStorageService = jasmine.createSpyObj('StorageService', [
    'state'
  ]);

  const mockSearchService = jasmine.createSpyObj('SearchService', [
    'res'
  ]);

  const mockDocumentService = jasmine.createSpyObj('DocumentService', [
    'res'
  ]);

  const mockConfigService = jasmine.createSpyObj('ConfigService', [
    'res'
  ]);

  const mockTableTemplateUtils = jasmine.createSpyObj('TableTemplateUtils', [
    'updateUrl',
    'updateTableParams',
    'getParamsFromUrl'
  ]);

  const utils = new Utils();

  mockStorageService.state.currentProject = {
    data: AjaxData
  };

  const defaultParams = new TableParamsObject();


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NzPaginationModule,
        MatSnackBarModule
      ],
      declarations: [
        DocumentApplicationSortComponent,
        TableTemplateComponent
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: DocumentService, useValue: mockDocumentService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: TableTemplateUtils, useValue: mockTableTemplateUtils },
        { provide: Utils, useValue: utils }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentApplicationSortComponent);
    component = fixture.componentInstance;
    mockTableTemplateUtils.getParamsFromUrl.and.returnValue(defaultParams);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
