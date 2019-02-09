import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectUpdatesComponent } from './project-updates.component';

describe('ProjectUpdatesComponent', () => {
  let component: ProjectUpdatesComponent;
  let fixture: ComponentFixture<ProjectUpdatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectUpdatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectUpdatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
