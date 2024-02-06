import { Component, Input, OnInit, } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';

@Component({
  selector: 'tbody[app-document-table-rows]',
  templateUrl: './search-document-table-rows.component.html',
  styleUrls: ['./search-document-table-rows.component.scss']
})

export class SearchDocumentTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;

  public documents: any;
  public paginationData: any;
  public activeLegislationYear: number;
  public columns: any;
  public useSmallTable: boolean;

  constructor(
    private router: Router
  ) { }

  ngOnInit() {
    this.documents = this.data.data;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
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
