import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AddCommentComponent } from './add-comment.component';
import { CommentService } from 'src/app/services/comment.service';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';

describe('AddCommentComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCommentComponent],
      providers: [
        provideRouter([]),
        { provide: CommentService, useValue: {} },
        { provide: ToastService, useValue: jasmine.createSpyObj('ToastService', ['error', 'success']) },
        { provide: LoggingService, useValue: jasmine.createSpyObj('LoggingService', ['debug', 'error']) }
      ]
    }).compileComponents();
  });

  it('renders the file picker browse button', () => {
    const fixture = TestBed.createComponent(AddCommentComponent);
    fixture.componentRef.setInput('project', { _id: 'p1', name: 'Test Project' });
    fixture.componentRef.setInput('commentPeriod', { _id: 'cp1', dateStarted: '2026-01-01', dateCompleted: '2026-02-01' });
    fixture.componentRef.setInput('commentPeriodId', 'cp1');
    fixture.detectChanges();

    const browse: HTMLButtonElement = fixture.nativeElement.querySelector('app-file-upload button.browse');
    expect(browse).not.toBeNull();
    expect(browse.type).toBe('button');
    expect(browse.textContent).toContain('browse');
  });
});
