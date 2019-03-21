import { Component, Input, OnInit, ComponentFactoryResolver, OnDestroy, ViewChild, Output, EventEmitter, SimpleChanges, OnChanges } from '@angular/core';

import { TableDirective } from './table.directive';
import { TableObject } from './table-object';
import { TableComponent } from './table.component';

@Component({
  selector: 'app-table-template',
  templateUrl: './table-template.component.html',
  styleUrls: ['./table-template.component.scss']
})
export class TableTemplateComponent implements OnInit, OnChanges, OnDestroy {
  @Input() data: TableObject;
  @Input() columns: any[];
  @ViewChild(TableDirective) tableHost: TableDirective;

  @Output() onPageNumUpdate: EventEmitter<any> = new EventEmitter();
  @Output() onColumnSort: EventEmitter<any> = new EventEmitter();
  public column: string = null;
  public direction = 0;

  interval: any;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.loadComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (!changes.firstChange && changes['data'].currentValue) {
      this.data.component = changes['data'].currentValue.component;
      this.data.data = changes['data'].currentValue.data;
      this.data.paginationData = changes['data'].currentValue.paginationData;
      this.direction = changes['data'].currentValue.paginationData.sortDirection;
      this.column = changes['data'].currentValue.paginationData.sortBy;
      this.loadComponent();
    }
  }

  public sort(property: string) {
    this.onColumnSort.emit(property);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
  }

  loadComponent() {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(this.data.component);

    let viewContainerRef = this.tableHost.viewContainerRef;
    viewContainerRef.clear();

    let componentRef = viewContainerRef.createComponent(componentFactory);
    (<TableComponent>componentRef.instance).data = this.data;
  }

  updatePageNumber(pageNum) {
    this.onPageNumUpdate.emit(pageNum);
  }
}
