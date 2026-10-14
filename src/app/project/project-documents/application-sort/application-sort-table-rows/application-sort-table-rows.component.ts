import { Component, OnInit, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { ListConverterPipe } from 'src/app/shared/pipes/list-converter.pipe';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-application-sort-table-rows]',
    templateUrl: './application-sort-table-rows.component.html',
    styleUrl: './application-sort-table-rows.component.css',
    imports: [DatePipe, ListConverterPipe, FormsModule],
    
})

export class ApplicationSortTableRowsComponent implements OnInit, TableComponent {
  private storageService = inject(StorageService);

  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();

  selectedCount = output<any>();

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

  updateSelectedCount(editedDoc: any): void {
    this.selectedCount.emit(editedDoc);
    const edited = this.storageService.state.editedDocs;
    if (Array.isArray(edited)) {
      // By `id`: rows not in Eagle yet all have no `_id`.
      const index = edited.findIndex((doc: any) => doc.id === editedDoc.id);
      if (index === -1) {
        edited.push(editedDoc);
      } else {
        edited[index] = editedDoc;
      }
    }
  }

}
