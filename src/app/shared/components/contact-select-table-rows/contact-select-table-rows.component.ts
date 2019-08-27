import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { TableObject } from '../table-template/table-object';
import { StorageService } from 'app/services/storage.service';
import { Router } from '@angular/router';
import { NavigationStackUtils } from 'app/shared/utils/navigation-stack-utils';

@Component({
  selector: 'app-contact-select-table-rows',
  templateUrl: './contact-select-table-rows.component.html',
  styleUrls: ['./contact-select-table-rows.component.scss']
})

export class ContactSelectTableRowsComponent implements OnInit {

  @Input() data: TableObject;
  @Output() selectedCount: EventEmitter<any> = new EventEmitter();

  public contacts: any;
  public paginationData: any;

  constructor(
    private navigationStackUtils: NavigationStackUtils,
    private storageService: StorageService,
    private router: Router
  ) { }

  ngOnInit() {
    this.contacts = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  selectItem(item) {
    this.storageService.state.selectedContact = item;
    let url = this.navigationStackUtils.getLastBackUrl();
    this.navigationStackUtils.popNavigationStack();
    this.router.navigate(url);
  }
}
