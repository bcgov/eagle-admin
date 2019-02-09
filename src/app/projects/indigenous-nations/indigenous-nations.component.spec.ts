import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndigenousNationsComponent } from './indigenous-nations.component';

describe('IndigenousNationsComponent', () => {
  let component: IndigenousNationsComponent;
  let fixture: ComponentFixture<IndigenousNationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IndigenousNationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndigenousNationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
