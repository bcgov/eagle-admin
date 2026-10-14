import { Component, OnInit, ChangeDetectorRef, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from 'src/app/services/toast.service';
import { DocumentService } from 'src/app/services/document.service';
import { TableObject, TableColumn } from 'src/app/shared/components/table-template/table-object';
import { TableComponent } from 'src/app/shared/components/table-template/table.component';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoggingService } from 'src/app/services/logging.service';
import { eagleWriteId } from 'src/app/models/demi/demi-ids';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'tbody[app-document-table-rows]',
    templateUrl: './project-document-table-rows.component.html',
    styleUrl: './project-document-table-rows.component.css',
    imports: [DatePipe, FormsModule, RouterModule],
})

export class DocumentTableRowsComponent implements OnInit, TableComponent {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private documentService = inject(DocumentService);
  private _changeDetectionRef = inject(ChangeDetectorRef);
  private logger = inject(LoggingService);

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
    this.activeLegislationYear = this.data().extraData;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
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
    this.router.navigate(['/p', item.projectEagleId, 'project-documents', 'detail', item.id]);
  }

  favoriteDocument(document) {
    const id = eagleWriteId(document);
    if (!id) {
      this.toastService.error('This document exists only in DEMI and cannot be featured here.');
    } else if (document.isFeatured) {
      this.documentService.unFeature(id).subscribe(
        () => {
          document.isFeatured = false;
          this._changeDetectionRef.markForCheck();
        },
        error => {
          this.logger.error('un-feature document failed', 'DocumentTableRowsComponent', error);
          this.toastService.error('Could not Un-Favorite document.');
        }
      );
    } else {
      this.documentService.feature(id).subscribe(
        () => {
          document.isFeatured = true;
          this._changeDetectionRef.markForCheck();
        },
        error => {
          this.logger.error('feature document failed', 'DocumentTableRowsComponent', error);
          const message = error.status === 500 ? 'Document could not be validated. Please correct validation errors and try again.' : 'Maximum favorites is 5';
          // move the magic number '5' into a configuration
          // matching config value from service
          this.toastService.error('Could not Favorite document: ' + message);
        }
      );
    }
  }
}
