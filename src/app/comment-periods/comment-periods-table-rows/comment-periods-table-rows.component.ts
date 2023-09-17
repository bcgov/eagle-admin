import { Component, Input, OnInit } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
    selector: 'tbody[app-comment-periods-table-rows]',
    templateUrl: './comment-periods-table-rows.component.html',
    styleUrls: ['./comment-periods-table-rows.component.scss']
})

export class CommentPeriodsTableRowsComponent implements OnInit, TableComponent {
    @Input() data: TableObject;
    @Input() columnData: Array<any>;
    @Input() smallTable: boolean;

    public commentPeriods: any;
    public paginationData: any;
    public baseRouteUrl: string;
    public columns: any;
    public useSmallTable: boolean;

    constructor(
        private router: Router
    ) { }

    ngOnInit() {
        this.commentPeriods = this.data.data;
        this.paginationData = this.data.paginationData;
        this.baseRouteUrl = this.data.extraData.baseRouteUrl;
        this.columns = this.columnData;
        this.useSmallTable = this.smallTable;
    }

    goToItem(commentPeriod) {
        if (commentPeriod.isMet && commentPeriod.metURL) {
            window.open(commentPeriod.metURL, '_blank');
        } else {
            this.router.navigate([`${this.baseRouteUrl}/${commentPeriod.project}/cp/${commentPeriod._id}/comment-period-details`]);
        }
    }
}
