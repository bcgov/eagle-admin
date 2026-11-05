import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, of, throwError } from 'rxjs';
import { FormTab2018Component } from './form-tab-2018.component';
import { ConfigService } from 'src/app/services/config.service';
import { ProjectCreatedPartlyError, ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { AjaxData } from 'src/app/shared/utils/mock-data';
import { List } from 'src/app/models/demi/list';
import { ProjectPublishState } from 'src/app/models/project';
import { CREATE_UNKNOWN_MESSAGE } from '../edit-tabs';

const ROUTE_ID = 'demi-7';
const contact = { _id: 'user-1', displayName: 'Test Contact' };
const ajaxRow = AjaxData[0].data.searchResults[0];
const DEMI_ROW = { id: '7', name: 'Ajax Mine' };

// A 2018 project with no Eagle id, filled in enough to pass validateForm.
function row2018(block: object = {}) {
  return {
    ...ajaxRow,
    _id: null,
    demiRow: DEMI_ROW,
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

const PHASES: List[] = [
  { id: 'phase-0', name: 'Early Engagement', type: 'projectPhase', legislation: 2018, listOrder: 0 },
  { id: 'phase-1', name: 'Readiness Decision', type: 'projectPhase', legislation: 2018, listOrder: 1 }
];

const results = (row: object) => [{ data: { meta: [], searchResults: [row] } }];
// fullProjectResolver's answer when it cannot read the project.
const NO_PROJECT = [{ data: { meta: [], searchResults: [] } }];

describe('FormTab2018', () => {
  let fixture: ComponentFixture<FormTab2018Component>;
  let projectService: jasmine.SpyObj<ProjectService>;
  let toast: jasmine.SpyObj<ToastService>;
  let logger: jasmine.SpyObj<LoggingService>;
  let navigate: jasmine.Spy;
  let lists: ReturnType<typeof signal<List[]>>;

  // The add route has no projId and no resolved project.
  function render(fullProject: unknown = AjaxData, { adding = false } = {}) {
    projectService = jasmine.createSpyObj('ProjectService', ['add', 'save', 'publish', 'unPublish']);
    projectService.save.and.returnValue(of({} as any));
    toast = jasmine.createSpyObj('ToastService', ['error', 'success']);
    logger = jasmine.createSpyObj('LoggingService', ['error']);
    lists = signal<List[]>([]);
    TestBed.configureTestingModule({
      imports: [FormTab2018Component],
      providers: [
        provideRouter([]),
        { provide: ConfigService, useValue: { listsSignal: lists } },
        { provide: StorageService, useValue: { state: { pageIsEditing: !adding } } },
        { provide: ProjectService, useValue: projectService },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: logger },
        { provide: NgbModal, useValue: { open: () => ({ componentInstance: {}, result: Promise.resolve(true) }) } },
        {
          provide: ActivatedRoute,
          useValue: { parent: { data: of({ fullProject }), snapshot: { paramMap: convertToParamMap(adding ? {} : { projId: ROUTE_ID }) } } }
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
    render(results(row2018())).onSubmit();

    expect(toast.error).not.toHaveBeenCalled();
    expect(projectService.save).toHaveBeenCalledOnceWith(jasmine.objectContaining({ _id: ROUTE_ID, legislationYear: 2018 }), jasmine.arrayContaining(['eaStatusDate', 'dispute']), DEMI_ROW);
    expect(navigate).toHaveBeenCalledWith(['/p', ROUTE_ID, 'project-details']);
  });

  it('save on another Act\'s tab toasts and sends nothing', () => {
    render(results({ ...row2018(), currentLegislationYear: 'legislation_2002' })).onSubmit();

    expect(toast.error).toHaveBeenCalledWith('Only the current Act\'s fields can be changed here');
    expect(projectService.save).not.toHaveBeenCalled();
  });

  it('publish on another Act\'s tab toasts and sends nothing', async () => {
    render(results({ ...row2018(), currentLegislationYear: 'legislation_2002' })).onPublish();
    await fixture.whenStable();

    expect(toast.error).toHaveBeenCalledWith('Only the current Act\'s fields can be changed here');
    expect(projectService.save).not.toHaveBeenCalled();
    expect(projectService.publish).not.toHaveBeenCalled();
  });

  describe('on the add route', () => {
    const MINTED = '0b5e6c1a-3f0e-4a8e-9c35-7d2f1e9a4b10';

    function renderAdd() {
      const component = render(null, { adding: true });
      component.myForm = component.buildFormFromData({ ...row2018().legislation_2018 });
      component.proponentId = 'org-1';
      fixture.detectChanges();
      return component;
    }

    const saveButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button[type="submit"]');
    const publishButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('button.btn-publish');

    it('starts on the first phase once the Lists arrive, and creates the project with it', () => {
      const component = render(null, { adding: true });
      lists.set(PHASES);
      fixture.detectChanges();
      const filled = component.buildFormFromData({ ...row2018().legislation_2018 }).getRawValue();
      component.myForm.patchValue({ ...filled, currentPhaseName: component.myForm.controls.currentPhaseName.value });
      component.proponentId = 'org-1';
      projectService.add.and.returnValue(of({ _id: null, demiId: MINTED } as any));

      component.onSubmit();

      const select: HTMLSelectElement = fixture.nativeElement.querySelector('#currentPhaseName');
      expect(select.options[select.selectedIndex]?.textContent.trim()).toBe('Early Engagement');
      expect(projectService.add).toHaveBeenCalledOnceWith(jasmine.objectContaining({ currentPhaseName: 'phase-0' }), { publish: false });
    });

    it('save creates the project and opens it by the id DEMI returns', () => {
      const component = renderAdd();
      projectService.add.and.returnValue(of({ _id: null, demiId: MINTED } as any));

      component.onSubmit();

      expect(projectService.add).toHaveBeenCalledOnceWith(jasmine.objectContaining({ legislationYear: 2018 }), { publish: false });
      expect(toast.error).not.toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(['/p', MINTED, 'project-details']);
    });

    it('save and publish creates and publishes in one call', async () => {
      const component = renderAdd();
      projectService.add.and.returnValue(of({ _id: null, demiId: MINTED } as any));

      component.onPublish();
      await fixture.whenStable();

      expect(projectService.add).toHaveBeenCalledOnceWith(jasmine.anything(), { publish: true });
      expect(projectService.publish).not.toHaveBeenCalled();
      expect(navigate).toHaveBeenCalledWith(['/p', MINTED, 'project-details']);
      expect(TestBed.inject(StorageService).state['projectPublishState_' + MINTED]).toBe(ProjectPublishState.published2018);
    });

    it('Save & Publish stays disabled in flight, and a second confirm does not create twice', async () => {
      const component = renderAdd();
      projectService.add.and.returnValue(new Subject<any>());

      component.onPublish();
      component.onPublish();
      await fixture.whenStable();
      fixture.detectChanges();

      expect(publishButton().disabled).toBeTrue();
      expect(projectService.add).toHaveBeenCalledTimes(1);
    });

    it('Save stays disabled while the create is in flight, and a refused create toasts, logs and enables it again', () => {
      const component = renderAdd();
      const answer = new Subject<any>();
      projectService.add.and.returnValue(answer);

      component.onSubmit();
      component.onSubmit();
      fixture.detectChanges();
      expect(saveButton().disabled).toBeTrue();
      expect(projectService.add).toHaveBeenCalledTimes(1);

      const error = new Error('Missing required fields: name, centroid');
      answer.error(error);
      fixture.detectChanges();

      expect(toast.error).toHaveBeenCalledWith(`Failed to save project. ${error.message}`);
      expect(logger.error).toHaveBeenCalledWith('Failed to save project', 'FormTab2018Component', error);
      expect(saveButton().disabled).toBeFalse();
      expect(navigate).not.toHaveBeenCalled();
    });

    it('a failed PUT after create toasts and opens the edit page', () => {
      const component = renderAdd();
      const error = new ProjectCreatedPartlyError(MINTED, 'Project created, but not every field was saved', new Error('Unknown field: foo.'), false);
      projectService.add.and.returnValue(throwError(() => error));

      component.onSubmit();
      fixture.detectChanges();

      expect(toast.error).toHaveBeenCalledWith(
        'Project created, but not every field was saved: Unknown field: foo. Enter the remaining fields again on the edit page.'
      );
      expect(logger.error).toHaveBeenCalledWith('Project created partly', 'FormTab2018Component', error);
      expect(navigate).toHaveBeenCalledWith(['/p', MINTED, 'edit']);
      expect(saveButton().disabled).toBeTrue();
    });

    it('a failed publish after the fields were saved toasts DEMI\'s message alone', () => {
      const component = renderAdd();
      const error = new ProjectCreatedPartlyError(MINTED, 'Project created and saved, but not published', new Error('Forbidden'), true);
      projectService.add.and.returnValue(throwError(() => error));

      component.onPublish();

      return fixture.whenStable().then(() => {
        expect(toast.error).toHaveBeenCalledOnceWith('Project created and saved, but not published: Forbidden');
        expect(navigate).toHaveBeenCalledWith(['/p', MINTED, 'edit']);
      });
    });

    for (const status of [0, 500]) {
      it(`a create answered with status ${status} says the project may exist and keeps Save disabled`, () => {
        const component = renderAdd();
        const error = Object.assign(new Error('Server error'), { status });
        projectService.add.and.returnValue(throwError(() => error));

        component.onSubmit();
        fixture.detectChanges();

        expect(toast.error).toHaveBeenCalledOnceWith(CREATE_UNKNOWN_MESSAGE);
        expect(logger.error).toHaveBeenCalledWith('Project create may have gone through', 'FormTab2018Component', error);
        expect(saveButton().disabled).toBeTrue();
        expect(navigate).not.toHaveBeenCalled();
      });
    }
  });

  it('link-contact on an edit route with no loaded project toasts and does not navigate', () => {
    render(NO_PROJECT).linkContact('epd');

    expect(toast.error).toHaveBeenCalledWith('This project could not be loaded for edit, so nothing was saved.');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('save on an edit route with no loaded project sends neither add nor save', () => {
    render(NO_PROJECT).onSubmit();

    expect(toast.error).toHaveBeenCalledWith('This project could not be loaded for edit, so nothing was saved.');
    expect(projectService.add).not.toHaveBeenCalled();
    expect(projectService.save).not.toHaveBeenCalled();
  });

  it('save failure toasts the error text and logs', () => {
    const component = render(results(row2018()));
    const error = new Error('Changes on the 2018 tab cannot be saved: this project is under the 2002 Act.');
    projectService.save.and.returnValue(throwError(() => error));

    component.onSubmit();

    expect(toast.error).toHaveBeenCalledWith(`Failed to save project. ${error.message}`);
    expect(logger.error).toHaveBeenCalledWith('Failed to save project', 'FormTab2018Component', error);
  });

  it('publish failure toasts the error text', async () => {
    const component = render(results(row2018()));
    projectService.publish.and.returnValue(throwError(() => new Error('Forbidden: not a project admin')));

    component.onPublish();
    await fixture.whenStable();

    expect(toast.error).toHaveBeenCalledWith('Failed to publish project. Forbidden: not a project admin');
  });

  it('unpublish failure toasts DEMI\'s 403 text', async () => {
    const component = render(results(row2018()));
    projectService.unPublish.and.returnValue(throwError(() => new Error('Forbidden: not a project admin')));

    component.onUnpublish();
    await fixture.whenStable();

    expect(toast.error).toHaveBeenCalledWith('Failed to unpublish project. Forbidden: not a project admin');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('projectId, unpublish and link-contact use the route id, not the Eagle id', async () => {
    const component = render(results(row2018()));
    projectService.unPublish.and.returnValue(of({} as any));

    component.onUnpublish();
    await fixture.whenStable();
    component.linkContact('epd');

    expect(projectService.unPublish).toHaveBeenCalledWith({ _id: ROUTE_ID });
    expect(navigate).toHaveBeenCalledWith(['/p', ROUTE_ID, 'edit', 'form-2018', 'link-contact', { pageSize: 25 }]);
  });

  it('fills the pickers when the Lists arrive after the form, and keeps the row\'s picks', () => {
    const component = render(results(row2018({ region: 'Peace', eacDecision: { _id: 'dec-1' } })));

    lists.set([
      ...PHASES,
      { id: 'dec-1', name: 'In Progress', type: 'eaDecisions', legislation: 2018, listOrder: 0 },
      { id: 'region-1', name: 'Peace', type: 'region', legislation: 0, listOrder: 0 }
    ]);
    fixture.detectChanges();

    const shown = (selector: string) => {
      const select: HTMLSelectElement = fixture.nativeElement.querySelector(selector);
      return select.options[select.selectedIndex]?.textContent.trim();
    };
    expect(shown('#currentPhaseName')).toBe('Readiness Decision');
    expect(shown('select[formControlName="region"]')).toBe('Peace');
    expect(shown('#eacDecision')).toBe('In Progress');
    expect(component.myForm.getRawValue()).toEqual(jasmine.objectContaining({ currentPhaseName: 'phase-1', region: 'Peace', eacDecision: 'dec-1' }));
  });

  it('refuses a save on a row whose phase has no id until one is picked', () => {
    const component = render(results(row2018({ currentPhaseName: { name: 'Unknown' } })));

    component.onSubmit();
    expect(toast.error).toHaveBeenCalledWith('You must select a project phase.');
    expect(projectService.save).not.toHaveBeenCalled();

    component.myForm.controls.currentPhaseName.setValue('phase-1');
    component.onSubmit();
    expect(projectService.save).toHaveBeenCalledTimes(1);
  });

  it('a project with no intake builds the edit form', () => {
    const component = render(results(row2018({ intake: undefined })));

    expect(component.myForm.controls.name.value).toBe('Ajax Mine');
  });

  it('a Track type with a spaced hyphen selects its picker entry and that entry\'s sub-types', () => {
    const component = render(results(row2018({ type: 'Energy - Petroleum & Natural Gas' })));

    expect(component.myForm.controls.type.value).toBe('Energy-Petroleum & Natural Gas');
    expect(component.sectorsSelected).toContain('Natural Gas Processing Plants');
  });
});
