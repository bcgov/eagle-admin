import { Directive, Input, ViewContainerRef, TemplateRef, inject } from '@angular/core';

//
// ref: https://stackoverflow.com/questions/38582293/how-to-declare-a-variable-in-a-template-in-angular2
//

@Directive({
    selector: '[ngVar]'
})
export class VarDirective {
  private vcRef = inject(ViewContainerRef);
  private templateRef = inject<TemplateRef<any>>(TemplateRef);

  context: any = {};

  @Input()
  set ngVar(context: any) {
    this.context.$implicit = this.context.ngVar = context;
    this.updateView();
  }

  updateView() {
    this.vcRef.clear();
    this.vcRef.createEmbeddedView(this.templateRef, this.context);
  }
}
