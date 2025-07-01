import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentService } from 'src/app/services/document.service';
import { TableObject } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { CommonModule } from '@angular/common';
import { ListConverterPipe } from 'src/app/shared/pipes/list-converter.pipe';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'tbody[app-document-table-rows]',
    templateUrl: './project-document-table-rows.component.html',
    styleUrls: ['./project-document-table-rows.component.scss'],
    standalone: true,
    imports: [CommonModule, ListConverterPipe, FormsModule],
})

export class DocumentTableRowsComponent implements OnInit, TableComponent {
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
    private snackBar: MatSnackBar,
    private documentService: DocumentService,
    private _changeDetectionRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.documents = this.data.data;
    this.paginationData = this.data.paginationData;
    this.activeLegislationYear = this.data.extraData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
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
      this.activeLegislationYear = null;
    }
    this.selectedCount.emit({ count, activeLegislationYear: this.activeLegislationYear });
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
    if (document.isFeatured) {
      this.documentService.unFeature(document._id).subscribe(
        () => {
          document.isFeatured = false;
          this._changeDetectionRef.detectChanges();
        },
        error => {
          console.log('error =', error);
          this.snackBar.open('Could not Un-Favorite document.', '', {duration: 3000});
        }
      );
    } else {
      this.documentService.feature(document._id).subscribe(
        () => {
          document.isFeatured = true;
          this._changeDetectionRef.detectChanges();
        },
        error => {
          console.log('error =', error);
          const message = error.status === 500 ? 'Document could not be validated. Please correct validation errors and try again.' : 'Maximum favorites is 5';
          // move the magic number '5' into a configuration
          // matching config value from service
          this.snackBar.open('Could not Favorite document: ' + message, '', {duration: 3000});
        }
      );
    }
  }
}
