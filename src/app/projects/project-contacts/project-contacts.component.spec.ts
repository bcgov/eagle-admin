import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectContactsComponent } from './project-contacts.component';

describe('ProjectContactsComponent', () => {
  let component: ProjectContactsComponent;
  let fixture: ComponentFixture<ProjectContactsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProjectContactsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectContactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
