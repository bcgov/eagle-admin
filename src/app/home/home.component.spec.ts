import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeComponent } from './home.component';
import { provideRouter } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  const mockProjectService = jasmine.createSpyObj('ProjectService', [
    'getCount'
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        provideRouter([])
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    mockProjectService.getCount.and.returnValue(
      of(2)
    );
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
