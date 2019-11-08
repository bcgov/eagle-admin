import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { SearchService } from 'app/services/search.service';

@Injectable()
export class EditNotificationProjectResolver implements Resolve<Observable<object>> {
  constructor(
    private searchService: SearchService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const contactId = route.paramMap.get('contactId');
    return this.searchService.getItem(contactId, 'User');
  }
}
