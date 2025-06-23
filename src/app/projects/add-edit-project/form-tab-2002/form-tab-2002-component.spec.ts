import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormTab2002Component } from './form-tab-2002.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ApiService } from 'src/app/services/api';
import { StorageService } from 'src/app/services/storage.service';
import { Utils } from 'src/app/shared/utils/utils';
import { AjaxData, regionsData, eaDecisions } from 'src/app/shared/utils/mock-data';
import { ConfigService } from 'src/app/services/config.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { ProjectService } from 'src/app/services/project.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
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
    regions: regionsData,
    getLists: () => {
      return eaDecisions;
    },
    lists: []
  };

  const mockProjectService = jasmine.createSpyObj('ProjectService', [
      'unPublish',
      'Publish',
      'add',
      'save'
    ]);
  mockProjectService.unPublish.and.returnValue(of({}));
  mockProjectService.Publish.and.returnValue(of({}));
  mockProjectService.add.and.returnValue(of({}));
  mockProjectService.save.and.returnValue(of({}));

  const mockStorageService = jasmine.createSpyObj('StorageService', [
    'state'
  ]);

  const mockActivatedRoute = {
    parent: {
      data: of({ fullProject: AjaxData })
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
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: ConfigService, useValue: mockConfigService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: NgbActiveModal, useValue: {} },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: NavigationStackUtils, useValue: mockNavigationStackUtils },
        { provide: Utils, useValue: utils }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    // This calls ngoninit but has no data so proponent is not pre populated
    fixture = TestBed.createComponent(FormTab2002Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  it('form invalid when empty', () => {
    component.buildForm();
    expect(component.validateForm()).toBeFalsy();
  });
  /*
  /// Broken test
  /// This test will fail on certain seeds due to random order, which means
  /// the tests here are not isolatable. This test will need to be re-written
  /// but more likely, the underlying code is potentially breakable and should be fixed
  it('should display alert on empty EPD', () => {
    component.myForm = component.buildFormFromData(projectAjaxData);
    // Check to see that the alert box popped up
    spyOn(window, 'alert');
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('You must select an EPD');
  }); */
  it('should display alert on empty EA Decision', () => {
    // This test will not work because the EPD and lead are not being pre-populated. Need to add those in manually
    projectAjaxData.responsibleEPDObj = {
      _id: '5c33a481c99e4d002498eeee',
      displayName: 'Baraka Lwakila'
    };
    projectAjaxData.projectLeadObj = {
      _id: '5c33a481c99e4d002498eeee',
      displayName: 'Baraka Lwakila'
    };
    component.myForm = component.buildFormFromData(projectAjaxData);
    component.myForm.controls.eacDecision.setValue(null);
    // Check to see that the alert box popped up
    spyOn(window, 'alert');
    component.onSubmit();
    expect(window.alert).toHaveBeenCalledWith('You must select an EA Decision');
  });
  it('EA Decision dropdown should contain only 2002 legislative items', () => {
    expect(component.eacDecisions).not.toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({
          legislation: 2018
        })
      ])
    );
  });
  it('IAAC Involvement dropdown should contain only 2002 legislative items', async () => {
    expect(component.ceaaInvolvements).not.toEqual(
      jasmine.arrayContaining([
        jasmine.objectContaining({
          legislation: 2018
        })
      ])
    );
  });
});
