import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'tbody[app-application-sort-table-rows]',
  templateUrl: './application-sort-table-rows.component.html',
  styleUrls: ['./application-sort-table-rows.component.scss']
})

export class ApplicationSortTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public documents: any;
  public paginationData: any;

  constructor(
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.documents = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  updateSelectedCount(editedDoc: any): void {
    this.selectedCount.emit(editedDoc);
    if (this.storageService.state.editedDocs || this.storageService.state.editedDocs === []) {
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
