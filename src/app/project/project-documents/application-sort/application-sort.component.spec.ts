import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TableTemplateComponent } from 'app/shared/components/table-template/table-template.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { SearchService } from 'app/services/search.service';
import { DocumentService } from 'app/services/document.service';
import { ConfigService } from 'app/services/config.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Utils } from 'app/shared/utils/utils';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { AjaxData } from 'app/shared/utils/mock-data';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';

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
        NgZorroAntdModule,
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
