import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tbody[app-activity-table-rows]',
  templateUrl: './activity-table-rows.component.html',
  styleUrls: ['./activity-table-rows.component.css'],
  standalone: true,
  imports: [CommonModule],
})

export class ActivityTableRowsComponent implements OnInit, OnDestroy, TableComponent {
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private recentActivityService = inject(RecentActivityService);

  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;

  public entries: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public columns: any;
  public useSmallTable: boolean;

  private subscriptions = new Subscription();

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
    if (activity.pinned === true) {
      activity.pinned = false;
    } else {
      activity.pinned = true;
    }
    this.subscriptions.add(
      this.recentActivityService.save(activity)
        .subscribe({
          next: () => {
            this._changeDetectionRef.detectChanges();
          },
          error: error => {
            console.log('error =', error);
          }
        })
    );
  }

  goToItem(activity) {
    console.log('activity:', activity);
    this.router.navigate(['/activity', activity._id, 'edit']);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
