import { Component, Input, OnInit, ChangeDetectorRef, EventEmitter, Output, OnDestroy } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { ConfirmComponent } from 'app/confirm/confirm.component';
import { DialogService } from 'ng2-bootstrap-modal';
import { Subject } from 'rxjs';
import { RecentActivityService } from 'app/services/recent-activity';

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

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private dialogService: DialogService,
    private recentActivityService: RecentActivityService,
  ) { }

  async ngOnInit() {
    this.contacts = this.data.data;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  deleteActivity(activity) {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Delete Participating Indigenous Nation',
        message: 'Click <strong>OK</strong> to delete this Participating Indigenous Nation or <strong>Cancel</strong> to return to the list.',
        okOnly: false
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            // Delete the Activity
            this.recentActivityService.delete(activity)
              .subscribe(
                () => {
                  this.contacts.splice(this.contacts.indexOf(activity), 1);
                  this._changeDetectionRef.detectChanges();
                },
                error => {
                  console.log('error =', error);
                });
          }
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
