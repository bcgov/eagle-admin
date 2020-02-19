import { Component, Input, OnInit, ComponentFactoryResolver, OnDestroy, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges, ViewEncapsulation } from '@angular/core';

import { TableDirective } from './table.directive';
import { TableObject } from './table-object';
import { TableComponent } from './table.component';
import { Constants } from 'app/shared/utils/constants';

@Component({
  selector: 'app-table-template',
  templateUrl: './table-template.component.html',
  styleUrls: ['./table-template.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TableTemplateComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: TableObject;
  @Input() columns: any[];
  @Input() pageSizeArray: number[];
  @Input() activePageSize: number;
  @Input() activePage: number = Constants.tableDefaults.DEFAULT_CURRENT_PAGE;
  @ViewChild(TableDirective) tableHost: TableDirective;

  @Output() onPageNumUpdate: EventEmitter<any> = new EventEmitter();
  @Output() onItemClicked: EventEmitter<any> = new EventEmitter();
  @Output() onSelectedRow: EventEmitter<any> = new EventEmitter();
  @Output() onColumnSort: EventEmitter<any> = new EventEmitter();
  public column: string = null;

  interval: any;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
    this.activePageSize = parseInt(this.data.paginationData.pageSize, 10);
    const pageSizeTemp = [10, 25, 50, 100, parseInt(this.data.paginationData.totalListItems, 10)];
    this.pageSizeArray = pageSizeTemp.filter(function(el: number) { return el >= 10; });
    this.pageSizeArray.sort(function(a: number, b: number) { return a - b; });
    if (this.activePage !== parseInt(this.data.paginationData.currentPage, 10)) {
      this.activePage = parseInt(this.data.paginationData.currentPage, 10);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (!changes.firstChange && changes['data'].currentValue) {
      this.data.component = changes['data'].currentValue.component;
      this.data.data = changes['data'].currentValue.data;
      this.data.paginationData = changes['data'].currentValue.paginationData;
      this.column = changes['data'].currentValue.paginationData.sortBy;
      this.loadComponent();
    }
  }

  public sort(property: string) {
    this.onColumnSort.emit(property);
  }

  loadComponent() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.data.component);

    let viewContainerRef = this.tableHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<TableComponent>componentRef.instance).data = this.data;

    // Don't subscribe if it doesn't exist.
    if (componentRef.instance.selectedCount) {
      componentRef.instance.selectedCount.subscribe(msg => {
        this.onSelectedRow.emit(msg);
      });
    }

    if (componentRef.instance.onItemClicked) {
      componentRef.instance.onItemClicked.subscribe(msg => {
        this.onItemClicked.emit(msg);
      });
    }
  }

  updatePageNumber(pageNum) {
    this.onPageNumUpdate.emit(pageNum);
  }

  updatePageSize(pageSize) {
    this.data.paginationData.pageSize = pageSize;
    this.onPageNumUpdate.emit(this.activePage);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }
}
