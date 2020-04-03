import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class InspectionDetailResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const inspectionId = route.paramMap.get('inspectionId');
    // TODO: look into enabling caching again. For now its disabled
    return this.searchService.getItem(inspectionId, 'Inspection', false);
  }
}
