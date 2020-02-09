import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { DocumentService } from 'app/services/document.service';

@Component({
  selector: 'tbody[app-document-table-rows]',
  templateUrl: './project-document-table-rows.component.html',
  styleUrls: ['./project-document-table-rows.component.scss']
})

export class DocumentTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public documents: any;
  public paginationData: any;
  public activeLegislationYear: number;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private documentService: DocumentService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.documents = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  selectItem(item) {
    if (this.activeLegislationYear && item && this.activeLegislationYear !== item.legislation) {
      alert('To use multi-edit, please select documents with the same legislation year.');
      return;
    }
    item.checkbox = !item.checkbox;
    let count = 0;
    this.documents.map(doc => {
      if (doc.checkbox === true) {
        count++;
        if (!this.activeLegislationYear) {
          this.activeLegislationYear = doc.legislation;
        }
      }
    });
    if (count === 0) {
      this.activeLegislationYear = 0;
    }
    this.selectedCount.emit(count);
  }

  goToItem(item) {
    this.activeLegislationYear = 0;
    // This happens when the api has not done the lookup on the project id
    // And we get just the string back and not the project object
    if (item.project && typeof item.project === 'object' && '_id' in item.project) {
      this.router.navigate(['p', item.project._id, 'project-documents', 'detail', item._id]);
    } else {
      this.snackBar.open('Uh-oh, couldn\'t open document', 'Close');
    }
  }

  favoriteDocument(document) {
    document.isFeatured = !document.isFeatured;
    this.documentService.update(document, document._id).subscribe(
      () => {
        this._changeDetectionRef.detectChanges();
      },
      error => {
        console.log('error =', error);
      }
    );
  }
}
