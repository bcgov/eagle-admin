import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { FileUploadComponent } from 'src/app/file-upload/file-upload.component';
import { DocumentService } from 'src/app/services/document.service';
import { UpdateImagePickerComponent } from '../update-image-picker/update-image-picker.component';
import { IMAGE_CAPTION_MAX, IMAGE_CREDIT_MAX } from '../update-rules';
import { UPDATE_IMAGE_SOURCE, blocksPublish, documentName, imageSrc, isPublicDocument } from './update-images';

// The API refuses a file whose name extension does not map to its MIME type.
const IMAGE_TYPES: Record<string, string> = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif'
};
const IMAGE_MAX_MB = 10;

export interface ImageRow {
  document: FormControl;
  alt: FormControl;
  caption: FormControl;
  credit: FormControl;
}

export interface AddedImage {
  doc: any;
  /** Local preview of a file just uploaded. */
  src?: string;
}

interface Upload {
  file: File;
  src: string | null;
  progress: number;
  error: string | null;
  sub?: Subscription;
}

@Component({
  selector: 'app-update-image-field',
  templateUrl: './update-image-field.component.html',
  styleUrl: './update-image-field.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FileUploadComponent]
})
export class UpdateImageFieldComponent {
  private documentService = inject(DocumentService);
  private modalService = inject(NgbModal);
  private host: HTMLElement = inject(ElementRef).nativeElement;

  idPrefix = input.required<string>();
  heading = input.required<string>();
  help = input('');
  max = input(1);
  rows = input<ImageRow[]>([]);
  docs = input(new Map<string, any>());
  srcs = input(new Map<string, string>());
  /** Project image documents staff can pick. */
  choices = input<any[]>([]);
  choicesLoading = input(false);
  choicesFailed = input(false);
  projectId = input<string | null>(null);

  added = output<AddedImage[]>();
  removed = output<number>();
  moved = output<{ index: number; step: -1 | 1 }>();

  readonly uploads = signal<Upload[]>([]);
  readonly status = signal('');
  readonly multiple = computed(() => this.max() > 1);
  readonly remaining = computed(() => this.max() - this.rows().length - this.uploads().filter(u => !u.error).length);
  readonly attachedIds = computed(() => new Set(this.rows().map(row => row.document.value)));
  /** Help text ids for the add buttons. */
  readonly addHelpIds = computed(() => [this.help() ? `${this.idPrefix()}Help` : '', `${this.idPrefix()}ChooseHelp`].join(' ').trim());
  readonly accept = [...new Set(Object.values(IMAGE_TYPES))].join(',');
  readonly captionMax = IMAGE_CAPTION_MAX;
  readonly creditMax = IMAGE_CREDIT_MAX;
  public pending: File[] = [];

  constructor() {
    // Uploads in flight belong to the project they started on.
    effect(() => {
      this.projectId();
      untracked(() => this.clearUploads());
    });
    inject(DestroyRef).onDestroy(() => this.clearUploads());
  }

  id(index: number, part: string): string {
    return this.multiple() ? `${this.idPrefix()}${index}${part}` : `${this.idPrefix()}${part}`;
  }

  docOf(row: ImageRow): any {
    return this.docs().get(row.document.value);
  }

  src(row: ImageRow): string | null {
    return imageSrc(row.document.value, this.docs(), this.srcs());
  }

  name(doc: any): string {
    return documentName(doc) || 'Image';
  }

  blocksPublish = blocksPublish;
  isPublic = isPublicDocument;
  updateImageSource = UPDATE_IMAGE_SOURCE;

  altMissing(row: ImageRow): boolean {
    return !!row.document.value && !(row.alt.value || '').trim() && (row.alt.touched || row.alt.dirty);
  }

  onFiles(files: File[]) {
    const picked = [...files];
    this.pending = [];
    const project = this.projectId();
    if (!project) {
      return;
    }
    const started: Upload[] = picked.map(file => {
      const extension = file.name.split('.').pop()!.toLowerCase();
      const error = IMAGE_TYPES[extension] !== file.type ? 'Not a JPG, PNG, WebP or GIF image, or its name does not match its type.'
        : file.size > IMAGE_MAX_MB * 1024 * 1024 ? `Larger than ${IMAGE_MAX_MB} MB.` : null;
      return { file, error, progress: 0, src: error ? null : URL.createObjectURL(file) };
    });
    this.uploads.update(list => [...list, ...started]);
    started.filter(item => !item.error).forEach(item => this.upload(item, project));
    const failed = started.filter(item => item.error);
    const uploading = started.length - failed.length;
    this.status.set([
      uploading ? `Uploading ${uploading} ${uploading === 1 ? 'file' : 'files'}.` : '',
      ...failed.map(item => `${item.file.name}: ${item.error}`)
    ].join(' ').trim());
  }

