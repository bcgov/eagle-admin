import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { Component } from '@angular/core';

import { ReviewCommentComponent } from './review-comment.component';
import { TableTemplateComponent } from 'src/app/shared/components/table-template/table-template.component';

import { ApiService } from 'src/app/services/api';
import { CommentService } from 'src/app/services/comment.service';
import { StorageService } from 'src/app/services/storage.service';
import { Utils } from 'src/app/shared/utils/utils';

// Added the declaration of BlankComponent to be used for test routing
@Component({
    selector: 'test-blank', template: ``,
    standalone: false
})
class BlankComponent { }

describe('ReviewCommentComponent', () => {
  let fixture: ComponentFixture<ReviewCommentComponent>;

  const mockApiService = jasmine.createSpyObj('ApiService', [
    'downloadDocument'
  ]);

  const mockCommentService = jasmine.createSpyObj('CommentService', [
    'pendingCommentCount',
    'nextCommentId',
    'save'
  ]);

  const mockStorageService = jasmine.createSpyObj('StorageService', [
    'state'
  ]);

  mockStorageService.state.currentProject = {
    data: { _id: 12345 }
  };

  const mockUtils = jasmine.createSpyObj('Utils', [
    'convertJSDateToNGBDate',
    'convertFormGroupNGBDateToJSDate'
  ]);

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ReviewCommentComponent,
        TableTemplateComponent,
        BlankComponent
      ],
      imports: [
        RouterTestingModule.withRoutes([// <-- Added the .withRoutes method
          { path: 'search', component: BlankComponent }
        ]),
        FormsModule,
        ReactiveFormsModule,
        NgbModule,
        MatSnackBarModule,
        NzPaginationModule,
      ],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: CommentService, useValue: mockCommentService },
        { provide: StorageService, useValue: mockStorageService },
        { provide: Utils, useValue: mockUtils }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewCommentComponent);

    fixture.detectChanges();
  });

  it('should create', () => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });
});
