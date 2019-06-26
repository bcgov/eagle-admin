import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DialogService } from 'ng2-bootstrap-modal';
import { UserService } from 'app/services/user.service';

import { AddEditContactComponent } from './add-edit-contact.component';

describe('AddEditContactComponent', () => {
  let component: AddEditContactComponent;
  let fixture: ComponentFixture<AddEditContactComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditContactComponent],
      imports: [FormsModule],
      providers: [
        { provide: DialogService },
        { provide: UserService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
