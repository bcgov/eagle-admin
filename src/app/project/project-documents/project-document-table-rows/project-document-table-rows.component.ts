import { Component, Input, Output, OnInit, EventEmitter, ChangeDetectorRef } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';
import { DocumentService } from 'app/services/document.service';
import { StorageService } from 'app/services/storage.service';
import { FavouriteService } from 'app/services/favourite.service';
import { ApiService } from 'app/services/api';

@Component({
  selector: 'tbody[app-document-table-rows]',
  templateUrl: './project-document-table-rows.component.html',
  styleUrls: ['./project-document-table-rows.component.scss']
})

export class DocumentTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Input() columnData: Array<any>;
  @Input() smallTable: boolean;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();
  @Output() updateFavourites: EventEmitter<any> = new EventEmitter<any>();

  public documents: any;
  public paginationData: any;
  public activeLegislationYear: number;
  public columns: any;
  public useSmallTable: boolean;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar,
    private documentService: DocumentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private storageService:  StorageService,
    public apiService: ApiService,
    public favouriteService: FavouriteService,
  ) { }

  ngOnInit() {
    this.documents = this.data.data;
    this.paginationData = this.data.paginationData;
    this.activeLegislationYear = this.data.extraData;
    this.columns = this.columnData;
    this.useSmallTable = this.smallTable;
    console.log(this.storageService);
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
          let message = error.status === 500 ? 'Document could not be validated. Please correct validation errors and try again.' : 'Maximum favorites is 5';
          // move the magic number '5' into a configuration
          // matching config value from service
          this.snackBar.open('Could not Favorite document: ' + message, '', {duration: 3000});
        }
      );
    }
  }

  editDocument(document) {
    const selectedDocs = [];

    if (this.documents) {
      let item = this.documents.filter(p => p._id === document._id)[0];
      selectedDocs.push(item);
    }

    // Store and send to the edit page.
    this.storageService.state.selectedDocs = selectedDocs;
    // Set labels if doc size === 1
    if (selectedDocs.length === 1) {
      this.storageService.state.labels = selectedDocs[0].labels;
    }
    this.router.navigate(['p', document.project._id, 'project-documents', 'edit']);
  }

  public addToFavourite(item, type: string = 'Document') {
    this.apiService.addFavourite(item, type)
      .then(() => {
        this.updateFavourites.emit({data: {type}, label: 'Update Favourite'});
      }).catch((err) => {
        console.log('error adding favourite', err);
      });
  }

  public removeFavourite(item) {
    this.apiService.removeFavourite(item)
      .then(() => {
        this.updateFavourites.emit({data: {type: 'Document'}, label: 'Update Favourite'});
      }).catch((err) => {
        console.log('error removing favourite', err);
      });
  }
}
