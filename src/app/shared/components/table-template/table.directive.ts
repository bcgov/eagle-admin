import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[table-host]',
    standalone: false
})
export class TableDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
