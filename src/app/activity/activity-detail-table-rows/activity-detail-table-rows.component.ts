import { Component, OnInit, ChangeDetectorRef, inject, DestroyRef, ChangeDetectionStrategy, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { DatePipe } from '@angular/common';
import { LoggingService } from 'src/app/services/logging.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-activity-detail-table-rows]',
    templateUrl: './activity-detail-table-rows.component.html',
    styleUrl: './activity-detail-table-rows.component.css',
    imports: [DatePipe],
})

export class ActivityDetailTableRowsComponent implements OnInit, TableComponent {
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private recentActivityService = inject(RecentActivityService);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();

  public entries: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public columns: TableColumn[];
  public useSmallTable: boolean;

  async ngOnInit() {
    this.entries = this.data().data;
    this.paginationData = this.data().paginationData;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
  }

  deleteActivity(activity) {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
      centered: true,
    });
    modalRef.componentInstance.title = 'Delete Activity';
    modalRef.componentInstance.message = 'Click <strong>OK</strong> to delete this Activity or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    modalRef.result
      .then(isConfirmed => {
        if (isConfirmed) {
          this.recentActivityService.delete(activity)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe({
                next: () => {
                  this.entries.splice(this.entries.indexOf(activity), 1);
                  this._changeDetectionRef.markForCheck();
                },
                error: error => {
                  this.logger.error('delete activity failed', 'ActivityDetailTableRowsComponent', error);
                }
              })
          }
        })
        .catch(() => {
          // Modal dismissed
        });
  }

  togglePin(activity) {
    activity.pinned = !activity.pinned;
    this.recentActivityService.save(activity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this._changeDetectionRef.markForCheck(); },
        error: error => this.logger.error('save activity failed', 'ActivityDetailTableRowsComponent', error)
      });
  }

  goToItem(activity) {
    this.logger.debug('navigating to activity', 'ActivityDetailTableRowsComponent', { id: activity._id });
    this.router.navigate(['/activity', activity._id, 'edit']);
  }
}
