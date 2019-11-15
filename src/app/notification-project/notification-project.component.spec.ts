import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationProjectComponent } from './notification-project.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBar } from '@angular/material';
import { DialogService } from 'ng2-bootstrap-modal';
import { ApiService } from 'app/services/api';
import { ProjectService } from 'app/services/project.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';
import { Project } from 'app/models/project';
import { ActivatedRoute, Router } from '@angular/router';
import { ActivatedRouteStub } from 'app/spec/helpers';


describe('ProjectDetailComponent', () => {
  let component: NotificationProjectComponent;
  let fixture: ComponentFixture<NotificationProjectComponent>;
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
      declarations: [NotificationProjectComponent],
      imports: [RouterTestingModule, NgbModule],
      providers: [
        { provide: MatSnackBar },
        { provide: ApiService },
        { provide: DialogService },
        { provide: ProjectService, useValue: projectServiceStub },
        { provide: CommentPeriodService },
        { provide: DecisionService },
        { provide: DocumentService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerSpy },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationProjectComponent);
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
