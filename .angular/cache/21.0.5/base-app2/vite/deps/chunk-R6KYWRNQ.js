import {
  Directive,
  ElementRef,
  Input,
  NgModule,
  Renderer2,
  inject,
  setClassMetadata,
  ɵɵNgOnChangesFeature,
  ɵɵdefineDirective,
  ɵɵdefineInjector,
  ɵɵdefineNgModule
} from "./chunk-3CH24XTA.js";

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-transition-patch.mjs
var NzTransitionPatchDirective = class _NzTransitionPatchDirective {
  elementRef = inject(ElementRef);
  renderer = inject(Renderer2);
  hidden = null;
  setHiddenAttribute() {
    if (this.hidden) {
      if (typeof this.hidden === "string") {
        this.renderer.setAttribute(this.elementRef.nativeElement, "hidden", this.hidden);
      } else {
        this.renderer.setAttribute(this.elementRef.nativeElement, "hidden", "");
      }
    } else {
      this.renderer.removeAttribute(this.elementRef.nativeElement, "hidden");
    }
  }
  constructor() {
    this.renderer.setAttribute(this.elementRef.nativeElement, "hidden", "");
  }
  ngOnChanges() {
    this.setHiddenAttribute();
  }
  ngAfterViewInit() {
    this.setHiddenAttribute();
  }
  static ɵfac = function NzTransitionPatchDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzTransitionPatchDirective)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzTransitionPatchDirective,
    selectors: [["", "nz-button", ""], ["", "nz-icon", ""], ["nz-icon"], ["", "nz-menu-item", ""], ["", "nz-submenu", ""], ["nz-select-top-control"], ["nz-select-placeholder"], ["nz-input-group"]],
    inputs: {
      hidden: "hidden"
    },
    features: [ɵɵNgOnChangesFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzTransitionPatchDirective, [{
    type: Directive,
    args: [{
      selector: "[nz-button], [nz-icon], nz-icon, [nz-menu-item], [nz-submenu], nz-select-top-control, nz-select-placeholder, nz-input-group"
    }]
  }], () => [], {
    hidden: [{
      type: Input
    }]
  });
})();
var NzTransitionPatchModule = class _NzTransitionPatchModule {
  static ɵfac = function NzTransitionPatchModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzTransitionPatchModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzTransitionPatchModule,
    imports: [NzTransitionPatchDirective],
    exports: [NzTransitionPatchDirective]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzTransitionPatchModule, [{
    type: NgModule,
    args: [{
      imports: [NzTransitionPatchDirective],
      exports: [NzTransitionPatchDirective]
    }]
  }], null, null);
})();

export {
  NzTransitionPatchDirective,
  NzTransitionPatchModule
};
//# sourceMappingURL=chunk-R6KYWRNQ.js.map
