import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/forkJoin';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class ProjectGroupResolver implements Resolve<Observable<object>> {
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
      '',
      { _id: groupId },
      false,
      {});
  }
}
