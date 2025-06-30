import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';

@Component({
    selector: 'tbody[app-application-sort-table-rows]',
    templateUrl: './application-sort-table-rows.component.html',
    styleUrls: ['./application-sort-table-rows.component.scss'],
    standalone: false
})

export class ApplicationSortTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;

  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public documents: any;
  public paginationData: any;
  public columns: any;
  public useSmallTable: boolean;

  constructor(
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.documents = this.data.data;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
  }

  updateSelectedCount(editedDoc: any): void {
    this.selectedCount.emit(editedDoc);
    if (Array.isArray(this.storageService.state.editedDocs)) {
      // check if it exists already
      let docWasEditedPreviously = false;
      this.storageService.state.editedDocs.forEach((previouslyEditedDoc: any) => {
        if (previouslyEditedDoc._id === editedDoc._id) {
          // update entry
          previouslyEditedDoc = editedDoc;
          docWasEditedPreviously = true;
          return;
        }
      });

      if (!docWasEditedPreviously) {
        this.storageService.state.editedDocs.push(editedDoc);
      }
    }
  }

}
