import { Directive, Input, ViewContainerRef, TemplateRef } from '@angular/core';

//
// ref: https://stackoverflow.com/questions/38582293/how-to-declare-a-variable-in-a-template-in-angular2
//

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[ngVar]'
})

export class VarDirective {
  @Input()
  set ngVar(context: any) {
    this.context.$implicit = this.context.ngVar = context;
    this.updateView();
  }

  context: any = {};

  constructor(private vcRef: ViewContainerRef, private templateRef: TemplateRef<any>) { }

  updateView() {
    this.vcRef.clear();
    this.vcRef.createEmbeddedView(this.templateRef, this.context);
  }
}
