import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
  selector: 'tbody[app-activity-table-rows]',
  templateUrl: './activity-table-rows.component.html',
  styleUrls: ['./activity-table-rows.component.scss']
})

export class ActivityTableRowsComponent implements OnInit, OnDestroy, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;

  public entries: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public columns: any;
  public useSmallTable: boolean;

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private modalService: NgbModal,
    private recentActivityService: RecentActivityService,
  ) { }

  async ngOnInit() {
    this.entries = this.data.data;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  deleteActivity(activity) {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
    });
    modalRef.componentInstance.title = 'Delete Activity';
    modalRef.componentInstance.message = 'Click <strong>OK</strong> to delete this Activity or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    modalRef.result
       .then(isConfirmed => {
          if (isConfirmed) {
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
        })
        .catch(() => {
          // Modal dismissed
        });
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
