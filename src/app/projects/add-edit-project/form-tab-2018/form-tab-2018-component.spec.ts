import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormTab2018Component } from './form-tab-2018.component';
describe('FormTab2018', () => {
  let component: FormTab2018Component;
  let fixture: ComponentFixture<FormTab2018Component>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormTab2018Component]
    })
      .compileComponents();
  }));
  beforeEach(() => {
    fixture = TestBed.createComponent(FormTab2018Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
