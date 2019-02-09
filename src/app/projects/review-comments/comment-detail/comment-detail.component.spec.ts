import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewlinesPipe } from 'app/pipes/newlines.pipe';
import { ApiService } from 'app/services/api';
import { CommentDetailComponent } from './comment-detail.component';
import { CommentService } from 'app/services/comment.service';
import { DocumentService } from 'app/services/document.service';

describe('CommentDetailComponent', () => {
  let component: CommentDetailComponent;
  let fixture: ComponentFixture<CommentDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CommentDetailComponent, NewlinesPipe],
      providers: [
        { provide: ApiService },
        { provide: CommentService },
        { provide: DocumentService },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
