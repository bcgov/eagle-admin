import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';

//
// ref: https://angular.io/guide/router#candeactivate-handling-unsaved-changes
//

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class CanDeactivateGuard  {
  canDeactivate(component: CanComponentDeactivate) {
    return component.canDeactivate ? component.canDeactivate() : true;
  }
}
