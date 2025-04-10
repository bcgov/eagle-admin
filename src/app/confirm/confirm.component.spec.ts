import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { ConfirmComponent } from './confirm.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('ConfirmComponent', () => {
  let component: ConfirmComponent;
  let fixture: ComponentFixture<ConfirmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmComponent],
      providers: [
        { provide: NgbActiveModal, useValue: {} }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
