import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormTab2002Component } from './form-tab-2002.component';
import { NO_ERRORS_SCHEMA, signal } from '@angular/core';
import { provideRouter, ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { of, throwError } from 'rxjs';
import { ApiService } from 'src/app/services/api';
import { StorageService } from 'src/app/services/storage.service';
import { ConfigService } from 'src/app/services/config.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { ProjectService } from 'src/app/services/project.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';
import { extractFromSearchResults } from 'src/app/shared/utils/utils';
import { AjaxData } from 'src/app/shared/utils/mock-data';
import { List } from 'src/app/models/demi/list';

const LIST_ROWS: List[] = [
  { type: 'eaDecisions', id: 'ea-issued', name: 'Certificate Issued', legislation: 2002, listOrder: 2 },
  { type: 'eaDecisions', id: 'ea-refused', name: 'Certificate Refused', legislation: 2002, listOrder: 1 },
  { type: 'eaDecisions', id: 'ea-progress', name: 'In Progress', legislation: 2018, listOrder: 0 },
  { type: 'ceaaInvolvements', id: 'ceaa-screening', name: 'Screening', legislation: 2002, listOrder: 1 },
  { type: 'ceaaInvolvements', id: 'ceaa-panel', name: 'Panel Review', legislation: 2018, listOrder: 0 },
];

const ROUTE_ID = 'demi-7';
const contact = { _id: 'user-1', displayName: 'Test Contact' };
const ajaxRow = AjaxData[0].data.searchResults[0];

function projectResults(row: object) {
  return [{ ...AjaxData[0], data: { ...AjaxData[0].data, searchResults: [row] } }];
}

// A 2002 project with no Eagle id, filled in enough to pass validateForm.
function row2002(block: object = {}, overrides: object = {}) {
  return {
    ...ajaxRow,
    _id: null,
    legislation_2002: { ...ajaxRow['legislation_2002'], responsibleEPDObj: contact, projectLeadObj: contact, ...block },
    ...overrides
  };
}

describe('FormTab2002', () => {
  let projectService: jasmine.SpyObj<ProjectService>;
  let toast: jasmine.SpyObj<ToastService>;
  let navigate: jasmine.Spy;
  let lists: ReturnType<typeof signal<List[]>>;

  async function render(fullProject: unknown = AjaxData, listRows: List[] = LIST_ROWS): Promise<ComponentFixture<FormTab2002Component>> {
    lists = signal(listRows);
    projectService = jasmine.createSpyObj('ProjectService', ['unPublish', 'publish', 'save']);
    projectService.save.and.returnValue(of({} as any));
    toast = jasmine.createSpyObj('ToastService', ['error', 'success']);

    await TestBed.configureTestingModule({
      imports: [FormTab2002Component],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: jasmine.createSpyObj('ApiService', ['downloadDocument']) },
        { provide: ConfigService, useValue: { listsSignal: lists } },
        { provide: StorageService, useValue: jasmine.createSpyObj('StorageService', [], { state: { pageIsEditing: true } }) },
        { provide: ProjectService, useValue: projectService },
        { provide: ToastService, useValue: toast },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['error']) },
        { provide: NgbActiveModal, useValue: {} },
        { provide: NgbModal, useValue: { open: () => ({ componentInstance: {}, result: Promise.resolve(true) }) } },
        {
          provide: ActivatedRoute,
          useValue: { parent: { data: of({ fullProject }), snapshot: { paramMap: convertToParamMap({ projId: ROUTE_ID }) } } }
        },
        { provide: NavigationStackUtils, useValue: jasmine.createSpyObj('NavigationStackUtils', ['pushNavigationStack', 'popNavigationStack']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
    navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);

    const fixture = TestBed.createComponent(FormTab2002Component);
    fixture.detectChanges();
    return fixture;
  }

  function optionNames(fixture: ComponentFixture<FormTab2002Component>, selectId: string): string[] {
    const options = fixture.nativeElement.querySelectorAll(`#${selectId} option:not([value=""])`);
    return Array.from<HTMLElement>(options).map(o => o.textContent.trim());
  }

  it('shows one note that the EPIC.track fields are managed there', async () => {
    const fixture = await render();

    const notes: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="note"]'));
    expect(notes.length).toBe(1);
    expect(notes[0].textContent).toContain('Managed in EPIC.track.');
    expect(notes[0].textContent).toContain('Changes made here are saved but not shown publicly.');
  });

  it('takes the published state from isPublished, as DEMI withholds read', async () => {
    const component = (await render()).componentInstance;
    const row = { ...AjaxData[0].data.searchResults[0], read: undefined };
    const resolved = (isPublished: boolean) => ({ fullProject: [{ data: { meta: [], searchResults: [{ ...row, isPublished }] } }] }) as any;

    component.initProject(resolved(true));
    expect(component.published).toBeTrue();
    component.initProject(resolved(false));
    expect(component.published).toBeFalse();
  });

  it('form invalid when empty', async () => {
    const component = (await render()).componentInstance;

    component.buildForm();

    expect(component.validateForm()).toBeFalsy();
    expect(toast.error).toHaveBeenCalled();
  });

  it('toasts on an empty EA Decision', async () => {
    const component = (await render()).componentInstance;
    // validateForm checks EPD and lead before the EA Decision.
    const contact = { _id: '5c33a481c99e4d002498eeee', displayName: 'Test Contact' };
    const project = {
      ...extractFromSearchResults(AjaxData)[0]['legislation_2002'],
      responsibleEPDObj: contact,
      projectLeadObj: contact,
    };
    component.myForm = component.buildFormFromData(project);
    component.myForm.controls.eacDecision.setValue(null);

    component.onSubmit();

    expect(toast.error).toHaveBeenCalledWith('You must select an EA Decision');
  });

  it('offers only 2002 EA Decisions, in list order', async () => {
    const fixture = await render();

    expect(optionNames(fixture, 'eacDecision')).toEqual(['Certificate Refused', 'Certificate Issued']);
  });

  it('offers the EA Decisions when the Lists arrive after the form', async () => {
    const fixture = await render(AjaxData, []);

    lists.set(LIST_ROWS);
    fixture.detectChanges();

    expect(optionNames(fixture, 'eacDecision')).toEqual(['Certificate Refused', 'Certificate Issued']);
  });

  it('offers only 2002 IAAC Involvements', async () => {
    const fixture = await render();

    expect(optionNames(fixture, 'CEAAInvolvement')).toEqual(['Screening']);
  });

  it('offers the 2002 EA Decisions on a 1996 project', async () => {
    const row = { ...AjaxData[0].data.searchResults[0], legislation_2002: {} };

    const fixture = await render(projectResults(row));

    expect(fixture.componentInstance.legislationYear).toBe(1996);
    expect(optionNames(fixture, 'eacDecision')).toEqual(['Certificate Refused', 'Certificate Issued']);
  });

  it('save on the current Act PUTs through ProjectService.save', async () => {
    const component = (await render(projectResults(row2002()))).componentInstance;

    component.onSubmit();

    expect(toast.error).not.toHaveBeenCalled();
    expect(projectService.save).toHaveBeenCalledOnceWith(jasmine.objectContaining({ _id: ROUTE_ID, legislationYear: 2002 }), jasmine.any(Array));
    // The 2002 form shows none of these, so its save must not clear them.
    const held = projectService.save.calls.mostRecent().args[1];
    expect(held).toContain('name');
    expect(held).not.toContain('eaStatusDate');
    expect(held).not.toContain('substantiallyDate');
    expect(held).not.toContain('dispute');
    expect(held).not.toContain('disputeDate');
  });

  it('save on another Act\'s tab toasts and sends nothing', async () => {
    (await render(projectResults(row2002({}, { currentLegislationYear: 'legislation_2018' })))).componentInstance.onSubmit();

    expect(toast.error).toHaveBeenCalledWith('Only the current Act\'s fields can be changed here');
    expect(projectService.save).not.toHaveBeenCalled();
  });

  it('publish on another Act\'s tab toasts and sends nothing', async () => {
    const fixture = await render(projectResults(row2002({}, { currentLegislationYear: 'legislation_2018' })));

    fixture.componentInstance.onPublish();
    await fixture.whenStable();

    expect(toast.error).toHaveBeenCalledWith('Only the current Act\'s fields can be changed here');
    expect(projectService.save).not.toHaveBeenCalled();
    expect(projectService.publish).not.toHaveBeenCalled();
  });

  it('save on an edit route with no loaded project sends no save', async () => {
    // fullProjectResolver's answer when it cannot read the project.
    (await render([{ data: { meta: [], searchResults: [] } }])).componentInstance.onSubmit();

    expect(toast.error).toHaveBeenCalledWith('This project could not be loaded for edit, so nothing was saved.');
    expect(projectService.save).not.toHaveBeenCalled();
  });

  it('unpublish failure toasts DEMI\'s 403 text', async () => {
    const fixture = await render(projectResults(row2002()));
    projectService.unPublish.and.returnValue(throwError(() => new Error('Forbidden: not a project admin')));

    fixture.componentInstance.onUnpublish();
    await fixture.whenStable();

    expect(toast.error).toHaveBeenCalledWith('Failed to unpublish project. Forbidden: not a project admin');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('projectId, unpublish and link-contact use the route id, not the Eagle id', async () => {
    const fixture = await render(projectResults(row2002()));
    projectService.unPublish.and.returnValue(of({} as any));

    fixture.componentInstance.onUnpublish();
    await fixture.whenStable();
    fixture.componentInstance.linkContact('epd');

    expect(projectService.unPublish).toHaveBeenCalledWith({ _id: ROUTE_ID });
    expect(navigate).toHaveBeenCalledWith(['/p', ROUTE_ID, 'edit', 'form-2002', 'link-contact', { pageSize: 25 }]);
  });

  it('a project with no intake builds the edit form', async () => {
    const component = (await render(projectResults(row2002({ intake: undefined })))).componentInstance;

    expect(component.myForm.controls.name.value).toBe(ajaxRow['legislation_2002'].name);
  });
});
