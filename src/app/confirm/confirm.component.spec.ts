import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ConfirmComponent } from './confirm.component';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

describe('ConfirmComponent', () => {
  let component: ConfirmComponent;
  let fixture: ComponentFixture<ConfirmComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ConfirmComponent],
      providers: [
        { provide: NgbActiveModal, useValue: {} }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmComponent);
    component = fixture.componentInstance;
    component.title = 'Test';
    component.message = 'Test message';
    component.okOnly = false;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  function buttonLabels(): string[] {
    return Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.modal-footer button'))
      .map(b => b.textContent.trim());
  }

  it('labels the buttons OK and Cancel by default', () => {
    expect(buttonLabels()).toEqual(['OK', 'Cancel']);
  });

  it('shows the button labels a caller sets', () => {
    fixture = TestBed.createComponent(ConfirmComponent);
    fixture.componentInstance.okLabel = 'Archive';
    fixture.componentInstance.cancelLabel = 'Keep';
    fixture.detectChanges();
    expect(buttonLabels()).toEqual(['Archive', 'Keep']);
  });
});
