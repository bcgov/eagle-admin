import { Component, OnInit, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { CommentStatsComponent } from 'src/app/shared/components/comment-stats/comment-stats.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-comment-periods-table-rows]',
    templateUrl: './comment-periods-table-rows.component.html',
    styleUrl: './comment-periods-table-rows.component.css',
    imports: [DatePipe, CommentStatsComponent],
})

export class CommentPeriodsTableRowsComponent implements OnInit, TableComponent {
    private router = inject(Router);

    data = input.required<TableObject>();
    columnData = input.required<TableColumn[]>();
    smallTable = input.required<boolean>();

    public commentPeriods: any;
    public paginationData: any;
    public baseRouteUrl: string;
    public columns: TableColumn[];
    public useSmallTable: boolean;

    ngOnInit() {
        this.commentPeriods = this.data().data;
        this.paginationData = this.data().paginationData;
        this.baseRouteUrl = this.data().extraData.baseRouteUrl;
        this.columns = this.columnData();
        this.useSmallTable = this.smallTable();
    }

    goToItem(commentPeriod) {
        if (commentPeriod.isMet && commentPeriod.metURLAdmin) {
            window.open(commentPeriod.metURLAdmin, '_blank');
        } else {
            this.router.navigate([`${this.baseRouteUrl}/${commentPeriod.project}/cp/${commentPeriod._id}/comment-period-details`]);
        }
    }
}
