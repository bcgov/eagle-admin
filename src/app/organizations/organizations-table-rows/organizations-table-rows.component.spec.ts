import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationsTableRowsComponent } from './organizations-table-rows.component';

describe('OrganizationsTableRowsComponent', () => {
  let component: OrganizationsTableRowsComponent;
  let fixture: ComponentFixture<OrganizationsTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OrganizationsTableRowsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrganizationsTableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
