import { Component, OnInit, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ListConverterPipe } from 'src/app/shared/pipes/list-converter.pipe';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-document-table-rows]',
    templateUrl: './project-notification-document-table-rows.component.html',
    styleUrl: './project-notification-document-table-rows.component.css',
    imports: [DatePipe, ListConverterPipe, RouterModule, FormsModule],
})

export class PnDocumentTableRowsComponent implements OnInit, TableComponent {
  private router = inject(Router);
  private toastService = inject(ToastService);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();
  selectedCount = output<any>();

  public documents: any;
  public paginationData: any;
  public activeLegislationYear: number;
  public columns: TableColumn[];
  public useSmallTable: boolean;

  ngOnInit() {
    this.documents = this.data().data;
    this.paginationData = this.data().paginationData;
    this.activeLegislationYear = 2018;

    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
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
      this.toastService.error('Uh-oh, couldn\'t open document');
    }
  }
}
