import { Component, OnInit, OnDestroy, SimpleChanges, OnChanges, ViewEncapsulation, ChangeDetectionStrategy, input, output, viewChild } from '@angular/core';
import { NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { TableDirective } from './table.directive';
import { TableObject, TableColumn } from './table-object';
import { Constants } from '../../utils/constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-table-template',
  templateUrl: './table-template.component.html',
  styleUrl: './table-template.component.css',
  encapsulation: ViewEncapsulation.None,
  imports: [NgbPaginationModule, TableDirective],
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
  public selectAll = false;
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
    this.activePageSize = parseInt(this.data().paginationData.pageSize, 10);
    this.rebuildPageSizes();
    if (this.activePage !== parseInt(this.data().paginationData.currentPage, 10)) {
      this.activePage = parseInt(this.data().paginationData.currentPage, 10);
    }
    this.selectAllInit();
  }

  ngOnChanges(changes: SimpleChanges) {
    // only run when property "data" changed
    if (!changes['data']?.firstChange && changes['data'].currentValue) {
      this.data().component = changes['data'].currentValue.component;
      this.data().data = changes['data'].currentValue.data;
      this.data().paginationData = changes['data'].currentValue.paginationData;
      this.column = changes['data'].currentValue.paginationData.sortBy;
      this.activePageSize = parseInt(changes['data'].currentValue.paginationData.pageSize, 10);
      this.activePage = parseInt(changes['data'].currentValue.paginationData.currentPage, 10);
      this.data().extraData = changes['data'].currentValue.extraData;
      this.rebuildPageSizes();
      this.loadComponent();
    }
  }

  public sort(property: string) {
    this.onColumnSort.emit(property);
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

  public selectAction() {
    this.selectAll = !this.selectAll;

    let someSelected = false;

    if (this.data().data) {
      this.data().data.forEach(item => {
        if (item.checkbox === true) {
          someSelected = true;
        }
      });

      if (someSelected && this.selectAll) {
        this.selectAll = false;
      }
    }

    this.selectAllClicked.emit({ selectAll: this.selectAll });
  }

  public selectAllInit() {
    if (this.data().data) {
      const itemCount = this.data().data.length;
      let selectedCount = 0;

      this.data().data.forEach(item => {
        if (item.checkbox === true) {
          selectedCount += 1;
        }
      });

      this.selectAll = itemCount === selectedCount;
    }
  }

  private rebuildPageSizes() {
    const totalItems = parseInt(this.data().paginationData.totalListItems, 10);
    const base = [10, 25, 50, 100];
    this.pageSizeArray = (totalItems <= 500 ? [...base, totalItems] : base)
      .filter(n => n >= 10)
      .sort((a, b) => a - b);
  }
}
