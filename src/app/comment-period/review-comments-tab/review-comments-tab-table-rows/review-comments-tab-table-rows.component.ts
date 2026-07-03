import { Component, OnInit, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Router } from '@angular/router';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-review-comments-tab-table-rows]',
    templateUrl: './review-comments-tab-table-rows.component.html',
    styleUrl: './review-comments-tab-table-rows.component.css',
    imports: [DatePipe],
    
})

export class ReviewCommentsTabTableRowsComponent implements OnInit, TableComponent {
  private router = inject(Router);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();
  selectedCount = output<any>();

  public comments: any[];
  public paginationData: any;
  public projectId: string;
  public baseRouteUrl: string;
  public columns: TableColumn[];
  public useSmallTable: boolean;

  ngOnInit() {
    this.projectId = this.data().extraData.projectId;
    this.comments = this.data().data;
    this.paginationData = this.data().paginationData;
    this.baseRouteUrl = this.data().extraData.baseRouteUrl;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
  }

  goToItem(comment) {
    this.router.navigate([`${this.baseRouteUrl}/${this.projectId}/cp/${comment.period}/c/${comment._id}/comment-details`]);
  }
}
