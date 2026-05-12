import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy, input, output, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { EMPTY, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConfirmComponent } from 'src/app/confirm/confirm.component';
import { ProjectService } from 'src/app/services/project.service';
import { RecentActivityService } from 'src/app/services/recent-activity';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { LoggingService } from 'src/app/services/logging.service';


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'tbody[app-pins-table-rows]',
  templateUrl: './pins-table-rows.component.html',
  styleUrl: './pins-table-rows.component.css',
})

export class PinsTableRowsComponent implements OnInit, TableComponent {
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private router = inject(Router);
  private modalService = inject(NgbModal);
  private recentActivityService = inject(RecentActivityService);
  private projectService = inject(ProjectService);
  private logger = inject(LoggingService);
  private destroyRef = inject(DestroyRef);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();
  selectedCount = output<any>();

  public contacts: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];
  public columns: TableColumn[];
  public useSmallTable: boolean;
  public projectId: string;

  async ngOnInit() {
    this.contacts = this.data().data;
    this.paginationData = this.data().paginationData;
    this.projectId = this.data().extraData.projectId;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
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

    from(modalRef.result).pipe(
      switchMap((isConfirmed: boolean) => {
        if (!isConfirmed) { return EMPTY; }
        return this.projectService.deletePin(this.projectId, pin._id);
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: () => {
        this.router.navigate(['/p', this.projectId, 'project-pins', { ms: Date.now() }]);
      },
      error: (error) => {
        // Modal dismissed (undefined) vs actual delete failure
        if (error !== undefined) {
          this.logger.error('delete pin failed', 'PinsTableRowsComponent', error);
        }
      }
    });
  }

  togglePin(activity) {
    activity.pinned = !activity.pinned;
    this.recentActivityService.save(activity)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this._changeDetectionRef.markForCheck();
        },
        error: error => {
          this.logger.error('save activity failed', 'PinsTableRowsComponent', error);
        }
      });
  }

  goToItem(activity) {
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
}
