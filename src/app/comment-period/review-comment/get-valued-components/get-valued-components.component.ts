import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { StorageService } from 'app/services/storage.service';
import { ValuedComponentService } from 'app/services/valued-component.service';

import { ValuedComponent } from 'app/models/valuedComponent';
import { GetValuedComponentTableRowsComponent } from './get-valued-component-table-rows/get-valued-component-table-rows.component';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { SearchTerms } from 'app/models/search';

@Component({
  selector: 'app-get-valued-components',
  templateUrl: './get-valued-components.component.html',
  styleUrls: ['./get-valued-components.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GetValuedComponentsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public valuedComponents: ValuedComponent[] = null;
  public terms = new SearchTerms();
  public loadingVCTable = true;

  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: '10%'
    },
    {
      name: 'Type',
      value: 'type',
      width: '20%'
    },
    {
      name: 'Title',
      value: 'title',
      width: '40%'
    },
    {
      name: 'Pillar',
      value: 'pillar',
      width: '15%'
    },
    {
      name: 'Parent',
      value: 'parent',
      width: '15%'
    }
  ];

  public tableParams: TableParamsObject = new TableParamsObject();

  public selectedCount = 0;
  public currentProjectId = '';

  public selectedVCs = [];

  constructor(
    private router: Router,
    private valuedComponentService: ValuedComponentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils,
    private storageService: StorageService
  ) { }

  ngOnInit() {
    this.currentProjectId = this.storageService.state.currentProject.data._id;
    this.selectedVCs = this.storageService.state.currentVCs.data;

    // get data from route resolver
    this.valuedComponentService.getAllByProjectId(this.currentProjectId)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          // We want to show everything in the list.
          this.tableParams.pageSize = res.totalCount;

          this.tableParams.currentPage = 1;
          this.tableParams.totalListItems = res.totalCount;

          if (this.tableParams.totalListItems > 0) {
            this.valuedComponents = res.data;
            this.setRowData();
            this.initCheckBoxes();
          } else {
            this.valuedComponents = [];
          }
          this.loadingVCTable = false;
          this._changeDetectionRef.detectChanges();
        } else {
          alert('Uh-oh, couldn\'t load valued components');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
      });
  }

  setRowData() {
    let vcList = [];
    if (this.valuedComponents && this.valuedComponents.length > 0) {
      this.valuedComponents.forEach(valuedComponent => {
        vcList.push(
          {
            type: valuedComponent.type,
            _id: valuedComponent._id,
            title: valuedComponent.title,
            pillar: valuedComponent.pillar,
            parent: valuedComponent.parent === null ? 'None' : valuedComponent.parent
          }
        );
      });
      this.tableData = new TableObject(
        GetValuedComponentTableRowsComponent,
        vcList,
        this.tableParams
      );
    }
  }

  setColumnSort(column) {
    if (this.tableParams.sortBy.charAt(0) === '+') {
      this.tableParams.sortBy = '-' + column;
    } else {
      this.tableParams.sortBy = '+' + column;
    }
    this.getPaginatedVCs(this.tableParams.currentPage);
  }

  getPaginatedVCs(pageNumber) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loadingVCTable = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.valuedComponentService.getAllByProjectId(this.currentProjectId, this.tableParams.currentPage, this.tableParams.pageSize, this.tableParams.sortBy)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.valuedComponents = res.data;
        this.setRowData();
        this.loadingVCTable = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  public initCheckBoxes() {
    this.tableData.data.map((item) => {
      if (this.selectedVCs.includes(item._id)) {
        item.checkbox = true;
        this.selectedCount++;
      }
    });
    this._changeDetectionRef.detectChanges();
  }

  isEnabled(button) {
    switch (button) {
      default:
        return this.selectedCount > 0;
        break;
    }
  }

  updateSelectedRow(count) {
    this.selectedCount = count;
    this.selectedVCs = this.storageService.state.currentVCs.data;
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
