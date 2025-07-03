import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfigService } from 'src/app/services/config.service';
import { SearchService } from 'src/app/services/search.service';
import { Utils } from 'src/app/shared/utils/utils';

@Injectable()
export class ApplicationSortResolver  {
  private searchService = inject(SearchService);
  private configService = inject(ConfigService);
  private utils = inject(Utils);


  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const projectId = route.parent.paramMap.get('projId');
    const currentPage = route.params.currentPage ? route.params.currentPage : 1;
    const pageSize = route.params.pageSize ? route.params.pageSize : 10;
    const sortBy = route.params.sortBy && route.params.sortBy !== 'null' ? route.params.sortBy : '+sortOrder,-datePosted,+displayName';
    const keywords = route.params.keywords ? route.params.keywords : '';

    const tabModifier = this.utils.createProjectTabModifiers(this.configService.lists);
    return this.searchService.getSearchResults(
      keywords,
      'Document',
      [{ 'name': 'project', 'value': projectId }],
      currentPage,
      pageSize,
      sortBy,
      tabModifier,
      true
    );
  }
}
