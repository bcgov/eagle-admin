import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FileUploadComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  function set(inputs: Record<string, unknown>) {
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    fixture.detectChanges();
  }

  const query = (selector: string) => fixture.nativeElement.querySelector(selector);

  it('shows the hint before the browse button', () => {
    set({ hint: 'Drag photos here or' });
    expect(query('.hint').textContent.trim()).toBe('Drag photos here or');
  });

  it('shows no hint by default', () => {
    expect(query('.hint')).toBeNull();
  });

  it('labels the browse button with the action', () => {
    set({ action: 'Upload photos' });
    expect(query('button.browse').textContent).toContain('Upload photos');
  });

  it('keeps the old browse label by default', () => {
    expect(query('button.browse').textContent).toContain('Drop files to attach, or browse.');
  });

  it('limits the file picker to the accepted types', () => {
    set({ accept: 'image/jpeg,image/png' });
    expect(query('input[type=file]').getAttribute('accept')).toBe('image/jpeg,image/png');
  });

  it('leaves the file picker open to any type by default', () => {
    expect(query('input[type=file]').hasAttribute('accept')).toBeFalse();
  });

  it('points the browse button at its help text', () => {
    set({ describedBy: 'photoHelp' });
    expect(query('button.browse').getAttribute('aria-describedby')).toBe('photoHelp');
  });
});
