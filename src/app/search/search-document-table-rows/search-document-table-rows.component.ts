import { Component, OnInit, inject, ChangeDetectionStrategy, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ListConverterPipe } from 'src/app/shared/pipes/list-converter.pipe';

import { Router } from '@angular/router';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-document-table-rows]',
    templateUrl: './search-document-table-rows.component.html',
    styleUrl: './search-document-table-rows.component.css',
    imports: [DatePipe, ListConverterPipe],
})

export class SearchDocumentTableRowsComponent implements OnInit, TableComponent {
  private router = inject(Router);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();

  public documents: any;
  public paginationData: any;
  public activeLegislationYear: number;
  public columns: TableColumn[];
  public useSmallTable: boolean;

  ngOnInit() {
    this.documents = this.data().data;
    this.paginationData = this.data().paginationData;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
  }

  goToItem(item) {
    this.activeLegislationYear = 0;
    // This happens when the api has not done the lookup on the project id
    // And we get just the string back and not the project object
    if (item.project && typeof item.project === 'object' && '_id' in item.project) {
      this.router.navigate(['p', item.project._id, 'project-documents', 'detail', item._id]);
    }
  }

}
