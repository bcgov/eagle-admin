import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { FormTab2018Component } from './form-tab-2018.component';
import { ConfigService } from 'src/app/services/config.service';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { AjaxData, regionsData, eaDecisions } from 'src/app/shared/utils/mock-data';

const ROUTE_ID = 'demi-7';
const contact = { _id: 'user-1', displayName: 'Test Contact' };
const ajaxRow = AjaxData[0].data.searchResults[0];

// A 2018 project with no Eagle id, filled in enough to pass validateForm.
function row2018(block: object = {}) {
  return {
    ...ajaxRow,
    _id: null,
    currentLegislationYear: 'legislation_2018',
    legislation_2018: {
      ...ajaxRow['legislation_2018'],
      currentPhaseName: { _id: 'phase-1' },
      responsibleEPDObj: contact,
      projectLeadObj: contact,
      ...block
    }
  };
}

const results = (row: object) => [{ data: { meta: [], searchResults: [row] } }];

describe('FormTab2018', () => {
  let fixture: ComponentFixture<FormTab2018Component>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let toast: jasmine.SpyObj<ToastService>;
  let navigate: jasmine.Spy;

  function render(fullProject: unknown = AjaxData) {
    projectService = jasmine.createSpyObj('ProjectService', ['add', 'save', 'publish', 'unPublish']);
    projectService.save.and.returnValue(of({} as any));
    toast = jasmine.createSpyObj('ToastService', ['error', 'success']);
    TestBed.configureTestingModule({
      imports: [FormTab2018Component],
      providers: [
        provideRouter([]),
        { provide: ConfigService, useValue: { regions: regionsData, getLists: () => eaDecisions, lists: [] } },
        { provide: StorageService, useValue: { state: { pageIsEditing: true } } },
        { provide: ProjectService, useValue: projectService },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error']) },
        { provide: NgbModal, useValue: { open: () => ({ componentInstance: {}, result: Promise.resolve(true) }) } },
        {
          provide: ActivatedRoute,
          useValue: { parent: { data: of({ fullProject }) }, snapshot: { paramMap: convertToParamMap({ projId: ROUTE_ID }) } }
        },
        { provide: NavigationStackUtils, useValue: jasmine.createSpyObj('NavigationStackUtils', ['pushNavigationStack']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    fixture = TestBed.createComponent(FormTab2018Component);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('takes the published state from isPublished, as DEMI withholds read', () => {
    const component = render();
    const row = { ...ajaxRow, read: undefined, currentLegislationYear: 'legislation_2018' };
    const resolved = (isPublished: boolean) => ({ fullProject: results({ ...row, isPublished }) }) as any;

    component.initProject(resolved(true));
    expect(component.published).toBeTrue();
    component.initProject(resolved(false));
    expect(component.published).toBeFalse();
  });

  it('shows one note that the EPIC.track fields are managed there', () => {
    render();
    const notes: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="note"]'));
    expect(notes.length).toBe(1);
    expect(notes[0].textContent).toContain('Managed in EPIC.track.');
    expect(notes[0].textContent).toContain('Changes made here are saved but not shown publicly.');
  });

  it('save on the current Act PUTs through ProjectService.save', () => {
    spyOn(window, 'alert');
    render(results(row2018())).onSubmit();

    expect(window.alert).not.toHaveBeenCalled();
    expect(projectService.save).toHaveBeenCalledOnceWith(jasmine.objectContaining({ _id: ROUTE_ID, legislationYear: 2018 }));
    expect(navigate).toHaveBeenCalledWith(['/p', ROUTE_ID, 'project-details']);
  });

  it('save on another Act\'s tab toasts and sends nothing', () => {
    const component = render(results({ ...row2018(), currentLegislationYear: 'legislation_2002' }));

    component.onSubmit();
    component.onPublish();

    expect(toast.error).toHaveBeenCalledWith('Only the current Act\'s fields can be changed here');
    expect(projectService.save).not.toHaveBeenCalled();
    expect(projectService.publish).not.toHaveBeenCalled();
  });

  it('save failure toasts DEMI\'s refusal', () => {
    spyOn(window, 'alert');
    const component = render(results(row2018()));
    projectService.save.and.returnValue(throwError(() => new Error('Changes on the 2018 tab cannot be saved: this project is under the 2002 Act.')));

    component.onSubmit();

    expect(toast.error).toHaveBeenCalledWith('Failed to save project. Changes on the 2018 tab cannot be saved: this project is under the 2002 Act.');
  });

  it('unpublish failure toasts DEMI\'s 403 text', async () => {
    const component = render(results(row2018()));
    projectService.unPublish.and.returnValue(throwError(() => new Error('Forbidden: not a project admin')));

    component.onUnpublish();
    await Promise.resolve();

    expect(toast.error).toHaveBeenCalledWith('Failed to unpublish project. Forbidden: not a project admin');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('projectId, unpublish and link-contact use the route id, not fullProject._id', async () => {
    const component = render(results(row2018()));
    projectService.unPublish.and.returnValue(of({} as any));

    component.onUnpublish();
    await Promise.resolve();
    component.linkContact('epd');

    expect(component.projectId).toBe(ROUTE_ID);
    expect(projectService.unPublish).toHaveBeenCalledWith({ _id: ROUTE_ID });
    expect(navigate).toHaveBeenCalledWith(['/p', ROUTE_ID, 'edit', 'form-2018', 'link-contact', { pageSize: 25 }]);
  });

  it('a project with no intake builds the edit form', () => {
    const component = render(results(row2018({ intake: undefined })));

    expect(component.myForm.controls.name.value).toBe('Ajax Mine');
  });
});
