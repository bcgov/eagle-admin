import {
  Platform
} from "./chunk-RSR3AMJM.js";
import {
  ANIMATION_MODULE_TYPE,
  CSP_NONCE,
  Directive,
  ElementRef,
  InjectionToken,
  Input,
  NgModule,
  NgZone,
  inject,
  makeEnvironmentProviders,
  setClassMetadata,
  ɵɵdefineDirective,
  ɵɵdefineInjector,
  ɵɵdefineNgModule
} from "./chunk-3CH24XTA.js";

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-wave.mjs
var NzWaveRenderer = class {
  triggerElement;
  ngZone;
  insertExtraNode;
  platform;
  cspNonce;
  waveTransitionDuration = 400;
  styleForPseudo = null;
  extraNode = null;
  lastTime = 0;
  clickHandler;
  get waveAttributeName() {
    return this.insertExtraNode ? "ant-click-animating" : "ant-click-animating-without-extra-node";
  }
  constructor(triggerElement, ngZone, insertExtraNode, platform, cspNonce) {
    this.triggerElement = triggerElement;
    this.ngZone = ngZone;
    this.insertExtraNode = insertExtraNode;
    this.platform = platform;
    this.cspNonce = cspNonce;
    this.clickHandler = this.onClick.bind(this);
    this.bindTriggerEvent();
  }
  onClick = (event) => {
    if (!this.triggerElement || !this.triggerElement.getAttribute || this.triggerElement.getAttribute("disabled") || event.target.tagName === "INPUT" || this.triggerElement.className.indexOf("disabled") >= 0) {
      return;
    }
    this.fadeOutWave();
  };
  bindTriggerEvent() {
    if (this.platform.isBrowser) {
      this.ngZone.runOutsideAngular(() => {
        this.removeTriggerEvent();
        if (this.triggerElement) {
          this.triggerElement.addEventListener("click", this.clickHandler, true);
        }
      });
    }
  }
  removeTriggerEvent() {
    if (this.triggerElement) {
      this.triggerElement.removeEventListener("click", this.clickHandler, true);
    }
  }
  removeStyleAndExtraNode() {
    if (this.styleForPseudo && document.body.contains(this.styleForPseudo)) {
      document.body.removeChild(this.styleForPseudo);
      this.styleForPseudo = null;
    }
    if (this.insertExtraNode && this.triggerElement.contains(this.extraNode)) {
      this.triggerElement.removeChild(this.extraNode);
    }
  }
  destroy() {
    this.removeTriggerEvent();
    this.removeStyleAndExtraNode();
  }
  fadeOutWave() {
    const node = this.triggerElement;
    const waveColor = this.getWaveColor(node);
    node.setAttribute(this.waveAttributeName, "true");
    if (Date.now() < this.lastTime + this.waveTransitionDuration) {
      return;
    }
    if (this.isValidColor(waveColor)) {
      if (!this.styleForPseudo) {
        this.styleForPseudo = document.createElement("style");
        if (this.cspNonce) {
          this.styleForPseudo.nonce = this.cspNonce;
        }
      }
      this.styleForPseudo.innerHTML = `
      [ant-click-animating-without-extra-node='true']::after, .ant-click-animating-node {
        --antd-wave-shadow-color: ${waveColor};
      }`;
      document.body.appendChild(this.styleForPseudo);
    }
    if (this.insertExtraNode) {
      if (!this.extraNode) {
        this.extraNode = document.createElement("div");
      }
      this.extraNode.className = "ant-click-animating-node";
      node.appendChild(this.extraNode);
    }
    this.lastTime = Date.now();
    this.runTimeoutOutsideZone(() => {
      node.removeAttribute(this.waveAttributeName);
      this.removeStyleAndExtraNode();
    }, this.waveTransitionDuration);
  }
  isValidColor(color) {
    return !!color && color !== "#ffffff" && color !== "rgb(255, 255, 255)" && this.isNotGrey(color) && !/rgba\(\d*, \d*, \d*, 0\)/.test(color) && color !== "transparent";
  }
  isNotGrey(color) {
    const match = color.match(/rgba?\((\d*), (\d*), (\d*)(, [.\d]*)?\)/);
    if (match && match[1] && match[2] && match[3]) {
      return !(match[1] === match[2] && match[2] === match[3]);
    }
    return true;
  }
  getWaveColor(node) {
    const nodeStyle = getComputedStyle(node);
    return nodeStyle.getPropertyValue("border-top-color") || // Firefox Compatible
    nodeStyle.getPropertyValue("border-color") || nodeStyle.getPropertyValue("background-color");
  }
  runTimeoutOutsideZone(fn, delay) {
    this.ngZone.runOutsideAngular(() => setTimeout(fn, delay));
  }
};
var NZ_WAVE_GLOBAL_DEFAULT_CONFIG = {
  disabled: false
};
var NZ_WAVE_GLOBAL_CONFIG = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "nz-wave-global-options" : "");
function provideNzWave(config) {
  return makeEnvironmentProviders([{
    provide: NZ_WAVE_GLOBAL_CONFIG,
    useValue: config
  }]);
}
var NzWaveDirective = class _NzWaveDirective {
  nzWaveExtraNode = false;
  waveRenderer;
  waveDisabled = false;
  get disabled() {
    return this.waveDisabled;
  }
  get rendererRef() {
    return this.waveRenderer;
  }
  cspNonce = inject(CSP_NONCE, {
    optional: true
  });
  platform = inject(Platform);
  config = inject(NZ_WAVE_GLOBAL_CONFIG, {
    optional: true
  });
  animationType = inject(ANIMATION_MODULE_TYPE, {
    optional: true
  });
  ngZone = inject(NgZone);
  elementRef = inject(ElementRef);
  constructor() {
    this.waveDisabled = this.isConfigDisabled();
  }
  isConfigDisabled() {
    let disabled = false;
    if (this.config && typeof this.config.disabled === "boolean") {
      disabled = this.config.disabled;
    }
    if (this.animationType === "NoopAnimations") {
      disabled = true;
    }
    return disabled;
  }
  ngOnDestroy() {
    if (this.waveRenderer) {
      this.waveRenderer.destroy();
    }
  }
  ngOnInit() {
    this.renderWaveIfEnabled();
  }
  renderWaveIfEnabled() {
    if (!this.waveDisabled && this.elementRef.nativeElement) {
      this.waveRenderer = new NzWaveRenderer(this.elementRef.nativeElement, this.ngZone, this.nzWaveExtraNode, this.platform, this.cspNonce);
    }
  }
  disable() {
    this.waveDisabled = true;
    if (this.waveRenderer) {
      this.waveRenderer.removeTriggerEvent();
      this.waveRenderer.removeStyleAndExtraNode();
    }
  }
  enable() {
    this.waveDisabled = this.isConfigDisabled() || false;
    if (this.waveRenderer) {
      this.waveRenderer.bindTriggerEvent();
    }
  }
  static ɵfac = function NzWaveDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzWaveDirective)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzWaveDirective,
    selectors: [["", "nz-wave", ""], ["button", "nz-button", "", 3, "nzType", "link", 3, "nzType", "text"]],
    inputs: {
      nzWaveExtraNode: "nzWaveExtraNode"
    },
    exportAs: ["nzWave"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzWaveDirective, [{
    type: Directive,
    args: [{
      selector: '[nz-wave],button[nz-button]:not([nzType="link"]):not([nzType="text"])',
      exportAs: "nzWave"
    }]
  }], () => [], {
    nzWaveExtraNode: [{
      type: Input
    }]
  });
})();
var NzWaveModule = class _NzWaveModule {
  static ɵfac = function NzWaveModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzWaveModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzWaveModule,
    imports: [NzWaveDirective],
    exports: [NzWaveDirective]
  });
  static ɵinj = ɵɵdefineInjector({
    providers: [provideNzWave(NZ_WAVE_GLOBAL_DEFAULT_CONFIG)]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzWaveModule, [{
    type: NgModule,
    args: [{
      imports: [NzWaveDirective],
      exports: [NzWaveDirective],
      providers: [provideNzWave(NZ_WAVE_GLOBAL_DEFAULT_CONFIG)]
    }]
  }], null, null);
})();

export {
  NzWaveRenderer,
  NZ_WAVE_GLOBAL_DEFAULT_CONFIG,
  NZ_WAVE_GLOBAL_CONFIG,
  provideNzWave,
  NzWaveDirective,
  NzWaveModule
};
//# sourceMappingURL=chunk-LGJNZBJW.js.map
