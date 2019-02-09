import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplicationAsideComponent } from './project-aside.component';
import { ConfigService } from 'app/services/config.service';
import { FeatureService } from 'app/services/feature.service';
import { Application } from '../../models/application';
import { Feature } from '../../models/feature';
import { of } from 'rxjs';


describe('ApplicationAsideComponent', () => {
  let component: ApplicationAsideComponent;
  let fixture: ComponentFixture<ApplicationAsideComponent>;

  const mockConfigService = {
    baseLayerName: () => {
      return 'mock baseLayer name';
    }
  };

  const mockFeatureService = jasmine.createSpyObj('FeatureService', [
    'getByApplicationId',
    'getByTantalisId'
  ]);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApplicationAsideComponent],
      providers: [
        { provide: ConfigService, useValue: mockConfigService },
        { provide: FeatureService, useValue: mockFeatureService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationAsideComponent);
    component = fixture.componentInstance;
    component.application = new Application();
    mockFeatureService.getByApplicationId.and.returnValue(
      of([
        new Feature()
      ])
    );
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
