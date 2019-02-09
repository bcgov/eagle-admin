import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ValuedComponentsComponent } from './valued-components.component';

describe('ValuedComponentsComponent', () => {
  let component: ValuedComponentsComponent;
  let fixture: ComponentFixture<ValuedComponentsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ValuedComponentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ValuedComponentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
