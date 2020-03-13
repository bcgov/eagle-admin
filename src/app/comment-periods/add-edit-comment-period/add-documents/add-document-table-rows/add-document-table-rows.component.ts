import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'tbody[app-add-document-table-rows]',
  templateUrl: './add-document-table-rows.component.html',
  styleUrls: ['./add-document-table-rows.component.scss']
})

export class AddDocumentTableRowsComponent implements OnInit, TableComponent {
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

    if (this.storageService.state.selectedDocumentsForCP.data.length > 0) {
      this.documents.forEach(doc => {
        this.storageService.state.selectedDocumentsForCP.data.forEach(selectedDoc => {
          if (doc._id === selectedDoc._id) {
            doc.checkbox = true;
          }
        });
      });
    }
  }

  selectItem(item) {
    item.checkbox = !item.checkbox;
    if (item.checkbox) {
      this.storageService.state.selectedDocumentsForCP.data.push(item);
    } else {
      this.storageService.state.selectedDocumentsForCP.data = this.storageService.state.selectedDocumentsForCP.data.filter(obj => obj._id !== item._id);
    }

    let count = 0;
    this.documents.map(doc => {
      if (doc.checkbox === true) {
        count++;
      }
    });
    this.selectedCount.emit(count);
  }

  // TODO: Re-enable this with correct routing.
  // goToItem(item) {
  //   this.router.navigate(['p', item.project, 'project-documents', 'detail', item._id]);
  // }
}
