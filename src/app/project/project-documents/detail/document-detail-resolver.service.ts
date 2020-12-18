import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { DocumentService } from 'app/services/document.service';

@Injectable()
export class DocumentDetailResolver implements Resolve<Observable<object>> {
  constructor(
    private documentService: DocumentService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const docId = route.paramMap.get('docId');
    return this.documentService.getById(docId);
  }
}
