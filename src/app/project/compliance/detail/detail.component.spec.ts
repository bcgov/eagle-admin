import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplianceDetailComponent } from './detail.component';

describe('ComplianceDetailComponent', () => {
  let component: ComplianceDetailComponent;
  let fixture: ComponentFixture<ComplianceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplianceDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplianceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
