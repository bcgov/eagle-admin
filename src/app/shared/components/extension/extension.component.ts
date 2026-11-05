import { Component, OnInit, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, from } from 'rxjs';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { ProjectExtensionLists, ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from '../../utils/utils';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';

const DONE = { add: 'added', edit: 'saved', delete: 'deleted' } as const;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-extension',
  templateUrl: './extension.component.html',
  styleUrl: './extension.component.css',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgbDatepickerModule
]
})
export class ExtensionComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private modalService = inject(NgbModal);
  api = inject(ProjectService);
  private storageService = inject(StorageService);
  private logger = inject(LoggingService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  public saving = signal(false);
  private projectId: string;
  public extensionType = 'Extension';
  public extensionOperation = 'Add';
  public extensionForm: FormGroup<{
    appliedTo: FormControl<string | null>;
    start: FormControl<unknown>;
    end: FormControl<unknown>;
  }>;
  public isEditing = false;
  // The item the edit page picked; null unless it belongs to this route's project.
  private picked: { id: string } | null = null;

  ngOnInit() {
    this.projectId = this.route.parent.snapshot.paramMap.get('projId');
    const [, operation, type] = /^edit\/(add|edit)-(extension|suspension)$/.exec(this.route.snapshot.routeConfig?.path ?? '') ?? [];
    this.extensionType = type === 'suspension' ? 'Suspension' : 'Extension';
    this.extensionOperation = operation === 'edit' ? 'Edit' : 'Add';
    this.isEditing = operation === 'edit';

    const stored = this.storageService.state.extension;
    const ext = this.isEditing && stored?.projectId === this.projectId ? stored : null;
    this.picked = ext;
    // A stored item outlives a Back button or breadcrumb exit otherwise, and would open on another project.
    this.destroyRef.onDestroy(() => this.storageService.state.extension = null);
    this.extensionForm = new FormGroup({
      'appliedTo': new FormControl<string | null>(ext?.appliedTo ?? null),
      'start': new FormControl<unknown>(ext ? convertJSDateToNGBDate(new Date(ext.start)) : null),
      'end': new FormControl<unknown>(ext ? convertJSDateToNGBDate(new Date(ext.end)) : null)
    });

    if (!operation) {
      this.goBack();
    } else if (this.isEditing && !ext) {
      this.toast.error(`No ${this.kind()} selected to edit.`);
      this.goBack();
    }
  }

  public onDelete() {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      backdropClass: 'custom-backdrop',
      centered: true
    });

    modalRef.componentInstance.title = `Delete ${this.extensionType}`;
    modalRef.componentInstance.message = `Click <strong>OK</strong> to delete this ${this.extensionType}`;
    modalRef.componentInstance.okOnly = false;

    from(modalRef.result).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (isConfirmed: boolean) => {
        if (isConfirmed) {
          this.write('delete', this.api.deleteExtension(this.project(), this.picked));
        }
      },
      error: () => {
        // Modal dismissed, do nothing
      }
    });
  }

  onSubmit() {
    this.logger.debug('form submitted', 'ExtensionComponent', this.extensionForm.value);

    const newExtension = {
      type: this.extensionType,
      appliedTo: this.extensionForm.value.appliedTo,
      start: convertFormGroupNGBDateToJSDate(this.extensionForm.value.start),
      end: convertFormGroupNGBDateToJSDate(this.extensionForm.value.end)
    };

    if (this.isEditing) {
      this.write('edit', this.api.editExtension(this.project(), { new: newExtension, old: this.picked }));
    } else {
      this.write('add', this.api.addExtension(this.project(), newExtension));
    }
  }

  goBack() {
    this.storageService.state.extension = null;
    this.router.navigate(['/p', this.projectId, 'edit']);
  }

  private kind() {
    return this.extensionType.toLowerCase();
  }

  // The route id is the DEMI or Eagle id; the service reads the row fresh and writes on its DEMI id.
  private project() {
    return { _id: this.projectId };
  }

  private write(action: 'add' | 'edit' | 'delete', request: Observable<ProjectExtensionLists>) {
    this.saving.set(true);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.toast.success(`${this.extensionType} ${DONE[action]}.`);
        this.goBack();
      },
      error: error => {
        this.saving.set(false);
        this.logger.error(`${action} ${this.kind()} failed`, 'ExtensionComponent', error);
        this.toast.error(`Failed to ${action} ${this.kind()}. ${error.message}`);
      }
    });
  }

}
