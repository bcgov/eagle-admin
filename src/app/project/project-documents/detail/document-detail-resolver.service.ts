import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { DocumentService } from 'src/app/services/document.service';

@Injectable()
export class DocumentDetailResolver  {
  constructor(
    private documentService: DocumentService
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<object> {
    const docId = route.paramMap.get('docId');
    return this.documentService.getById(docId);
  }
}
