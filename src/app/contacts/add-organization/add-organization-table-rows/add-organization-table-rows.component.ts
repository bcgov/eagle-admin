import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { Router } from '@angular/router';
import { StorageService } from 'app/services/storage.service';

@Component({
  selector: 'tbody[app-add-organization-table-rows]',
  templateUrl: './add-organization-table-rows.component.html',
  styleUrls: ['./add-organization-table-rows.component.scss']
})

export class AddOrganizationTableRowsComponent implements OnInit, TableComponent {
  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public organizations: any;
  public paginationData: any;

  constructor(
    private router: Router,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.organizations = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  selectItem(item) {
    this.storageService.state.selectedOrganization = item;
    if (!item.isEditing) {
      this.router.navigate(['/contacts', 'add']);
    } else {
      this.router.navigate(['/c', item.contactId, 'edit']);
    }
  }
}
