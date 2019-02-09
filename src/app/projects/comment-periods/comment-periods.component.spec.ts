import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentPeriodsComponent } from './comment-periods.component';

describe('CommentPeriodsComponent', () => {
  let component: CommentPeriodsComponent;
  let fixture: ComponentFixture<CommentPeriodsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CommentPeriodsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentPeriodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
