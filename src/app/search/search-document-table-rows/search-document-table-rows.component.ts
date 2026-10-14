import { Component, OnInit, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Router } from '@angular/router';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-document-table-rows]',
    templateUrl: './search-document-table-rows.component.html',
    styleUrl: './search-document-table-rows.component.css',
    imports: [DatePipe],
})

export class SearchDocumentTableRowsComponent implements OnInit, TableComponent {
  private router = inject(Router);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();

  public documents: any;
  public paginationData: any;
  public columns: TableColumn[];
  public useSmallTable: boolean;

  ngOnInit() {
    this.documents = this.data().data;
    this.paginationData = this.data().paginationData;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
  }

  goToItem(item) {
    if (!item.projectId) {
      return;
    }
    this.router.navigate(['p', item.projectId, 'project-documents', 'detail', item.id]);
  }

}
