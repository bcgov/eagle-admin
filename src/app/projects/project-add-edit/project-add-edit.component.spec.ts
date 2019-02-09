import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DialogService } from 'ng2-bootstrap-modal';

import { ApplicationAddEditComponent } from './project-add-edit.component';
import { FileUploadComponent } from 'app/file-upload/file-upload.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material';
import { ApiService } from 'app/services/api';
import { ApplicationService } from 'app/services/application.service';
import { CommentPeriodService } from 'app/services/commentperiod.service';
import { DecisionService } from 'app/services/decision.service';
import { DocumentService } from 'app/services/document.service';

xdescribe('ApplicationAddEditComponent', () => {
  let component: ApplicationAddEditComponent;
  let fixture: ComponentFixture<ApplicationAddEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, NgbModule, RouterTestingModule ],
      declarations: [ApplicationAddEditComponent, FileUploadComponent],
      providers: [
        { provide: DialogService },
        { provide: MatSnackBar },
        { provide: ApiService },
        { provide: ApplicationService },
        { provide: CommentPeriodService },
        { provide: DecisionService },
        { provide: DocumentService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
