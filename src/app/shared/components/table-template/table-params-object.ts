import { Constants } from 'app/shared/utils/constants';

export class TableParamsObject {
  constructor(
    public pageSize: number = Constants.tableDefaults.DEFAULT_PAGE_SIZE,
    public currentPage: number = Constants.tableDefaults.DEFAULT_CURRENT_PAGE,
    public totalListItems: number = 0,
    public sortBy: string = Constants.tableDefaults.DEFAULT_SORT_BY,
    public keywords: string = '',
    public filter: any = {}
  ) { }
}
