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
import { Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
describe('FormTab2002', () => {
  let component: FormTab2002Component;
  let fixture: ComponentFixture<FormTab2002Component>;
  const mockApiService = jasmine.createSpyObj('ApiService', [
    'downloadDocument'
  ]);
  const utils = new Utils();
  const projectAjaxData = utils.extractFromSearchResults(AjaxData)[0]['legislation_2002'];
  const mockConfigService = {
    getRegions: () => {
      return Observable.of(regionsData);
    },
    getLists: () => {
      return Observable.of(AjaxData);
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
        { provide: Utils, useValue: utils}
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    // This calls ngoninit but has no data so proponent is not pre populated
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
  it('should display alert on empty EPD', () => {
    component.myForm = component.buildFormFromData(projectAjaxData);
    // Check to see that the alert box popped up
    spyOn(window, 'alert');
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('You must select an EPD');
  });
  it('should display alert on empty EA Decision', () => {
    // This test will not work because the EPD and lead are not being pre-populated. Need to add those in manually
    projectAjaxData.eacDecision = null;
    projectAjaxData.responsibleEPDObj = {
      _id: '5c33a481c99e4d002498eeee',
      displayName: 'Baraka Lwakila'
    };
    projectAjaxData.projectLeadObj = {
      _id: '5c33a481c99e4d002498eeee',
      displayName: 'Baraka Lwakila'
    };
    component.myForm = component.buildFormFromData(projectAjaxData);
    // Check to see that the alert box popped up
    spyOn(window, 'alert');
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('You must select an EA Decision');
  });
});
