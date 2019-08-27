import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactSelectTableRowsComponent } from './contact-select-table-rows.component';

describe('ContactSelectTableRowsComponent', () => {
  let component: ContactSelectTableRowsComponent;
  let fixture: ComponentFixture<ContactSelectTableRowsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ContactSelectTableRowsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContactSelectTableRowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
