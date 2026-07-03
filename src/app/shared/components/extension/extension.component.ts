import { Component, OnInit, DestroyRef, inject, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbDatepickerModule } from '@ng-bootstrap/ng-bootstrap';
import { from } from 'rxjs';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { ProjectService } from 'src/app/services/project.service';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from '../../utils/navigation-stack-utils';
import { convertJSDateToNGBDate, convertFormGroupNGBDateToJSDate } from '../../utils/utils';
import { LoggingService } from 'src/app/services/logging.service';

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
  protected navigationStackUtils = inject(NavigationStackUtils);
  private modalService = inject(NgbModal);
  api = inject(ProjectService);
  private storageService = inject(StorageService);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  public loading = false;
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
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    } else {
      // this.router.navigate(['/']);
    }

    this.extensionType = this.storageService.state.extensionType.includes('-extension') ? 'Extension' : 'Suspension';
    this.extensionOperation = this.storageService.state.extensionType.includes('add-') ? 'Add' : 'Edit';

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
          this.api.deleteExtension(this.storageService.state.project, this.storageService.state.extension)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(
              () => this.goBack(),
              error => this.logger.error('delete extension failed', 'ExtensionComponent', error)
            );
        }
      },
      error: () => {
        // Modal dismissed, do nothing
      }
    });
  }

  onSubmit() {
    this.logger.debug('form submitted', 'ExtensionComponent', this.extensionForm.value);

    // Make api call to add this to the back-end.
    const newExtension = {
      type: this.extensionType,
      appliedTo: this.extensionForm.value.appliedTo,
      start: convertFormGroupNGBDateToJSDate(this.extensionForm.value.start),
      end: convertFormGroupNGBDateToJSDate(this.extensionForm.value.end)
    };

    if (this.storageService.state.extension) {
      const extensionObj = { new: newExtension, old: this.storageService.state.extension };
      this.logger.debug('updating extension', 'ExtensionComponent', extensionObj);
      this.api.editExtension(this.storageService.state.project, extensionObj)
        .subscribe(
          res => { this.logger.debug('extension updated', 'ExtensionComponent', res); this.goBack(); },
          err => this.logger.error('edit extension failed', 'ExtensionComponent', err)
        );
    } else {
      this.logger.debug('adding extension', 'ExtensionComponent', newExtension);
      this.api.addExtension(this.storageService.state.project, newExtension)
        .subscribe(
          res => { this.logger.debug('extension added', 'ExtensionComponent', res); this.goBack(); },
          err => this.logger.error('add extension failed', 'ExtensionComponent', err)
        );
    }
  }

  goBack() {
    this.storageService.state.extension = null;
    this.storageService.state.extensionType = null;
    const url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
  }

}
