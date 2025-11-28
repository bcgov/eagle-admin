import { Directive, ViewContainerRef, inject } from '@angular/core';

@Directive({
    selector: '[table-host]',
    standalone: true
})
export class TableDirective {
  viewContainerRef = inject(ViewContainerRef);
}
