import { Type } from '@angular/core';

export class TableObject {
  constructor(
    public component: Type<any>,
    public data: any,
    public paginationData: any = null,
    public extraData: any = null
  ) { }
}
