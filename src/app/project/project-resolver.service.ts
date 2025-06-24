import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { SearchService } from '../services/search.service';

@Injectable()
export class ProjectResolver implements Resolve<Object> {

  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<Object> {
    const projId = route.paramMap.get('projId');
    const start = new Date();
    const end = new Date();
    start.setDate(start.getDate() - 7);
    end.setDate(end.getDate() + 7);
    // We to update getSearchResults to also grab the ExtraAppData to populate the responsibleEPD
    return this.searchService.getSearchResults(
      '',
      'Project',
      [],
      1,
      1,
      '',
      {_id: projId},
      true,
      {},
      ''
    );
  }
}
