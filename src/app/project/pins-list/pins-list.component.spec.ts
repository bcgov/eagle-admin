import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PinsListComponent } from './pins-list.component';

describe('PinsListComponent', () => {
  let component: PinsListComponent;
  let fixture: ComponentFixture<PinsListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PinsListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PinsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
