import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterCACEmailComponent } from './enter-cac-email.component';
import { DialogService } from 'ng2-bootstrap-modal';
import { ReactiveFormsModule } from '@angular/forms';

describe('EnterCACEmailComponent', () => {
  let component: EnterCACEmailComponent;
  let fixture: ComponentFixture<EnterCACEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [EnterCACEmailComponent],
      providers: [
        { provide: DialogService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterCACEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
