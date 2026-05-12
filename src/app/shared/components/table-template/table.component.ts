import { InputSignal } from '@angular/core';
import { TableColumn } from './table-object';

export interface TableComponent {
    data: any;
    columnData: InputSignal<TableColumn[]>;
    smallTable: any;
  }
