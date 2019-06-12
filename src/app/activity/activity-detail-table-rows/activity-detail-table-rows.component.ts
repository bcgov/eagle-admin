import { Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { DialogService } from 'ng2-bootstrap-modal';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';

import { RecentActivityService } from 'app/services/recent-activity';

import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
  selector: 'tbody[app-activity-detail-table-rows]',
  templateUrl: './activity-detail-table-rows.component.html',
  styleUrls: ['./activity-detail-table-rows.component.scss']
})

export class ActivityDetailTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;

  public entries: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private dialogService: DialogService,
    private recentActivityService: RecentActivityService,
  ) { }

  async ngOnInit() {
    this.entries = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  deleteActivity(activity) {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Delete Activity',
        message: 'Click <strong>OK</strong> to delete this Activity or <strong>Cancel</strong> to return to the list.'
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
                  this.entries.splice(this.entries.indexOf(activity), 1);
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
    console.log('activity:', activity);
    this.router.navigate(['/activity', activity._id, 'edit']);
  }
}
