import { Component, OnInit, OnDestroy, SimpleChanges, OnChanges, ViewEncapsulation, ChangeDetectionStrategy, input, output, viewChild } from '@angular/core';
import { NgbPaginationModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TableDirective } from './table.directive';
import { TableObject, TableColumn } from './table-object';
import { Constants } from '../../utils/constants';

import { FormsModule } from '@angular/forms';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-table-template',
  templateUrl: './table-template.component.html',
  styleUrl: './table-template.component.css',
  encapsulation: ViewEncapsulation.None,
  imports: [NgbPaginationModule, NgbDropdownModule, TableDirective, FormsModule],
})
export class TableTemplateComponent implements OnInit, OnChanges, OnDestroy {

  data = input.required<TableObject>();
  columns = input.required<TableColumn[]>();
  pageSizeArray: number[];
  activePageSize: number;
  activePage: number = Constants.tableDefaults.DEFAULT_CURRENT_PAGE;
  readonly tableHost = viewChild.required(TableDirective);

  onPageNumUpdate = output<any>();
  onUpdatePageSize = output<any>();
  onItemClicked = output<any>();
  onSelectedRow = output<any>();
  onColumnSort = output<any>();
  selectAllClicked = output<any>();

  public column: string = null;
  public interval: any;
  public mobileQuery: MediaQueryList;
  private mobileQueryListener: () => void;

  constructor() {
    // Detect when the app displays in mobile mode and reload the component.
    this.mobileQuery = window.matchMedia('(max-width: 600px)');
    this.mobileQueryListener = () => this.loadComponent();
    this.mobileQuery.addEventListener('change', this.mobileQueryListener);
  }

  ngOnInit() {
    this.column = this.data().paginationData.sortBy;
    this.loadComponent();
    this.activePageSize = parseInt(this.data().paginationData.pageSize, 10) || Constants.tableDefaults.DEFAULT_PAGE_SIZE;
    this.rebuildPageSizes();
    if (this.activePage !== parseInt(this.data().paginationData.currentPage, 10)) {
      this.activePage = parseInt(this.data().paginationData.currentPage, 10);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (!changes['data']?.firstChange && changes['data'].currentValue) {
      this.data().component = changes['data'].currentValue.component;
      this.data().data = changes['data'].currentValue.data;
      this.data().paginationData = changes['data'].currentValue.paginationData;
      this.column = changes['data'].currentValue.paginationData.sortBy;
      this.activePageSize = parseInt(changes['data'].currentValue.paginationData.pageSize, 10) || Constants.tableDefaults.DEFAULT_PAGE_SIZE;
      this.activePage = parseInt(changes['data'].currentValue.paginationData.currentPage, 10);
      this.data().extraData = changes['data'].currentValue.extraData;
      this.rebuildPageSizes();
      this.loadComponent();
    }
  }

  public sort(property: string) {
    this.onColumnSort.emit(property);
  }

  // Value for aria-sort, null when unsorted (ARIA allows it on one header); also drives the header arrow.
  // Whole sort matches multi-key columns (e.g. Contacts Name `lastName,+firstName`); falls back to the first key otherwise.
  public sortState(property: string): 'ascending' | 'descending' | null {
    const whole = this.column ?? '';
    if (whole.slice(1) === property) {
      return whole.charAt(0) === '+' ? 'ascending' : 'descending';
    }
    const primary = whole.split(',')[0] ?? '';
    if (primary.slice(1) !== property) {
      return null;
    }
    return primary.charAt(0) === '+' ? 'ascending' : 'descending';
  }

  loadComponent() {
    const viewContainerRef = this.tableHost().viewContainerRef;
    viewContainerRef.clear();

    const componentRef = viewContainerRef.createComponent(this.data().component);
    componentRef.setInput('data', this.data());
    componentRef.setInput('columnData', this.columns());
    componentRef.setInput('smallTable', this.mobileQuery.matches);

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
    this.activePageSize = pageSize;
    this.data().paginationData.pageSize = pageSize;
    this.onPageNumUpdate.emit(1);
  }

  ngOnDestroy() {
    clearInterval(this.interval);
    this.mobileQuery.removeEventListener('change', this.mobileQueryListener);
  }

  private get someSelected(): boolean {
    return !!this.data().data?.some(item => item.checkbox === true);
  }

  public get allSelected(): boolean {
    const rows = this.data().data;
    return !!rows?.length && rows.every(item => item.checkbox === true);
  }

  /** What a click does: consumers clear the selection when any row is checked, else check every row. */
  public get selectAllLabel(): string {
    return this.someSelected ? 'Clear selection' : 'Select all rows';
  }

  public selectAction() {
    this.selectAllClicked.emit({ selectAll: !this.someSelected });
  }

  private rebuildPageSizes() {
    const totalItems = parseInt(this.data().paginationData.totalListItems, 10);
    const base = [10, 25, 50, 100];
    this.pageSizeArray = (totalItems <= 500 ? [...base, totalItems] : base)
      .filter(n => n >= 10)
      .sort((a, b) => a - b);
  }

  getshowingStart(): number {
    return (this.activePage - 1) * this.activePageSize + 1;
  }

  getshowingEnd(): number {
    const total = parseInt(this.data().paginationData.totalListItems, 10) || 0;
    return Math.min(this.activePage * this.activePageSize, total);
  }

  updateSelectedCount(event: any) {
    void event;
  }
}
