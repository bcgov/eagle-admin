import { Type } from '@angular/core';

export interface TableColumn {
  name: string;
  value?: string;
  width: string;
  nosort?: boolean;
}

export class TableObject {
  constructor(
    public component: Type<any>,
    public data: any,
    public paginationData: any = null,
    public extraData: any = null
  ) { }
}
