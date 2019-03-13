import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpInterceptor
} from '@angular/common/http';

import { KeycloakService } from 'app/services/keycloak.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private auth: KeycloakService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.auth.getToken() || '';
    // console.log('Interceptor Token:', authToken);
    request = request.clone({
      setHeaders: {
        'Authorization': 'Bearer ' + authToken
      }
    });
    return next.handle(request).pipe(
      map((resp: HttpResponse<any>) => {
        if (resp) {
          // console.log('interceptor header keys: ', resp.headers && resp.headers.get('x-total-count'));
          // console.log('interceptor X-Service-Name: ', resp.headers.get('X-Service-Name'));
        }
        return resp;
      })
    );
  }

}
