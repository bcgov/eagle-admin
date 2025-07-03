import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { SearchService } from 'src/app/services/search.service';

@Injectable()
export class EditContactResolver  {
  private searchService = inject(SearchService);


  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const contactId = route.paramMap.get('contactId');
    return this.searchService.getItem(contactId, 'User');
  }
}
