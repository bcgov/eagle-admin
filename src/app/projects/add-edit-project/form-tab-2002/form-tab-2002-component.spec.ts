import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormTab2002Component } from './form-tab-2002.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { of } from 'rxjs';
import { ApiService } from 'src/app/services/api';
import { StorageService } from 'src/app/services/storage.service';
import { ConfigService } from 'src/app/services/config.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { ProjectService } from 'src/app/services/project.service';
import { extractFromSearchResults } from 'src/app/shared/utils/utils';
import { AjaxData, regionsData } from 'src/app/shared/utils/mock-data';

const LIST_ROWS = [
  { type: 'eaDecisions', id: 'ea-issued', name: 'Certificate Issued', legislation: 2002, listOrder: 2 },
  { type: 'eaDecisions', id: 'ea-refused', name: 'Certificate Refused', legislation: 2002, listOrder: 1 },
  { type: 'eaDecisions', id: 'ea-progress', name: 'In Progress', legislation: 2018, listOrder: 0 },
  { type: 'ceaaInvolvements', id: 'ceaa-screening', name: 'Screening', legislation: 2002, listOrder: 1 },
  { type: 'ceaaInvolvements', id: 'ceaa-panel', name: 'Panel Review', legislation: 2018, listOrder: 0 },
];

function projectResults(row: object) {
  return [{ ...AjaxData[0], data: { ...AjaxData[0].data, searchResults: [row] } }];
}

describe('FormTab2002', () => {
  async function render(fullProject: unknown = AjaxData): Promise<ComponentFixture<FormTab2002Component>> {
    const projectService = jasmine.createSpyObj('ProjectService', ['unPublish', 'Publish', 'add', 'save']);
    projectService.add.and.returnValue(of({}));
    projectService.save.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [FormTab2002Component],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: jasmine.createSpyObj('ApiService', ['downloadDocument']) },
        { provide: ConfigService, useValue: jasmine.createSpyObj('ConfigService', [], { regions: regionsData, lists: LIST_ROWS }) },
        { provide: StorageService, useValue: jasmine.createSpyObj('StorageService', [], { state: { currentProject: { data: AjaxData } } }) },
        { provide: ProjectService, useValue: projectService },
        { provide: NgbActiveModal, useValue: {} },
        { provide: ActivatedRoute, useValue: { parent: { data: of({ fullProject }) } } },
        { provide: NavigationStackUtils, useValue: jasmine.createSpyObj('NavigationStackUtils', ['getNavigationStack']) },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

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
    spyOn(window, 'alert');

    component.buildForm();

    expect(component.validateForm()).toBeFalsy();
  });

  it('should display alert on empty EA Decision', async () => {
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
    spyOn(window, 'alert');

    component.onSubmit();

    expect(window.alert).toHaveBeenCalledWith('You must select an EA Decision');
  });

  it('offers only 2002 EA Decisions, in list order', async () => {
    const fixture = await render();

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
});
