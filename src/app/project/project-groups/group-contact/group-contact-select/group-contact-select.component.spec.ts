import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupContactSelectComponent } from './group-contact-select.component';

describe('GroupContactSelectComponent', () => {
  let component: GroupContactSelectComponent;
  let fixture: ComponentFixture<GroupContactSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupContactSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupContactSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
