import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

import { Router } from '@angular/router';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
  selector: 'tbody[app-review-comments-tab-table-rows]',
  templateUrl: './review-comments-tab-table-rows.component.html',
  styleUrls: ['./review-comments-tab-table-rows.component.scss']
})

export class ReviewCommentsTabTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public comments: Comment[];
  public paginationData: any;
  public projectId: string;
  public baseRouteUrl: string;
  public columns: any;
  public useSmallTable: boolean;

  constructor(
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.projectId = this.storageService.state.currentProject.data._id;
    this.comments = this.data.data;
    this.paginationData = this.data.paginationData;
    this.baseRouteUrl = this.data.extraData.baseRouteUrl;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  goToItem(comment) {
    this.router.navigate([`${this.baseRouteUrl}/${this.projectId}/cp/${comment.period}/c/${comment._id}/comment-details`]);
  }
}
