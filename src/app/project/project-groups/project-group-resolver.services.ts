import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';

@Injectable()
export class ProjectGroupResolver {
  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const groupId = route.paramMap.get('groupId');

    return this.searchService.getSearchResults(
      '',
      'Group',
      [],
      1,
      1,
      null,
      { _id: groupId },
      false,
      {},
      '');
  }
}
