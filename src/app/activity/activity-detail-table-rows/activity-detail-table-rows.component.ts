import { Component, OnInit, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { Router } from '@angular/router';
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
  private router = inject(Router);
  private logger = inject(LoggingService);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();

  public entries: any;
  public paginationData: any;
  public columns: TableColumn[];
  public useSmallTable: boolean;

  async ngOnInit() {
    this.entries = this.data().data;
    this.paginationData = this.data().paginationData;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
  }

  goToItem(activity) {
    this.logger.debug('navigating to activity', 'ActivityDetailTableRowsComponent', { id: activity._id });
    this.router.navigate(['/activity', activity._id, 'edit']);
  }
}
