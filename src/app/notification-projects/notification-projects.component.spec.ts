import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationProjectsComponent } from './notification-projects.component';

describe('ContactsComponent', () => {
  let component: NotificationProjectsComponent;
  let fixture: ComponentFixture<NotificationProjectsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationProjectsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
