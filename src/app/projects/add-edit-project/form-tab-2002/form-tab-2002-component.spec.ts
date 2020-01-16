import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormTab2002Component } from './form-tab-2002.component';
describe('FormTab2002', () => {
  let component: FormTab2002Component;
  let fixture: ComponentFixture<FormTab2002Component>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormTab2002Component]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(FormTab2002Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
