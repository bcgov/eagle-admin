import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { ApiService } from 'src/app/services/api';
import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from '../../utils/navigation-stack-utils';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-extension',
  templateUrl: './extension.component.html',
  styleUrls: ['./extension.component.scss']
})
export class ExtensionComponent implements OnInit, OnDestroy {

  public loading = false;
  public extensionType = 'Extension';
  public extensionOperation = 'Add';
  public navigationObject;
  public extensionForm: FormGroup;
  public isEditing = false;
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private router: Router,
    private navigationStackUtils: NavigationStackUtils,
    private modalService: NgbModal,
    public api: ApiService,
    private storageService: StorageService,
    private utils: Utils,
  ) { }

  ngOnInit() {
    if (this.navigationStackUtils.getNavigationStack()) {
      this.navigationObject = this.navigationStackUtils.getLastNavigationObject();
    } else {
      // this.router.navigate(['/']);
    }

    this.extensionType = this.storageService.state.extensionType.includes('-extension') ? 'Extension' : 'Suspension' ;
    this.extensionOperation = this.storageService.state.extensionType.includes('add-') ? 'Add' : 'Edit' ;

    if (this.storageService.state.extension) {
      this.isEditing = true;
      this.extensionForm = new FormGroup({
        'appliedTo': new FormControl(this.storageService.state.extension.appliedTo),
        'start': new FormControl(),
        'end': new FormControl()
      });
      this.extensionForm.controls.start.setValue(this.utils.convertJSDateToNGBDate(new Date(this.storageService.state.extension.start)));
      this.extensionForm.controls.end.setValue(this.utils.convertJSDateToNGBDate(new Date(this.storageService.state.extension.end)));
    } else {
      this.extensionForm = new FormGroup({
        'appliedTo': new FormControl(),
        'start': new FormControl(),
        'end': new FormControl()
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

    from(modalRef.result).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (isConfirmed: boolean) => {
        if (isConfirmed) {
          this.api.deleteExtension(this.storageService.state.project, this.storageService.state.extension)
            .subscribe(
              () => this.goBack(),
              error => console.log('error =', error)
            );
        }
      },
      () => {
        // Modal dismissed, do nothing
      }
    );
  }

  onSubmit() {
    console.log('form:', this.extensionForm.value);

    // Make api call to add this to the back-end.
    if (this.storageService.state.extension) {
      // Editing mode
      // PUT project specific to extensions.
      let newExtension = {
        type: this.extensionType,
        appliedTo: this.extensionForm.value.appliedTo,
        start: this.utils.convertFormGroupNGBDateToJSDate(this.extensionForm.value.start),
        end: this.utils.convertFormGroupNGBDateToJSDate(this.extensionForm.value.end)
      };
      let extensionObj = {
        new: newExtension,
        old: this.storageService.state.extension
      };
      console.log('Update: ', extensionObj);
      let self = this;
      this.api.editExtension(this.storageService.state.project, extensionObj)
      .subscribe(res => {
        console.log('res:', res);
        self.goBack();
      }, err => {
        console.log('err', err);
      });
    } else {
      // New
      let newExtension = {
        type: this.extensionType,
        appliedTo: this.extensionForm.value.appliedTo,
        start: this.utils.convertFormGroupNGBDateToJSDate(this.extensionForm.value.start),
        end: this.utils.convertFormGroupNGBDateToJSDate(this.extensionForm.value.end)
      };
      console.log('Adding ', newExtension.type, ':', newExtension);
      let self = this;
      this.api.addExtension(this.storageService.state.project, newExtension)
      .subscribe(res => {
        console.log('res:', res);
        self.goBack();
      }, err => {
        console.log('err', err);
      });
    }
  }

  goBack() {
    this.storageService.state.extension = null;
    this.storageService.state.extensionType = null;
    let url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
