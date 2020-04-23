import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'tbody[app-document-table-rows]',
  templateUrl: './project-notification-document-table-rows.component.html',
  styleUrls: ['./project-notification-document-table-rows.component.scss']
})

export class PnDocumentTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public documents: any;
  public paginationData: any;
  public activeLegislationYear: number;
  public columns: any;
  public useSmallTable: boolean;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.documents = this.data.data;
    this.paginationData = this.data.paginationData;
    this.activeLegislationYear = 2018;

    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  selectItem(item) {
    item.checkbox = !item.checkbox;
    let count = 0;
    this.documents.forEach(doc => {
      if (doc.checkbox === true) {
        count++;
      }
    });
    this.selectedCount.emit({ count, activeLegislationYear: 2018 });
  }

  goToItem(item) {
    this.activeLegislationYear = 0;
    // This happens when the api has not done the lookup on the project id
    // And we get just the string back and not the project object
    if (item.project && typeof item.project === 'object' && '_id' in item.project) {
      this.router.navigate(['pn', item.project._id, 'project-notification-documents', 'detail', item._id]);
    } else {
      this.snackBar.open('Uh-oh, couldn\'t open document', 'Close');
    }
  }
}
