import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormTab2002Component } from './form-tab-2002.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatSnackBarModule } from '@angular/material';
import { ApiService } from 'app/services/api';
import { StorageService } from 'app/services/storage.service';
import { Utils } from 'app/shared/utils/utils';
import { AjaxData, regionsData } from 'app/shared/utils/mock-data';
import { ConfigService } from 'app/services/config.service';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';
import { ProjectService } from 'app/services/project.service';
import { DialogService } from 'ng2-bootstrap-modal';
import { Observable } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
describe('FormTab2002', () => {
  let component: FormTab2002Component;
  let fixture: ComponentFixture<FormTab2002Component>;
  const mockApiService = jasmine.createSpyObj('ApiService', [
    'downloadDocument'
  ]);
  const utils = new Utils();
  const projectAjaxData = utils.extractFromSearchResults(AjaxData.fullProject)['legislation_2002'];
  // Null out the eacDecision for testing
  console.log(projectAjaxData);
  // projectAjaxData.eacDecision = '';
  const mockConfigService = {
    getRegions: () => {
      return { takeUntil: () => {
        return {
          subscribe: () => regionsData};
      }};
    },
    getLists: () => {
      return { subscribe: () => AjaxData};
    },
  };

  const mockProjectService = jasmine.createSpyObj('ProjectService', [
    'unPublish',
    'Publish',
    'add',
    'save'
  ]);

  const mockStorageService = jasmine.createSpyObj('StorageService', [
    'state'
  ]);
  const mockDialogService = jasmine.createSpyObj('DialogService', [
    'addDialog'
  ]);
  const mockActivatedRoute = {
    parent: {
      data: Observable.of({fullProject: AjaxData})
    }
  };
  const mockNavigationStackUtils = jasmine.createSpyObj('NavigationStackUtils', [
    'state'
  ]);

  mockStorageService.state.currentProject = {
    data: AjaxData
  };

  const mockUtils = jasmine.createSpyObj('Utils', [
    'convertJSDateToNGBDate',
    'convertFormGroupNGBDateToJSDate'
  ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        FormTab2002Component,
      ],
      imports: [
        MatSnackBarModule,
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        NgxPaginationModule,
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService},
        { provide: ConfigService, useValue: mockConfigService},
        { provide: StorageService, useValue: mockStorageService},
        { provide: ProjectService, useValue: mockProjectService},
        { provide: DialogService, useValue: mockDialogService},
        { provide: ActivatedRoute, useValue: mockActivatedRoute},
        { provide: NavigationStackUtils, useValue: mockNavigationStackUtils},
        { provide: Utils, useValue: mockUtils}
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(FormTab2002Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('form invalid when empty', () => {
    component.buildForm();
    expect(component.validateForm()).toBeFalsy();
  });
  it('should display alert on empty EA Decision', () => {
    // Getting region of undefined :(
    const form = component.buildFormFromData(projectAjaxData);
    expect(component.validateForm()).toBeFalsy();
  });
});
