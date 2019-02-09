import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectDetailComponent } from './project-detail.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectAsideComponent } from 'app/projects/project-aside/project-aside.component';
import { MatSnackBar } from '@angular/material';
import { DialogService } from 'ng2-bootstrap-modal';
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { FeatureService } from 'app/services/feature.service';
import { Project } from 'app/models/project';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from 'app/spec/helpers';


describe('ProjectDetailComponent', () => {
  let component: ProjectDetailComponent;
  let fixture: ComponentFixture<ProjectDetailComponent>;
  const existingProject = new Project();
  const validRouteData = {project: existingProject};

  const activatedRouteStub = new ActivatedRouteStub(validRouteData);
  const routerSpy = {
    navigate: jasmine.createSpy('navigate')
  };

  const projectServiceStub = {
    getRegionString() {
      return 'Skeena, Smithers';
    },

    getRegionCode() {
      return 'SK';
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectDetailComponent, NewlinesPipe, ProjectAsideComponent],
      imports: [RouterTestingModule, NgbModule],
      providers: [
        { provide: MatSnackBar },
        { provide: ApiService },
        { provide: DialogService },
        { provide: ProjectService, useValue: projectServiceStub },
        { provide: CommentPeriodService },
        { provide: DecisionService },
        { provide: DocumentService },
        { provide: FeatureService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });


  describe('when the project is retrievable from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setData(validRouteData);
    });

    it('sets the component project to the one from the route', () => {
      expect(component.project).toEqual(existingProject);
    });
  });

  describe('when the project is not available from the route', () => {
    beforeEach(() => {
      activatedRouteStub.setData({something: 'went wrong'});
    });

    it('redirects to /search', () => {
      component.ngOnInit();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/search']);
    });
  });
});
