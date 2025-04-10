import { Component, Input, OnInit, ChangeDetectorRef, EventEmitter, Output, OnDestroy } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { from, Subject } from 'rxjs';
import { RecentActivityService } from 'app/services/recent-activity';
import { ProjectService } from 'app/services/project.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'tbody[app-pins-table-rows]',
  templateUrl: './pins-table-rows.component.html',
  styleUrls: ['./pins-table-rows.component.scss']
})

export class PinsTableRowsComponent implements OnInit, OnDestroy, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public contacts: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public columns: any;
  public useSmallTable: boolean;
  public projectId: string;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal,
    private recentActivityService: RecentActivityService,
    private projectService: ProjectService
  ) { }

  async ngOnInit() {
    this.contacts = this.data.data;
    this.paginationData = this.data.paginationData;
    this.projectId = this.data.extraData.projectId;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  removeFromProject(pin) {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      backdropClass: 'custom-backdrop',
      centered: true
    });

    modalRef.componentInstance.title = 'Delete Participating Indigenous Nation';
    modalRef.componentInstance.message = 'Click <strong>OK</strong> to delete this Participating Indigenous Nation or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    from(modalRef.result).pipe(takeUntil(this.ngUnsubscribe)).subscribe(
      (isConfirmed: boolean) => {
        if (isConfirmed) {
          this.projectService.deletePin(this.projectId, pin._id)
            .subscribe(
              () => {
                this.contacts.splice(this.contacts.indexOf(pin), 1);
                this._changeDetectionRef.detectChanges();
              },
              error => {
                console.log('error =', error);
              });
        }
      },
      () => {
        // Modal dismissed
      }
    );
  }

  togglePin(activity) {
    activity.pinned === true ? activity.pinned = false : activity.pinned = true;
    this.recentActivityService.save(activity)
      .subscribe(
        () => {
          this._changeDetectionRef.detectChanges();
        },
        error => {
          console.log('error =', error);
        }
      );
  }

  goToItem(activity) {
    // console.log('activity:', activity);
    this.router.navigate(['/project-pins', activity._id, 'edit']);
  }

  selectItem(item) {
    item.checkbox = !item.checkbox;

    let count = 0;
    this.contacts.map(row => {
      if (row.checkbox === true) {
        count++;
      }
    });
    this.selectedCount.emit(count);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
