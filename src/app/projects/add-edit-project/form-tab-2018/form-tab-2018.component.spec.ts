import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { FormTab2018Component } from './form-tab-2018.component';
import { ConfigService } from 'src/app/services/config.service';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from 'src/app/shared/utils/navigation-stack-utils';
import { AjaxData, regionsData, eaDecisions } from 'src/app/shared/utils/mock-data';

describe('FormTab2018', () => {
  let fixture: ComponentFixture<FormTab2018Component>;

  beforeEach(async () => {
    const mockStorageService = { state: { currentProject: { data: AjaxData } } };
    await TestBed.configureTestingModule({
      imports: [FormTab2018Component],
      providers: [
        provideRouter([]),
        { provide: ConfigService, useValue: { regions: regionsData, getLists: () => eaDecisions, lists: [] } },
        { provide: StorageService, useValue: mockStorageService },
        { provide: ProjectService, useValue: jasmine.createSpyObj('ProjectService', ['add', 'save']) },
        { provide: ActivatedRoute, useValue: { parent: { data: of({ fullProject: AjaxData }) } } },
        { provide: NavigationStackUtils, useValue: jasmine.createSpyObj('NavigationStackUtils', ['state']) }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FormTab2018Component);
    fixture.detectChanges();
  });

  it('takes the published state from isPublished, as DEMI withholds read', () => {
    const row = { ...AjaxData[0].data.searchResults[0], read: undefined, currentLegislationYear: 'legislation_2018' };
    const resolved = (isPublished: boolean) => ({ fullProject: [{ data: { meta: [], searchResults: [{ ...row, isPublished }] } }] }) as any;

    fixture.componentInstance.initProject(resolved(true));
    expect(fixture.componentInstance.published).toBeTrue();
    fixture.componentInstance.initProject(resolved(false));
    expect(fixture.componentInstance.published).toBeFalse();
  });

  it('shows one note that the EPIC.track fields are managed there', () => {
    const notes: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('[role="note"]'));
    expect(notes.length).toBe(1);
    expect(notes[0].textContent).toContain('Managed in EPIC.track.');
    expect(notes[0].textContent).toContain('Changes made here are saved but not shown publicly.');
  });
});
