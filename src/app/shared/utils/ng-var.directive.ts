import { Directive, Input, ViewContainerRef, TemplateRef } from '@angular/core';

//
// ref: https://stackoverflow.com/questions/38582293/how-to-declare-a-variable-in-a-template-in-angular2
//

@Directive({
    selector: '[ngVar]',
    standalone: false
})

export class VarDirective {
  context: any = {};

  @Input()
  set ngVar(context: any) {
    this.context.$implicit = this.context.ngVar = context;
    this.updateView();
  }

  constructor(private vcRef: ViewContainerRef, private templateRef: TemplateRef<any>) { }

  updateView() {
    this.vcRef.clear();
    this.vcRef.createEmbeddedView(this.templateRef, this.context);
  }
}
