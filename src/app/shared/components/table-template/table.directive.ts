import { Directive, ViewContainerRef, inject } from '@angular/core';

@Directive({
    selector: '[table-host]',
    
})
export class TableDirective {
  viewContainerRef = inject(ViewContainerRef);
}
