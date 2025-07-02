import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotAuthorizedComponent } from './not-authorized.component';
import { provideRouter } from '@angular/router';

describe('NotAuthorizedComponent', () => {
  let component: NotAuthorizedComponent;
  let fixture: ComponentFixture<NotAuthorizedComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NotAuthorizedComponent],
      providers: [provideRouter([])],
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotAuthorizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