  private upload(item: Upload, project: string) {
    const now = new Date().toISOString();
    const form = new FormData();
    form.append('upfile', item.file);
    form.append('project', project);
    form.append('documentFileName', item.file.name);
    form.append('documentSource', UPDATE_IMAGE_SOURCE);
    form.append('displayName', item.file.name);
    form.append('dateUploaded', now);
    form.append('datePosted', now);
    item.sub = this.documentService.addWithProgress(form).subscribe({
      next: event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.patch(item, { progress: event.total ? Math.round(100 * event.loaded / event.total) : 0 });
        } else if (event.type === HttpEventType.Response) {
          if (event.body) {
            this.uploaded(item, event.body);
          } else {
            this.failed(item, 'The server returned no document.');
          }
        }
      },
      error: (e: Error) => this.failed(item, e.message)
    });
  }

  private uploaded(item: Upload, doc: any) {
    const index = this.rows().length;
    this.uploads.update(list => list.filter(u => u !== item));
    this.status.set(`Uploaded ${item.file.name}. Add its alt text.`);
    this.added.emit([{ doc: { documentSource: UPDATE_IMAGE_SOURCE, read: [], ...doc }, src: item.src ?? undefined }]);
    // Leave focus alone while staff work elsewhere on the page.
    const active = document.activeElement;
    if (!active || active === document.body || this.host.contains(active)) {
      this.focusLater(this.id(index, 'Alt'));
    }
  }

  private failed(item: Upload, reason: string) {
    this.patch(item, { error: `Upload failed. ${reason}` });
    this.status.set(`${item.file.name}: upload failed.`);
  }

  private patch(item: Upload, change: Partial<Upload>) {
    Object.assign(item, change);
    this.uploads.update(list => [...list]);
  }

  dismiss(item: Upload) {
    this.drop(item);
    this.uploads.update(list => list.filter(u => u !== item));
    this.focusLater(this.addFocusTarget());
  }

  private drop(item: Upload) {
    item.sub?.unsubscribe();
    if (item.src) {
      URL.revokeObjectURL(item.src);
    }
  }

  private clearUploads() {
    this.uploads().forEach(item => this.drop(item));
    this.uploads.set([]);
  }

  choose() {
    const titleId = `${this.idPrefix()}PickerTitle`;
    const ref = this.modalService.open(UpdateImagePickerComponent, { size: 'lg', scrollable: true, ariaLabelledBy: titleId });
    Object.assign(ref.componentInstance, {
      titleId,
      heading: this.multiple() ? 'Choose photos from project documents' : 'Choose an image from project documents',
      docs: this.choices(),
      max: this.remaining(),
      attached: this.attachedIds()
    });
    ref.result.then((docs: any[]) => {
      if (docs?.length) {
        const first = this.rows().length;
        this.added.emit(docs.map(doc => ({ doc })));
        this.focusLater(this.id(first, 'Alt'));
      }
    }, () => { /* dismissed: NgbModal returns focus to the button */ });
  }

  move(index: number, step: -1 | 1) {
    this.moved.emit({ index, step });
    const to = index + step;
    // Moving re-renders the row; refocus the pressed button, or its sibling once that one is disabled at the edge.
    const [pressed, other] = step === -1 ? ['Up', 'Down'] : ['Down', 'Up'];
    const atEdge = step === -1 ? to === 0 : to === this.rows().length - 1;
    this.focusLater(this.id(to, atEdge ? other : pressed));
  }

  remove(index: number) {
    const left = this.rows().length - 1;
    this.removed.emit(index);
    this.focusLater(left > 0 ? this.id(Math.min(index, left - 1), 'Remove') : this.addFocusTarget());
  }

  /** First enabled button in the add area: the upload button. */
  private addFocusTarget(): string {
    return `${this.idPrefix()}Add`;
  }

  private focusLater(id: string) {
    setTimeout(() => {
      const el = document.getElementById(id);
      const target = el?.matches('button, input') ? el : el?.querySelector<HTMLElement>('button:not([disabled])');
      target?.focus();
    });
  }
}
