import { Constants } from '../../utils/constants';

export class TableDocumentParamsObject {
  constructor(
    public pageSizeCategorized: number = Constants.tableDefaults.DEFAULT_PAGE_SIZE,
    public currentPageCategorized: number = Constants.tableDefaults.DEFAULT_CURRENT_PAGE,
    public totalListItemsCategorized: number = 0,
    public sortByCategorized: string = Constants.tableDefaults.DEFAULT_SORT_BY,
    public keywords: string = '',
    public filter: any = {}
  ) { }
}
