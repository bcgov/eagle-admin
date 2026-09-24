import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UpdateImagePickerComponent } from './update-image-picker.component';

const doc = (_id: string, read = ['public']) => ({ _id, displayName: `${_id}.jpg`, documentFileName: `${_id}.jpg`, read });

describe('UpdateImagePickerComponent', () => {
  let fixture: ComponentFixture<UpdateImagePickerComponent>;
  let activeModal: jasmine.SpyObj<NgbActiveModal>;

  function open(options: Partial<Pick<UpdateImagePickerComponent, 'docs' | 'max' | 'attached'>>) {
    activeModal = jasmine.createSpyObj('NgbActiveModal', ['close', 'dismiss']);
    TestBed.configureTestingModule({
      imports: [UpdateImagePickerComponent],
      providers: [{ provide: NgbActiveModal, useValue: activeModal }]
    });
    fixture = TestBed.createComponent(UpdateImagePickerComponent);
    Object.assign(fixture.componentInstance, options);
    fixture.detectChanges();
  }

  const card = (name: string): HTMLInputElement => {
    const label = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.picker-card'))
      .find(el => el.querySelector('.picker-name')!.textContent!.trim() === name)!;
    return label.querySelector('input')!;
  };

  function pick(name: string) {
    card(name).click();
    fixture.detectChanges();
  }

  const addButton = (): HTMLButtonElement => fixture.nativeElement.querySelector('.modal-footer .btn-primary');

  function add() {
    addButton().click();
  }

  const pickedIds = () => activeModal.close.calls.mostRecent().args[0].map((d: any) => d._id);

  describe('which images can be picked', () => {
    it('does not offer a document the public cannot see', () => {
      open({ docs: [doc('a'), doc('b', ['staff'])], max: 5 });
      expect(card('b.jpg').disabled).toBeTrue();
      expect(card('a.jpg').disabled).toBeFalse();
    });

    it('does not offer an image already on the Update, and marks it Added', () => {
      open({ docs: [doc('a'), doc('b')], max: 5, attached: new Set(['b']) });
      expect(card('b.jpg').disabled).toBeTrue();
      expect(card('b.jpg').closest('label')!.textContent).toContain('Added');
    });
  });

  describe('picking several photos', () => {
    it('returns the picked photos in the order they were picked', () => {
      open({ docs: [doc('a'), doc('b'), doc('c')], max: 5 });
      pick('c.jpg');
      pick('a.jpg');
      expect(addButton().textContent!.trim()).toBe('Add 2 photos');
      add();
      expect(pickedIds()).toEqual(['c', 'a']);
    });

    it('drops a photo when it is picked again', () => {
      open({ docs: [doc('a'), doc('b')], max: 5 });
      pick('a.jpg');
      pick('b.jpg');
      pick('a.jpg');
      add();
      expect(pickedIds()).toEqual(['b']);
    });

    it('stops offering more photos once the limit is reached, but keeps picked ones changeable', () => {
      open({ docs: [doc('a'), doc('b'), doc('c')], max: 2 });
      pick('a.jpg');
      pick('b.jpg');
      expect(card('c.jpg').disabled).toBeTrue();
      expect(card('a.jpg').disabled).toBeFalse();
    });

    it('keeps Add off until something is picked', () => {
      open({ docs: [doc('a')], max: 5 });
      expect(addButton().disabled).toBeTrue();
    });
  });

  describe('picking one image', () => {
    it('shows radio buttons in one group', () => {
      open({ docs: [doc('a'), doc('b')], max: 1 });
      expect(card('a.jpg').type).toBe('radio');
      expect(card('a.jpg').name).toBeTruthy();
      expect(card('a.jpg').name).toBe(card('b.jpg').name);
    });

    it('replaces the pick when another image is chosen', () => {
      open({ docs: [doc('a'), doc('b')], max: 1 });
      pick('a.jpg');
      pick('b.jpg');
      expect(addButton().textContent!.trim()).toBe('Add image');
      add();
      expect(pickedIds()).toEqual(['b']);
    });

    it('keeps other images on offer after one is picked', () => {
      open({ docs: [doc('a'), doc('b')], max: 1 });
      pick('a.jpg');
      expect(card('b.jpg').disabled).toBeFalse();
    });
  });
});
