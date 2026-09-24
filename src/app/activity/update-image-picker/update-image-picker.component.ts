import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { documentFetchUrl } from 'src/app/services/document.service';
import { documentName, isPublicDocument } from '../update-image-field/update-images';

/** Modal grid of a project's image documents; closes with the picked documents in pick order. */
@Component({
  selector: 'app-update-image-picker',
  templateUrl: './update-image-picker.component.html',
  styleUrl: './update-image-picker.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UpdateImagePickerComponent {
  activeModal = inject(NgbActiveModal);

  // Set by the opener through componentInstance.
  titleId = 'imagePickerTitle';
  heading = 'Choose images';
  docs: any[] = [];
  max = 1;
  attached = new Set<string>();

  readonly query = signal('');
  readonly selected = signal<string[]>([]);

  readonly isPublic = isPublicDocument;
  readonly fetchUrl = documentFetchUrl;
  readonly name = documentName;

  get visible(): any[] {
    const query = this.query().trim().toLowerCase();
    return query
      ? this.docs.filter(doc => documentName(doc).toLowerCase().includes(query))
      : this.docs;
  }

  get hasNonPublic(): boolean {
    return this.docs.some(doc => !isPublicDocument(doc));
  }

  get addLabel(): string {
    const count = this.selected().length;
    if (this.max === 1) {
      return 'Add image';
    }
    return count ? `Add ${count} ${count === 1 ? 'photo' : 'photos'}` : 'Add photos';
  }

  isSelected(doc: any): boolean {
    return this.selected().includes(doc._id);
  }

  canPick(doc: any): boolean {
    if (!isPublicDocument(doc) || this.attached.has(doc._id)) {
      return false;
    }
    return this.max === 1 || this.isSelected(doc) || this.selected().length < this.max;
  }

  toggle(doc: any) {
    const picked = this.selected();
    if (this.isSelected(doc)) {
      this.selected.set(picked.filter(id => id !== doc._id));
    } else if (this.max === 1) {
      this.selected.set([doc._id]);
    } else if (picked.length < this.max) {
      this.selected.set([...picked, doc._id]);
    }
  }

  done() {
    this.activeModal.close(this.selected().map(id => this.docs.find(doc => doc._id === id)));
  }
}
