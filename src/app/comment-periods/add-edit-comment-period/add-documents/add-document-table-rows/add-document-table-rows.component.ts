import { Component, Input, Output, OnInit, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorageService } from 'src/app/services/storage.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { FormsModule } from '@angular/forms';
import { ListConverterPipe } from 'src/app/shared/pipes/list-converter.pipe';

@Component({
    selector: 'tbody[app-add-document-table-rows]',
    templateUrl: './add-document-table-rows.component.html',
    styleUrls: ['./add-document-table-rows.component.css'],
    standalone: true,
    imports: [CommonModule, FormsModule, ListConverterPipe],
})

export class AddDocumentTableRowsComponent implements OnInit, TableComponent {
  private storageService = inject(StorageService);

  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public documents: any;
  public paginationData: any;
  public columns: any;
  public useSmallTable: boolean;

  ngOnInit() {
    this.documents = this.data.data;
    this.paginationData = this.data.paginationData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;

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
