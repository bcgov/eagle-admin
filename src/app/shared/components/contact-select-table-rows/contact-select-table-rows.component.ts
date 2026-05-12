import { Component, OnInit, inject, ChangeDetectionStrategy, input, output } from '@angular/core';
import { Router } from '@angular/router';

import { StorageService } from 'src/app/services/storage.service';
import { NavigationStackUtils } from '../../utils/navigation-stack-utils';
import { TableObject, TableColumn } from '../table-template/table-object';
import { TableComponent } from '../table-template/table.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-contact-select-table-rows',
    templateUrl: './contact-select-table-rows.component.html',
    styleUrl: './contact-select-table-rows.component.css',
})

export class ContactSelectTableRowsComponent implements OnInit, TableComponent {
  private navigationStackUtils = inject(NavigationStackUtils);
  private storageService = inject(StorageService);
  private router = inject(Router);


  data = input.required<TableObject>();
  columnData = input.required<TableColumn[]>();
  smallTable = input.required<boolean>();

  selectedCount = output<any>();

  public contacts: any;
  public paginationData: any;
  public columns: TableColumn[];
  public useSmallTable: boolean;

  ngOnInit() {
    this.contacts = this.data().data;
    this.paginationData = this.data().paginationData;
    this.columns = this.columnData();
    this.useSmallTable = this.smallTable();
  }

  selectItem(item) {
    this.storageService.state.selectedContact = item;
    if (this.navigationStackUtils.getNavigationStack()) {
      const url = this.navigationStackUtils.getLastBackUrl();
      this.navigationStackUtils.popNavigationStack();
      this.router.navigate(url);
    }
  }
}
