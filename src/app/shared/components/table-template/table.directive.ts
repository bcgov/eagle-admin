import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[table-host]',
    
})
export class TableDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
