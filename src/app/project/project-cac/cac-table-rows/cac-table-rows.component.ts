import { Component, Input, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { DialogService } from 'ng2-bootstrap-modal';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { TableComponent } from 'app/shared/components/table-template/table.component';
import { ConfirmComponent } from 'app/confirm/confirm.component';

import { RecentActivityService } from 'app/services/recent-activity';

import { TableObject } from 'app/shared/components/table-template/table-object';

@Component({
  selector: 'tbody[app-cac-table-rows]',
  templateUrl: './cac-table-rows.component.html',
  styleUrls: ['./cac-table-rows.component.scss']
})

export class CACTableRowsComponent implements OnInit, OnDestroy, TableComponent {
  @Input() data: TableObject;

  public entries: any;
  public paginationData: any;
  public dropdownItems = ['Edit', 'Delete'];

  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private router: Router,
    private dialogService: DialogService,
    private recentActivityService: RecentActivityService,
  ) { }

  async ngOnInit() {
    this.entries = this.data.data;
    this.paginationData = this.data.paginationData;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
