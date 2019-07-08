import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupTableRowsComponent } from './group-table-rows.component';

describe('GroupTableRowsComponent', () => {
  let component: GroupTableRowsComponent;
  let fixture: ComponentFixture<GroupTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupTableRowsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupTableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
