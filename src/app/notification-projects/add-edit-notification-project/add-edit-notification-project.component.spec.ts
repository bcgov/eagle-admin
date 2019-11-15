import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DialogService } from 'ng2-bootstrap-modal';
import { UserService } from 'app/services/user.service';

import { AddEditNotificationProjectComponent } from './add-edit-notification-project.component';

describe('AddEditContactComponent', () => {
  let component: AddEditNotificationProjectComponent;
  let fixture: ComponentFixture<AddEditNotificationProjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddEditNotificationProjectComponent],
      imports: [FormsModule],
      providers: [
        { provide: DialogService },
        { provide: UserService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEditNotificationProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
