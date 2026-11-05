import { Component, OnInit, DestroyRef, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, from } from 'rxjs';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { ProjectExtensionLists, ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from '../../utils/navigation-stack-utils';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from '../../utils/utils';
import { LoggingService } from 'src/app/services/logging.service';
import { ToastService } from 'src/app/services/toast.service';

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
  protected router = inject(Router);
  private route = inject(ActivatedRoute);
  protected navigationStackUtils = inject(NavigationStackUtils);
  private modalService = inject(NgbModal);
  api = inject(ProjectService);
  private storageService = inject(StorageService);
  private logger = inject(LoggingService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  public loading = false;
  public saving = signal(false);
  private projectId: string;
  public extensionType = 'Extension';
  public extensionOperation = 'Add';
  public navigationObject;
  public extensionForm: FormGroup<{
    appliedTo: FormControl<string | null>;
    start: FormControl<unknown>;
    end: FormControl<unknown>;
  }>;
  public isEditing = false;

  ngOnInit() {
    this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    this.projectId = this.route.parent.snapshot.paramMap.get('projId');

    const path = this.route.snapshot.routeConfig?.path ?? '';
    this.extensionType = path.includes('-extension') ? 'Extension' : 'Suspension';
    this.extensionOperation = path.includes('add-') ? 'Add' : 'Edit';

    if (this.storageService.state.extension) {
      this.isEditing = true;
      const ext = this.storageService.state.extension;
      this.extensionForm = new FormGroup({
        'appliedTo': new FormControl<string | null>(ext.appliedTo),
        'start': new FormControl<unknown>(convertJSDateToNGBDate(new Date(ext.start))),
        'end': new FormControl<unknown>(convertJSDateToNGBDate(new Date(ext.end)))
      });
    } else {
      this.extensionForm = new FormGroup({
        'appliedTo': new FormControl<string | null>(null),
        'start': new FormControl<unknown>(null),
        'end': new FormControl<unknown>(null)
      });
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
          this.write('delete', this.api.deleteExtension(this.project(), this.storageService.state.extension));
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

    if (this.storageService.state.extension) {
      this.write('edit', this.api.editExtension(this.project(), { new: newExtension, old: this.storageService.state.extension }));
    } else {
      this.write('add', this.api.addExtension(this.project(), newExtension));
    }
  }

  goBack() {
    this.storageService.state.extension = null;
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(['/p', this.projectId, 'edit']);
  }

  // The route id is the DEMI or Eagle id; the service reads the row fresh and writes on its DEMI id.
  private project() {
    return { _id: this.projectId };
  }

  private write(action: 'add' | 'edit' | 'delete', request: Observable<ProjectExtensionLists>) {
    this.saving.set(true);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.goBack(),
      error: error => {
        this.saving.set(false);
        this.logger.error(`${action} extension failed`, 'ExtensionComponent', error);
        this.toast.error(`Failed to ${action} extension. ${error.message}`);
      }
    });
  }

}
