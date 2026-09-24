import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { DocumentService } from 'src/app/services/document.service';
import { AddedImage, ImageRow, UpdateImageFieldComponent } from './update-image-field.component';

const MB = 1024 * 1024;
const image = (name = 'dam.jpg', type = 'image/jpeg', size = 1) => new File([new Uint8Array(size)], name, { type });
const row = (document: string): ImageRow => ({
  document: new FormControl(document), alt: new FormControl(''), caption: new FormControl(''), credit: new FormControl('')
});

describe('UpdateImageFieldComponent', () => {
  let fixture: ComponentFixture<UpdateImageFieldComponent>;
  let documentService: jasmine.SpyObj<DocumentService>;
  let server: Subject<HttpEvent<any>>;
  let added: AddedImage[][];
  let outside: HTMLInputElement | null;

  beforeEach(() => {
    server = new Subject();
    documentService = jasmine.createSpyObj('DocumentService', ['addWithProgress']);
    documentService.addWithProgress.and.returnValue(server);
    TestBed.configureTestingModule({
      imports: [UpdateImageFieldComponent],
      providers: [
        { provide: DocumentService, useValue: documentService },
        { provide: NgbModal, useValue: jasmine.createSpyObj('NgbModal', ['open']) }
      ]
    });
    fixture = TestBed.createComponent(UpdateImageFieldComponent);
    const inputs = { idPrefix: 'image', heading: 'Photos', max: 5, projectId: 'p1' };
    Object.entries(inputs).forEach(([name, value]) => fixture.componentRef.setInput(name, value));
    added = [];
    // Add the row the way the Update form does, so focus has somewhere to go.
    fixture.componentInstance.added.subscribe(images => {
      added.push(images);
      fixture.componentRef.setInput('rows', [...fixture.componentInstance.rows(), ...images.map(({ doc }) => row(doc._id))]);
      fixture.detectChanges();
    });
    fixture.detectChanges();
    outside = null;
  });

  afterEach(() => outside?.remove());

  const text = (): string => fixture.nativeElement.textContent;
  const query = (selector: string) => fixture.nativeElement.querySelector(selector);
  const sentForm = (): FormData => documentService.addWithProgress.calls.mostRecent().args[0];

  function choose(...files: File[]) {
    const input: HTMLInputElement = query('input[type=file]');
    const transfer = new DataTransfer();
    files.forEach(file => transfer.items.add(file));
    input.files = transfer.files;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  function respond(event: HttpEvent<any>) {
    server.next(event);
    fixture.detectChanges();
  }

  describe('checking the file', () => {
    it('uploads a picked image to the project as an Update image', () => {
      choose(image('dam.jpg'));
      expect(sentForm().get('project')).toBe('p1');
      expect(sentForm().get('documentSource')).toBe('UPDATE');
      expect((sentForm().get('upfile') as File).name).toBe('dam.jpg');
    });

    it('refuses a file whose name does not match its type, without uploading it', () => {
      choose(image('dam.png', 'image/jpeg'));
      expect(text()).toContain('Not a JPG, PNG, WebP or GIF image, or its name does not match its type.');
      expect(documentService.addWithProgress).not.toHaveBeenCalled();
    });

    it('refuses a file that is not an image', () => {
      choose(image('notes.txt', 'text/plain'));
      expect(text()).toContain('Not a JPG, PNG, WebP or GIF image');
      expect(documentService.addWithProgress).not.toHaveBeenCalled();
    });

    it('refuses an image over 10 MB', () => {
      choose(image('big.jpg', 'image/jpeg', 10 * MB + 1));
      expect(text()).toContain('Larger than 10 MB.');
      expect(documentService.addWithProgress).not.toHaveBeenCalled();
    });

    it('accepts an image of exactly 10 MB', () => {
      choose(image('big.jpg', 'image/jpeg', 10 * MB));
      expect(documentService.addWithProgress).toHaveBeenCalledTimes(1);
    });

    it('does nothing until a project is picked', () => {
      fixture.componentRef.setInput('projectId', null);
      fixture.detectChanges();
      expect(query('input[type=file]')).toBeNull();
      expect(text()).toContain('Select a project to add photos.');
    });
  });

  describe('while uploading', () => {
    it('shows upload progress', () => {
      choose(image());
      respond({ type: HttpEventType.UploadProgress, loaded: 50, total: 200 });
      expect(text()).toContain('Uploading, 25%');
      expect(query('[role=progressbar]').getAttribute('aria-valuenow')).toBe('25');
    });

    it('shows why an upload failed', () => {
      choose(image());
      server.error(new Error('Network down'));
      fixture.detectChanges();
      expect(text()).toContain('Upload failed. Network down');
    });

    it('treats a reply with no document as a failure', () => {
      choose(image());
      respond(new HttpResponse({ body: null }));
      expect(text()).toContain('Upload failed. The server returned no document.');
      expect(query('button[aria-label="Dismiss dam.jpg"]')).not.toBeNull();
      expect(added).toEqual([]);
    });

    it('removes a failed upload when dismissed', () => {
      choose(image());
      respond(new HttpResponse({ body: null }));
      query('button[aria-label="Dismiss dam.jpg"]').click();
      fixture.detectChanges();
      expect(text()).not.toContain('Upload failed');
    });

    it('hands the saved document to the form as an Update image with its local preview', () => {
      choose(image());
      respond(new HttpResponse({ body: { _id: 'n1', displayName: 'dam.jpg' } }));
      expect(added.length).toBe(1);
      expect(added[0][0].doc).toEqual({ _id: 'n1', displayName: 'dam.jpg', documentSource: 'UPDATE', read: [] });
      expect(added[0][0].src).toMatch(/^blob:/);
      expect(query('[role=progressbar]')).toBeNull();
    });
  });

  describe('focus after an upload', () => {
    const saved = () => respond(new HttpResponse({ body: { _id: 'n1', displayName: 'dam.jpg' } }));
    const focusedId = () => (document.activeElement as HTMLElement).id;

    it('moves to the new row alt text when nothing else has focus', fakeAsync(() => {
      choose(image());
      (document.activeElement as HTMLElement).blur();
      saved();
      flush();
      expect(focusedId()).toBe('image0Alt');
    }));

    it('moves to the new row alt text when focus is inside the field', fakeAsync(() => {
      choose(image());
      (query('button.browse') as HTMLButtonElement).focus();
      saved();
      flush();
      expect(focusedId()).toBe('image0Alt');
    }));

    it('stays put while staff work elsewhere on the page', fakeAsync(() => {
      choose(image());
      outside = document.body.appendChild(document.createElement('input'));
      outside.focus();
      saved();
      flush();
      expect(document.activeElement).toBe(outside);
    }));

    it('moves to the upload button after a failed upload is dismissed', fakeAsync(() => {
      choose(image());
      respond(new HttpResponse({ body: null }));
      query('button[aria-label="Dismiss dam.jpg"]').click();
      fixture.detectChanges();
      flush();
      expect(document.activeElement).toBe(query('button.browse'));
    }));
  });
});
