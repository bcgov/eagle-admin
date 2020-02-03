import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { Router } from '@angular/router';

import { AjaxDefaultData } from 'app/shared/utils/mock-data';
import { ProjectListTableRowsComponent } from './project-list-table-rows.component';
import { TableObject } from 'app/shared/components/table-template/table-object';


describe('ProjectListTableRowsComponent', () => {
  let component: ProjectListTableRowsComponent;
  let fixture: ComponentFixture<ProjectListTableRowsComponent>;

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

  const paginationData = {
    'currentPage': 1,
    'filter': {},
    'keywords': '',
    'pageSize': 10,
    'sortBy': '+name',
    'totalListItems': 1
  };
  let projectList = [];

  projectList.push({
    _id: AjaxDefaultData._id,
    name: AjaxDefaultData.name,
    proponent: AjaxDefaultData.proponent,
    type: AjaxDefaultData.type,
    region: AjaxDefaultData.region,
    currentPhaseName: AjaxDefaultData.currentPhaseName,
    eacDecision: AjaxDefaultData.eacDecision
  });
  const tableData = new TableObject(ProjectListTableRowsComponent, projectList, paginationData);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProjectListTableRowsComponent
      ],
      imports: [
        NgxPaginationModule,
      ],
      providers: [
        { provide: Router, useValue: routerSpy }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectListTableRowsComponent);
    component = fixture.componentInstance;
    component.data = tableData;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('table displays project text values', () => {
    let name = fixture.nativeElement.querySelector('[data-label=Name]');
    let proponent = fixture.nativeElement.querySelector('[data-label=Proponent]');
    let projType = fixture.nativeElement.querySelector('[data-label=Type]');
    let region = fixture.nativeElement.querySelector('[data-label=Region]');
    let phase = fixture.nativeElement.querySelector('[data-label=Phase]');
    let decision = fixture.nativeElement.querySelector('[data-label=Decision]');
    expect(name.innerHTML).toBe('Ajax Mine');
    expect(proponent.innerHTML).toBe('KGHM Ajax Mining Incorporated');
    expect(projType.innerHTML).toBe('Mines');
    expect(region.innerHTML).toBe('Thompson-Nicola');
    expect(phase.innerHTML).toBe('Complete');
    expect(decision.innerHTML).toBe('Certificate Refused');
  });

  it('click on project navigates to project page', () => {
    let row = fixture.nativeElement.querySelector('[data-label=Name]');
    row.click();

    const id = component.projects[0]._id;
    expect(routerSpy.navigate).toHaveBeenCalledWith([`p/${id}/project-details`]);

  });
});
