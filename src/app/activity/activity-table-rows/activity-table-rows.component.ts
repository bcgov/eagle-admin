import { Component, OnInit, ChangeDetectorRef, inject, DestroyRef, ChangeDetectionStrategy, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { DatePipe } from '@angular/common';
import { LoggingService } from 'src/app/services/logging.service';
import { CommonModule } from '@angular/common';
import { ToastService } from 'src/app/services/toast.service';
import { StatusLabel, UPDATE_CONFLICT_MESSAGE, isConflict, statusLabel } from '../update-rules';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tbody[app-activity-table-rows]',
  templateUrl: './activity-table-rows.component.html',
  styleUrl: './activity-table-rows.component.css',
  imports: [DatePipe, CommonModule],
})

export class ActivityTableRowsComponent implements OnInit, TableComponent {
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private recentActivityService = inject(RecentActivityService);
  private logger = inject(LoggingService);
  private toastService = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();

  public entries: any;
  public paginationData: any;
  public statusClass: Record<StatusLabel, string> = {
    Published: 'active-flag',
    Scheduled: 'scheduled-flag',
    Draft: 'inactive-flag',
    Archived: 'inactive-flag'
  };
  public columns: TableColumn[];
  public useSmallTable: boolean;

  async ngOnInit() {
    this.entries = this.data().data;
    this.paginationData = this.data().paginationData;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
  }

  statusOf(entry): StatusLabel {
    return statusLabel(entry);
  }

  archiveActivity(activity) {
    const modalRef = this.modalService.open(ConfirmComponent, {
      backdrop: 'static',
    });
    modalRef.componentInstance.title = 'Archive Update';
    modalRef.componentInstance.message = 'Click <strong>OK</strong> to archive this Update and remove it from the public site, or <strong>Cancel</strong> to return to the list.';
    modalRef.componentInstance.okOnly = false;

    modalRef.result
      .then(isConfirmed => {
        if (isConfirmed) {
          this.recentActivityService.archive(activity)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                activity.status = 'archived';
                activity.active = false;
                this._changeDetectionRef.markForCheck();
              },
              error: error => {
                this.logger.error('archive activity failed', 'ActivityTableRowsComponent', error);
              }
            });
        }
      })
      .catch(() => {
        // Modal dismissed
      });
  }

  togglePin(activity) {
    this.recentActivityService.togglePin(activity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this._changeDetectionRef.markForCheck(); },
        error: error => {
          if (isConflict(error)) {
            this.toastService.error(UPDATE_CONFLICT_MESSAGE);
          }
          this.logger.error('save activity failed', 'ActivityTableRowsComponent', error);
          this._changeDetectionRef.markForCheck();
        }
      });
  }

  goToItem(activity) {
    this.logger.debug('navigating to activity', 'ActivityTableRowsComponent', { id: activity._id });
    this.router.navigate(['/activity', activity._id, 'edit']);
  }
}
