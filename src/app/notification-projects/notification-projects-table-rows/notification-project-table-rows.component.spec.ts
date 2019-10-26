import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationProjectTableRowsComponent } from './notification-project-table-rows.component';

describe('NotificationProjectTableRowsComponent', () => {
  let component: NotificationProjectTableRowsComponent;
  let fixture: ComponentFixture<NotificationProjectTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationProjectTableRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationProjectTableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
