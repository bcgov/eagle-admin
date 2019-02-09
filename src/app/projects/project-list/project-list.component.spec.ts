import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationListComponent } from './project-list.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSlideToggleModule } from '@angular/material';
import { OrderByPipe } from 'app/pipes/order-by.pipe';
import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { Application } from 'app/models/application';
import { of } from 'rxjs';
import { throwError } from 'rxjs';

describe('ApplicationListComponent', () => {
  let component: ApplicationListComponent;
  let fixture: ComponentFixture<ApplicationListComponent>;

  const applicationServiceStub = {
    getAll() {
      return of([]);
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationListComponent, OrderByPipe, NewlinesPipe],
      imports: [RouterTestingModule, MatSlideToggleModule],
      providers: [
        { provide: ApplicationService, useValue: applicationServiceStub },
        { provide: CommentPeriodService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('when applications are returned from the service', () => {
    const existingApplications = [
      new Application(),
      new Application()
    ];

    beforeEach(() => {
      let applicationService = TestBed.get(ApplicationService);
      spyOn(applicationService, 'getAll').and.returnValue(of(existingApplications));
    });

    it('sets the component application to the one from the route', () => {
      component.ngOnInit();
      expect(component.applications).toEqual(existingApplications);
    });
  });

  describe('when the application service throws an error', () => {
    beforeEach(() => {
      let applicationService = TestBed.get(ApplicationService);
      spyOn(applicationService, 'getAll').and.returnValue(throwError('Beep boop server error'));
    });

    it('redirects to root', () => {
      let navigateSpy = spyOn((<any>component).router, 'navigate');

      component.ngOnInit();

      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});
