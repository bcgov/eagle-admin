import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';

import { SearchTerms } from 'app/models/search';
import { ValuedComponent } from 'app/models/valuedComponent';

import { DialogService } from 'ng2-bootstrap-modal';
import { StorageService } from 'app/services/storage.service';
import { ValuedComponentService } from 'app/services/valued-component.service';

import { TableObject } from 'app/shared/components/table-template/table-object';
import { TableParamsObject } from 'app/shared/components/table-template/table-params-object';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

import { ConfirmComponent } from 'app/confirm/confirm.component';
import { ValuedComponentTableRowsComponent } from './valued-component-table-rows/valued-component-table-rows.component';

@Component({
  selector: 'app-valued-components',
  templateUrl: './valued-components.component.html',
  styleUrls: ['./valued-components.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValuedComponentsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public valuedComponents: ValuedComponent[] = null;
  public terms = new SearchTerms();
  public loading = true;

  public tableData: TableObject;
  public tableColumns: any[] = [
    {
      name: '',
      value: 'check',
      width: 'col-1',
      nosort: true
    },
    {
      name: 'Type',
      value: 'type',
      width: 'col-3'
    },
    {
      name: 'Title',
      value: 'title',
      width: 'col-5'
    },
    {
      name: 'Pillar',
      value: 'pillar',
      width: 'col-2'
    },
    {
      name: 'Parent',
      value: 'parent',
      width: 'col-2',
      nosort: true
    }
  ];

  public tableParams: TableParamsObject = new TableParamsObject();

  public selectedCount = 0;
  public currentProject;

  constructor(
    private _changeDetectionRef: ChangeDetectorRef,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private router: Router,
    private storageService: StorageService,
    private tableTemplateUtils: TableTemplateUtils,
    private valuedComponentService: ValuedComponentService
  ) { }

  ngOnInit() {
    this.currentProject = this.storageService.state.currentProject.data;

    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.tableParams.totalListItems = res.valuedComponents.totalCount;
          if (this.tableParams.totalListItems > 0) {
            this.valuedComponents = res.valuedComponents.data;
          } else {
            this.tableParams.totalListItems = 0;
            this.valuedComponents = [];
          }
          this.setRowData();
          this.loading = false;
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
        ValuedComponentTableRowsComponent,
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
    this.loading = true;

    this.tableParams = this.tableTemplateUtils.updateTableParams(this.tableParams, pageNumber, this.tableParams.sortBy);

    this.valuedComponentService.getAllByProjectId(this.currentProject._id, pageNumber, this.tableParams.pageSize, this.tableParams.sortBy)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.tableParams.totalListItems = res.totalCount;
        this.valuedComponents = res.data;
        this.tableTemplateUtils.updateUrl(this.tableParams.sortBy, this.tableParams.currentPage, this.tableParams.pageSize);
        this.setRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  public selectAction(action) {
    // select all valuedComponents
    switch (action) {
      case 'selectAll':
        let someSelected = false;
        this.tableData.data.map((item) => {
          if (item.checkbox === true) {
            someSelected = true;
          }
          item.checkbox = !someSelected;
        });

        this.selectedCount = someSelected ? 0 : this.tableData.data.length;
        this._changeDetectionRef.detectChanges();
        break;
      case 'delete':
        this.delete();
        break;
      case 'addNew':
        this.router.navigate(['p', this.currentProject._id, 'valued-components', 'add']);
        break;
    }
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
  }

  delete() {
    this.dialogService.addDialog(ConfirmComponent,
      {
        title: 'Delete Document',
        message: 'Click <strong>OK</strong> to delete this Document or <strong>Cancel</strong> to return to the list.'
      }, {
        backdropColor: 'rgba(0, 0, 0, 0.5)'
      })
      .takeUntil(this.ngUnsubscribe)
      .subscribe(
        isConfirmed => {
          if (isConfirmed) {
            this.loading = true;
            // Delete the Document(s)
            let itemsToDelete = [];
            this.tableData.data.map((item) => {
              if (item.checkbox === true) {
                itemsToDelete.push({ promise: this.valuedComponentService.delete(item).toPromise(), item: item });
              }
            });
            this.loading = false;
            return Promise.all(itemsToDelete).then(() => {
              // Reload main page.
              this.onSubmit();
            });
          }
          this.loading = false;
        }
      );
  }

  onSubmit() {
    // dismiss any open snackbar
    // if (this.snackBarRef) { this.snackBarRef.dismiss(); }

    // NOTE: Angular Router doesn't reload page on same URL
    // REF: https://stackoverflow.com/questions/40983055/how-to-reload-the-current-route-with-the-angular-2-router
    // WORKAROUND: add timestamp to force URL to be different than last time

    const params = this.terms.getParams();
    params['ms'] = new Date().getMilliseconds();
    params['dataset'] = this.terms.dataset;
    params['currentPage'] = this.tableParams.currentPage = 1;
    params['sortBy'] = this.tableParams.sortBy = '';

    console.log('params =', params);
    console.log('nav:', ['p', this.currentProject._id, 'valued-components', params]);
    this.router.navigate(['p', this.currentProject._id, 'valued-components', params]);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
