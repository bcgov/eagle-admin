import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';

import { DocumentService } from 'app/services/document.service';
import { ConfigService } from 'app/services/config.service';

@Injectable()
export class DocumentDetailResolver implements Resolve<Observable<object>> {
  constructor(
    private documentService: DocumentService,
    private configService: ConfigService
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<object> {
    const docId = route.paramMap.get('docId');
    // We need to make sure that getLists populates the configService. Then just returns the documentService getById
    return this.configService.getLists()
   .switchMap(_ => this.documentService.getById(docId));
  }
}
