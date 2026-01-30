import {
  NzI18nService
} from "./chunk-SQGZSPLI.js";
import {
  NZ_SPACE_COMPACT_ITEM_TYPE,
  NZ_SPACE_COMPACT_SIZE,
  NzConfigService,
  NzIconDirective,
  NzIconModule,
  NzOutletModule,
  NzSpaceCompactItemDirective,
  NzStringTemplateOutletDirective,
  WithConfig,
  onConfigChangeEventForComponent
} from "./chunk-JYWJFNL7.js";
import {
  environment,
  fromEventOutsideAngular,
  getEventPosition,
  getStatusClassNames,
  isNotNil,
  isTouchEvent,
  numberAttributeWithInfinityFallback,
  toNumber
} from "./chunk-QE4RO34Y.js";
import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  ConnectionPositionPair,
  OverlayModule
} from "./chunk-3WRUS475.js";
import {
  CdkFixedSizeVirtualScroll,
  CdkPortalOutlet,
  CdkVirtualForOf,
  CdkVirtualScrollViewport,
  ComponentPortal,
  PortalModule
} from "./chunk-WBZX45FC.js";
import {
  BACKSPACE,
  DOWN_ARROW,
  ENTER,
  ESCAPE,
  FocusMonitor,
  SPACE,
  TAB,
  UP_ARROW
} from "./chunk-DFDFRBJ4.js";
import {
  coerceCssPixelValue
} from "./chunk-MUXEGADE.js";
import {
  _getEventTarget
} from "./chunk-V2DTQ5OZ.js";
import "./chunk-OIV3TWMU.js";
import "./chunk-4JI2LY7H.js";
import {
  takeUntilDestroyed
} from "./chunk-SVMEVFX5.js";
import {
  Directionality
} from "./chunk-L6WQNK65.js";
import {
  MediaMatcher
} from "./chunk-APF6BAPA.js";
import "./chunk-N4DOILP3.js";
import {
  Platform
} from "./chunk-RSR3AMJM.js";
import "./chunk-A6CTEFQY.js";
import {
  COMPOSITION_BUFFER_MODE,
  DefaultValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgControlStatus,
  NgModel
} from "./chunk-UCCKLHI7.js";
import {
  NgTemplateOutlet,
  isPlatformBrowser
} from "./chunk-CHRGCPVO.js";
import "./chunk-OM5OKXNY.js";
import {
  ANIMATION_MODULE_TYPE,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  EventEmitter,
  Injectable,
  InjectionToken,
  Injector,
  Input,
  NgModule,
  NgZone,
  Output,
  PLATFORM_ID,
  Renderer2,
  RendererFactory2,
  TemplateRef,
  Type,
  ViewChild,
  ViewContainerRef,
  ViewEncapsulation,
  afterNextRender,
  assertInInjectionContext,
  booleanAttribute,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  numberAttribute,
  output,
  setClassMetadata,
  signal,
  ɵɵHostDirectivesFeature,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵanimateEnter,
  ɵɵanimateEnterListener,
  ɵɵanimateLeave,
  ɵɵanimateLeaveListener,
  ɵɵattribute,
  ɵɵclassProp,
  ɵɵcomponentInstance,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdomElement,
  ɵɵdomElementEnd,
  ɵɵdomElementStart,
  ɵɵdomTemplate,
  ɵɵelement,
  ɵɵelementContainerEnd,
  ɵɵelementContainerStart,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵgetInheritedFactory,
  ɵɵlistener,
  ɵɵloadQuery,
  ɵɵnamespaceSVG,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵpureFunction2,
  ɵɵqueryRefresh,
  ɵɵreference,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵsanitizeHtml,
  ɵɵsanitizeUrl,
  ɵɵstyleMap,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtemplateRefExtractor,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1,
  ɵɵtextInterpolate2,
  ɵɵviewQuery
} from "./chunk-3CH24XTA.js";
import {
  merge
} from "./chunk-V37RSN4D.js";
import "./chunk-SR2LXFJL.js";
import {
  BehaviorSubject,
  ReplaySubject,
  Subject,
  __esDecorate,
  __runInitializers,
  auditTime,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  take,
  withLatestFrom
} from "./chunk-VUVMRRXW.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-EIB7IA3J.js";

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-polyfill.mjs
var requestAnimationFrame = typeof globalThis.requestAnimationFrame === "function" ? globalThis.requestAnimationFrame : globalThis.setTimeout;
var cancelAnimationFrame = typeof globalThis.requestAnimationFrame === "function" ? globalThis.cancelAnimationFrame : globalThis.clearTimeout;

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-services.mjs
var NOOP = () => {
};
var NzResizeService = class _NzResizeService {
  ngZone = inject(NgZone);
  destroyRef = inject(DestroyRef);
  resizeSource$ = new Subject();
  listeners = 0;
  renderer = inject(RendererFactory2).createRenderer(null, null);
  disposeHandle = NOOP;
  handler = () => {
    this.ngZone.run(() => {
      this.resizeSource$.next();
    });
  };
  constructor() {
    this.destroyRef.onDestroy(() => {
      this.handler = NOOP;
    });
  }
  connect() {
    this.registerListener();
    return this.resizeSource$.pipe(auditTime(16), finalize(() => this.unregisterListener()));
  }
  disconnet() {
    this.unregisterListener();
  }
  registerListener() {
    if (this.listeners === 0) {
      this.ngZone.runOutsideAngular(() => {
        this.disposeHandle = this.renderer.listen("window", "resize", this.handler);
      });
    }
    this.listeners += 1;
  }
  unregisterListener() {
    this.listeners -= 1;
    if (this.listeners === 0) {
      this.disposeHandle();
      this.disposeHandle = NOOP;
    }
  }
  static ɵfac = function NzResizeService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzResizeService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzResizeService,
    factory: _NzResizeService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzResizeService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
var testSingleRegistry = /* @__PURE__ */ new Map();
var NzSingletonService = class _NzSingletonService {
  get singletonRegistry() {
    return environment.isTestMode ? testSingleRegistry : this._singletonRegistry;
  }
  /**
   * This registry is used to register singleton in dev mode.
   * So that singletons get destroyed when hot module reload happens.
   *
   * This works in prod mode too but with no specific effect.
   */
  _singletonRegistry = /* @__PURE__ */ new Map();
  registerSingletonWithKey(key, target) {
    const alreadyHave = this.singletonRegistry.has(key);
    const item = alreadyHave ? this.singletonRegistry.get(key) : this.withNewTarget(target);
    if (!alreadyHave) {
      this.singletonRegistry.set(key, item);
    }
  }
  unregisterSingletonWithKey(key) {
    if (this.singletonRegistry.has(key)) {
      this.singletonRegistry.delete(key);
    }
  }
  getSingletonWithKey(key) {
    return this.singletonRegistry.has(key) ? this.singletonRegistry.get(key).target : null;
  }
  withNewTarget(target) {
    return {
      target
    };
  }
  static ɵfac = function NzSingletonService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSingletonService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzSingletonService,
    factory: _NzSingletonService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSingletonService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
function getPagePosition(event) {
  const e = getEventPosition(event);
  return {
    x: e.pageX,
    y: e.pageY
  };
}
var NzDragService = class _NzDragService {
  draggingThreshold = 5;
  currentDraggingSequence = null;
  currentStartingPoint = null;
  handleRegistry = /* @__PURE__ */ new Set();
  renderer = inject(RendererFactory2).createRenderer(null, null);
  requestDraggingSequence(event) {
    if (!this.handleRegistry.size) {
      this.registerDraggingHandler(isTouchEvent(event));
    }
    if (this.currentDraggingSequence) {
      this.currentDraggingSequence.complete();
    }
    this.currentStartingPoint = getPagePosition(event);
    this.currentDraggingSequence = new Subject();
    return this.currentDraggingSequence.pipe(map((e) => ({
      x: e.pageX - this.currentStartingPoint.x,
      y: e.pageY - this.currentStartingPoint.y
    })), filter((e) => Math.abs(e.x) > this.draggingThreshold || Math.abs(e.y) > this.draggingThreshold), finalize(() => this.teardownDraggingSequence()));
  }
  registerDraggingHandler(isTouch) {
    if (isTouch) {
      this.handleRegistry.add({
        teardown: this.renderer.listen("document", "touchmove", (e) => {
          if (this.currentDraggingSequence) {
            this.currentDraggingSequence.next(e.touches[0] || e.changedTouches[0]);
          }
        })
      });
      this.handleRegistry.add({
        teardown: this.renderer.listen("document", "touchend", () => {
          if (this.currentDraggingSequence) {
            this.currentDraggingSequence.complete();
          }
        })
      });
    } else {
      this.handleRegistry.add({
        teardown: this.renderer.listen("document", "mousemove", (e) => {
          if (this.currentDraggingSequence) {
            this.currentDraggingSequence.next(e);
          }
        })
      });
      this.handleRegistry.add({
        teardown: this.renderer.listen("document", "mouseup", () => {
          if (this.currentDraggingSequence) {
            this.currentDraggingSequence.complete();
          }
        })
      });
    }
  }
  teardownDraggingSequence() {
    this.currentDraggingSequence = null;
  }
  static ɵfac = function NzDragService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzDragService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzDragService,
    factory: _NzDragService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzDragService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
function easeInOutCubic(t, b, c, d) {
  const cc = c - b;
  let tt = t / (d / 2);
  if (tt < 1) {
    return cc / 2 * tt * tt * tt + b;
  } else {
    return cc / 2 * ((tt -= 2) * tt * tt + 2) + b;
  }
}
var NzScrollService = class _NzScrollService {
  doc = inject(DOCUMENT);
  ngZone = inject(NgZone);
  /** Set the position of the scroll bar of `el`. */
  setScrollTop(el, topValue = 0) {
    if (el === window) {
      this.doc.body.scrollTop = topValue;
      this.doc.documentElement.scrollTop = topValue;
    } else {
      el.scrollTop = topValue;
    }
  }
  /** Get position of `el` against window. */
  getOffset(el) {
    const ret = {
      top: 0,
      left: 0
    };
    if (!el || !el.getClientRects().length) {
      return ret;
    }
    const rect = el.getBoundingClientRect();
    if (rect.width || rect.height) {
      const doc = el.ownerDocument.documentElement;
      ret.top = rect.top - doc.clientTop;
      ret.left = rect.left - doc.clientLeft;
    } else {
      ret.top = rect.top;
      ret.left = rect.left;
    }
    return ret;
  }
  /** Get the position of the scoll bar of `el`. */
  // TODO: remove '| Window' as the fallback already happens here
  getScroll(target, top = true) {
    if (typeof window === "undefined") {
      return 0;
    }
    const method = top ? "scrollTop" : "scrollLeft";
    let result = 0;
    if (this.isWindow(target)) {
      result = target[top ? "pageYOffset" : "pageXOffset"];
    } else if (target instanceof Document) {
      result = target.documentElement[method];
    } else if (target) {
      result = target[method];
    }
    if (target && !this.isWindow(target) && typeof result !== "number") {
      result = (target.ownerDocument || target).documentElement[method];
    }
    return result;
  }
  isWindow(obj) {
    return obj !== null && obj !== void 0 && obj === obj.window;
  }
  /**
   * Scroll `el` to some position with animation.
   *
   * @param containerEl container, `window` by default
   * @param y Scroll to `top`, 0 by default
   * @param options Scroll animation options
   */
  scrollTo(containerEl, y = 0, options = {}) {
    const target = containerEl ? containerEl : window;
    const scrollTop = this.getScroll(target);
    const startTime = Date.now();
    const {
      easing,
      callback,
      duration = 450
    } = options;
    const frameFunc = () => {
      const timestamp = Date.now();
      const time = timestamp - startTime;
      const nextScrollTop = (easing || easeInOutCubic)(time > duration ? duration : time, scrollTop, y, duration);
      if (this.isWindow(target)) {
        target.scrollTo(window.pageXOffset, nextScrollTop);
      } else if (target instanceof HTMLDocument || target.constructor.name === "HTMLDocument") {
        target.documentElement.scrollTop = nextScrollTop;
      } else {
        target.scrollTop = nextScrollTop;
      }
      if (time < duration) {
        requestAnimationFrame(frameFunc);
      } else if (typeof callback === "function") {
        this.ngZone.run(callback);
      }
    };
    this.ngZone.runOutsideAngular(() => requestAnimationFrame(frameFunc));
  }
  static ɵfac = function NzScrollService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzScrollService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzScrollService,
    factory: _NzScrollService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzScrollService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
var NzBreakpointEnum;
(function(NzBreakpointEnum2) {
  NzBreakpointEnum2["xxl"] = "xxl";
  NzBreakpointEnum2["xl"] = "xl";
  NzBreakpointEnum2["lg"] = "lg";
  NzBreakpointEnum2["md"] = "md";
  NzBreakpointEnum2["sm"] = "sm";
  NzBreakpointEnum2["xs"] = "xs";
})(NzBreakpointEnum || (NzBreakpointEnum = {}));
var gridResponsiveMap = {
  xs: "(max-width: 575px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)",
  xxl: "(min-width: 1600px)"
};
var NzBreakpointService = class _NzBreakpointService {
  resizeService = inject(NzResizeService);
  mediaMatcher = inject(MediaMatcher);
  constructor() {
    this.resizeService.connect().pipe(takeUntilDestroyed()).subscribe(() => {
    });
  }
  subscribe(breakpointMap, fullMap) {
    if (fullMap) {
      const get = () => this.matchMedia(breakpointMap, true);
      return this.resizeService.connect().pipe(map(get), startWith(get()), distinctUntilChanged((x, y) => x[0] === y[0]), map((x) => x[1]));
    } else {
      const get = () => this.matchMedia(breakpointMap);
      return this.resizeService.connect().pipe(map(get), startWith(get()), distinctUntilChanged());
    }
  }
  matchMedia(breakpointMap, fullMap) {
    let bp = NzBreakpointEnum.md;
    const breakpointBooleanMap = {};
    Object.keys(breakpointMap).map((breakpoint) => {
      const castBP = breakpoint;
      const matched = this.mediaMatcher.matchMedia(gridResponsiveMap[castBP]).matches;
      breakpointBooleanMap[breakpoint] = matched;
      if (matched) {
        bp = castBP;
      }
    });
    if (fullMap) {
      return [bp, breakpointBooleanMap];
    } else {
      return bp;
    }
  }
  static ɵfac = function NzBreakpointService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzBreakpointService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzBreakpointService,
    factory: _NzBreakpointService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzBreakpointService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
var NzDestroyService = class _NzDestroyService extends Subject {
  ngOnDestroy() {
    this.next();
    this.complete();
  }
  static ɵfac = /* @__PURE__ */ (() => {
    let ɵNzDestroyService_BaseFactory;
    return function NzDestroyService_Factory(__ngFactoryType__) {
      return (ɵNzDestroyService_BaseFactory || (ɵNzDestroyService_BaseFactory = ɵɵgetInheritedFactory(_NzDestroyService)))(__ngFactoryType__ || _NzDestroyService);
    };
  })();
  static ɵprov = ɵɵdefineInjectable({
    token: _NzDestroyService,
    factory: _NzDestroyService.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzDestroyService, [{
    type: Injectable
  }], null, null);
})();
var ImagePreloadService = class _ImagePreloadService {
  counter = /* @__PURE__ */ new Map();
  linkRefs = /* @__PURE__ */ new Map();
  document = inject(DOCUMENT);
  platform = inject(Platform);
  addPreload(option) {
    if (this.platform.isBrowser) {
      return () => void 0;
    }
    const uniqueKey = `${option.src}${option.srcset}`;
    let currentCount = this.counter.get(uniqueKey) || 0;
    currentCount++;
    this.counter.set(uniqueKey, currentCount);
    if (!this.linkRefs.has(uniqueKey)) {
      const linkNode = this.appendPreloadLink(option);
      this.linkRefs.set(uniqueKey, linkNode);
    }
    return () => {
      if (this.counter.has(uniqueKey)) {
        let count = this.counter.get(uniqueKey);
        count--;
        if (count === 0) {
          const linkNode = this.linkRefs.get(uniqueKey);
          this.removePreloadLink(linkNode);
          this.counter.delete(uniqueKey);
          this.linkRefs.delete(uniqueKey);
        } else {
          this.counter.set(uniqueKey, count);
        }
      }
    };
  }
  appendPreloadLink(option) {
    const linkNode = this.document.createElement("link");
    linkNode.setAttribute("rel", "preload");
    linkNode.setAttribute("as", "image");
    linkNode.setAttribute("href", option.src);
    if (option.srcset) {
      linkNode.setAttribute("imagesrcset", option.srcset);
    }
    this.document.head.appendChild(linkNode);
    return linkNode;
  }
  removePreloadLink(linkNode) {
    if (this.document.head.contains(linkNode)) {
      this.document.head.removeChild(linkNode);
    }
  }
  static ɵfac = function ImagePreloadService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _ImagePreloadService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _ImagePreloadService,
    factory: _ImagePreloadService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(ImagePreloadService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-overlay.mjs
var POSITION_MAP = {
  top: new ConnectionPositionPair({
    originX: "center",
    originY: "top"
  }, {
    overlayX: "center",
    overlayY: "bottom"
  }),
  topCenter: new ConnectionPositionPair({
    originX: "center",
    originY: "top"
  }, {
    overlayX: "center",
    overlayY: "bottom"
  }),
  topLeft: new ConnectionPositionPair({
    originX: "start",
    originY: "top"
  }, {
    overlayX: "start",
    overlayY: "bottom"
  }),
  topRight: new ConnectionPositionPair({
    originX: "end",
    originY: "top"
  }, {
    overlayX: "end",
    overlayY: "bottom"
  }),
  right: new ConnectionPositionPair({
    originX: "end",
    originY: "center"
  }, {
    overlayX: "start",
    overlayY: "center"
  }),
  rightTop: new ConnectionPositionPair({
    originX: "end",
    originY: "top"
  }, {
    overlayX: "start",
    overlayY: "top"
  }),
  rightBottom: new ConnectionPositionPair({
    originX: "end",
    originY: "bottom"
  }, {
    overlayX: "start",
    overlayY: "bottom"
  }),
  bottom: new ConnectionPositionPair({
    originX: "center",
    originY: "bottom"
  }, {
    overlayX: "center",
    overlayY: "top"
  }),
  bottomCenter: new ConnectionPositionPair({
    originX: "center",
    originY: "bottom"
  }, {
    overlayX: "center",
    overlayY: "top"
  }),
  bottomLeft: new ConnectionPositionPair({
    originX: "start",
    originY: "bottom"
  }, {
    overlayX: "start",
    overlayY: "top"
  }),
  bottomRight: new ConnectionPositionPair({
    originX: "end",
    originY: "bottom"
  }, {
    overlayX: "end",
    overlayY: "top"
  }),
  left: new ConnectionPositionPair({
    originX: "start",
    originY: "center"
  }, {
    overlayX: "end",
    overlayY: "center"
  }),
  leftTop: new ConnectionPositionPair({
    originX: "start",
    originY: "top"
  }, {
    overlayX: "end",
    overlayY: "top"
  }),
  leftBottom: new ConnectionPositionPair({
    originX: "start",
    originY: "bottom"
  }, {
    overlayX: "end",
    overlayY: "bottom"
  })
};
var positionOffsetMapFactory = (offset = 12) => ({
  top: [0, -offset],
  topCenter: [0, -offset],
  topLeft: [0, -offset],
  topRight: [0, -offset],
  right: [offset, 0],
  rightTop: [offset, 0],
  rightBottom: [offset, 0],
  bottom: [0, offset],
  bottomCenter: [0, offset],
  bottomLeft: [0, offset],
  bottomRight: [0, offset],
  left: [-offset, 0],
  leftTop: [-offset, 0],
  leftBottom: [-offset, 0]
});
var TOOLTIP_OFFSET_MAP = positionOffsetMapFactory();
var DEFAULT_TOOLTIP_POSITIONS = [setConnectedPositionOffset(POSITION_MAP.top, TOOLTIP_OFFSET_MAP.top), setConnectedPositionOffset(POSITION_MAP.right, TOOLTIP_OFFSET_MAP.right), setConnectedPositionOffset(POSITION_MAP.bottom, TOOLTIP_OFFSET_MAP.bottom), setConnectedPositionOffset(POSITION_MAP.left, TOOLTIP_OFFSET_MAP.left)];
var DEFAULT_CASCADER_POSITIONS = [POSITION_MAP.bottomLeft, POSITION_MAP.bottomRight, POSITION_MAP.topLeft, POSITION_MAP.topRight];
var DEFAULT_MENTION_TOP_POSITIONS = [new ConnectionPositionPair({
  originX: "start",
  originY: "bottom"
}, {
  overlayX: "start",
  overlayY: "bottom"
}), new ConnectionPositionPair({
  originX: "start",
  originY: "bottom"
}, {
  overlayX: "end",
  overlayY: "bottom"
})];
var DEFAULT_MENTION_BOTTOM_POSITIONS = [POSITION_MAP.bottomLeft, new ConnectionPositionPair({
  originX: "start",
  originY: "bottom"
}, {
  overlayX: "end",
  overlayY: "top"
})];
function getPlacementName(position) {
  for (const placement in POSITION_MAP) {
    if (position.connectionPair.originX === POSITION_MAP[placement].originX && position.connectionPair.originY === POSITION_MAP[placement].originY && position.connectionPair.overlayX === POSITION_MAP[placement].overlayX && position.connectionPair.overlayY === POSITION_MAP[placement].overlayY) {
      return placement;
    }
  }
  return void 0;
}
var DATE_PICKER_POSITION_MAP = {
  bottomLeft: new ConnectionPositionPair({
    originX: "start",
    originY: "bottom"
  }, {
    overlayX: "start",
    overlayY: "top"
  }, void 0, 2),
  topLeft: new ConnectionPositionPair({
    originX: "start",
    originY: "top"
  }, {
    overlayX: "start",
    overlayY: "bottom"
  }, void 0, -2),
  bottomRight: new ConnectionPositionPair({
    originX: "end",
    originY: "bottom"
  }, {
    overlayX: "end",
    overlayY: "top"
  }, void 0, 2),
  topRight: new ConnectionPositionPair({
    originX: "end",
    originY: "top"
  }, {
    overlayX: "end",
    overlayY: "bottom"
  }, void 0, -2)
};
var DEFAULT_DATE_PICKER_POSITIONS = [DATE_PICKER_POSITION_MAP.bottomLeft, DATE_PICKER_POSITION_MAP.topLeft, DATE_PICKER_POSITION_MAP.bottomRight, DATE_PICKER_POSITION_MAP.topRight];
function normalizeConnectedPositionOffset(offset) {
  return Array.isArray(offset) ? offset : [offset, offset];
}
function setConnectedPositionOffset(position, offset) {
  const [offsetX, offsetY] = normalizeConnectedPositionOffset(offset);
  return __spreadProps(__spreadValues({}, position), {
    offsetX,
    offsetY
  });
}
var NzConnectedOverlayDirective = class _NzConnectedOverlayDirective {
  cdkConnectedOverlay = inject(CdkConnectedOverlay);
  nzArrowPointAtCenter = false;
  constructor() {
    this.cdkConnectedOverlay.backdropClass = "nz-overlay-transparent-backdrop";
    this.cdkConnectedOverlay.positionChange.pipe(takeUntilDestroyed()).subscribe((position) => {
      if (this.nzArrowPointAtCenter) {
        this.updateArrowPosition(position);
      }
    });
  }
  updateArrowPosition(position) {
    const originRect = this.getOriginRect();
    const placement = getPlacementName(position);
    let offsetX = 0;
    let offsetY = 0;
    if (placement === "topLeft" || placement === "bottomLeft") {
      offsetX = originRect.width / 2 - 14;
    } else if (placement === "topRight" || placement === "bottomRight") {
      offsetX = -(originRect.width / 2 - 14);
    } else if (placement === "leftTop" || placement === "rightTop") {
      offsetY = originRect.height / 2 - 10;
    } else if (placement === "leftBottom" || placement === "rightBottom") {
      offsetY = -(originRect.height / 2 - 10);
    }
    if (this.cdkConnectedOverlay.offsetX !== offsetX || this.cdkConnectedOverlay.offsetY !== offsetY) {
      this.cdkConnectedOverlay.offsetY = offsetY;
      this.cdkConnectedOverlay.offsetX = offsetX;
      this.cdkConnectedOverlay.overlayRef.updatePosition();
    }
  }
  getFlexibleConnectedPositionStrategyOrigin() {
    if (this.cdkConnectedOverlay.origin instanceof CdkOverlayOrigin) {
      return this.cdkConnectedOverlay.origin.elementRef;
    } else {
      return this.cdkConnectedOverlay.origin;
    }
  }
  getOriginRect() {
    const origin = this.getFlexibleConnectedPositionStrategyOrigin();
    if (origin instanceof ElementRef) {
      return origin.nativeElement.getBoundingClientRect();
    }
    if (origin instanceof Element) {
      return origin.getBoundingClientRect();
    }
    const width = origin.width || 0;
    const height = origin.height || 0;
    return {
      top: origin.y,
      bottom: origin.y + height,
      left: origin.x,
      right: origin.x + width,
      height,
      width
    };
  }
  static ɵfac = function NzConnectedOverlayDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzConnectedOverlayDirective)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzConnectedOverlayDirective,
    selectors: [["", "cdkConnectedOverlay", "", "nzConnectedOverlay", ""]],
    inputs: {
      nzArrowPointAtCenter: [2, "nzArrowPointAtCenter", "nzArrowPointAtCenter", booleanAttribute]
    },
    exportAs: ["nzConnectedOverlay"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzConnectedOverlayDirective, [{
    type: Directive,
    args: [{
      selector: "[cdkConnectedOverlay][nzConnectedOverlay]",
      exportAs: "nzConnectedOverlay"
    }]
  }], () => [], {
    nzArrowPointAtCenter: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }]
  });
})();
var NzOverlayModule = class _NzOverlayModule {
  static ɵfac = function NzOverlayModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzOverlayModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzOverlayModule,
    imports: [NzConnectedOverlayDirective],
    exports: [NzConnectedOverlayDirective]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzOverlayModule, [{
    type: NgModule,
    args: [{
      imports: [NzConnectedOverlayDirective],
      exports: [NzConnectedOverlayDirective]
    }]
  }], null, null);
})();

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-empty.mjs
function NzEmptyComponent_Conditional_1_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵelement(1, "img", 4);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("src", ctx_r0.nzNotFoundImage, ɵɵsanitizeUrl)("alt", ctx_r0.isContentString ? ctx_r0.nzNotFoundContent : "empty");
  }
}
function NzEmptyComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzEmptyComponent_Conditional_1_ng_container_0_Template, 2, 2, "ng-container", 3);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("nzStringTemplateOutlet", ctx_r0.nzNotFoundImage);
  }
}
function NzEmptyComponent_Conditional_2_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-empty-simple");
  }
}
function NzEmptyComponent_Conditional_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-empty-default");
  }
}
function NzEmptyComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzEmptyComponent_Conditional_2_Conditional_0_Template, 1, 0, "nz-empty-simple")(1, NzEmptyComponent_Conditional_2_Conditional_1_Template, 1, 0, "nz-empty-default");
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵconditional(ctx_r0.nzNotFoundImage === "simple" ? 0 : 1);
  }
}
function NzEmptyComponent_Conditional_3_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", ctx_r0.isContentString ? ctx_r0.nzNotFoundContent : ctx_r0.locale["description"], " ");
  }
}
function NzEmptyComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "p", 1);
    ɵɵtemplate(1, NzEmptyComponent_Conditional_3_ng_container_1_Template, 2, 1, "ng-container", 3);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("nzStringTemplateOutlet", ctx_r0.nzNotFoundContent);
  }
}
function NzEmptyComponent_Conditional_4_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", ctx_r0.nzNotFoundFooter, " ");
  }
}
function NzEmptyComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 2);
    ɵɵtemplate(1, NzEmptyComponent_Conditional_4_ng_container_1_Template, 2, 1, "ng-container", 3);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("nzStringTemplateOutlet", ctx_r0.nzNotFoundFooter);
  }
}
var _c0 = (a0) => ({
  $implicit: a0
});
function NzEmbedEmptyComponent_Conditional_0_Conditional_0_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(3);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.content);
  }
}
function NzEmbedEmptyComponent_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzEmbedEmptyComponent_Conditional_0_Conditional_0_ng_container_0_Template, 2, 1, "ng-container", 1);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("nzStringTemplateOutlet", ctx_r0.content)("nzStringTemplateOutletContext", ɵɵpureFunction1(2, _c0, ctx_r0.nzComponentName));
  }
}
function NzEmbedEmptyComponent_Conditional_0_Conditional_1_ng_template_0_Template(rf, ctx) {
}
function NzEmbedEmptyComponent_Conditional_0_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzEmbedEmptyComponent_Conditional_0_Conditional_1_ng_template_0_Template, 0, 0, "ng-template", 0);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("cdkPortalOutlet", ctx_r0.contentPortal);
  }
}
function NzEmbedEmptyComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzEmbedEmptyComponent_Conditional_0_Conditional_0_Template, 1, 4, "ng-container")(1, NzEmbedEmptyComponent_Conditional_0_Conditional_1_Template, 1, 1, null, 0);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵconditional(ctx_r0.contentType === "template" || ctx_r0.contentType === "string" ? 0 : 1);
  }
}
function NzEmbedEmptyComponent_Conditional_1_Conditional_0_Case_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-empty", 2);
  }
}
function NzEmbedEmptyComponent_Conditional_1_Conditional_0_Case_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-empty", 3);
  }
}
function NzEmbedEmptyComponent_Conditional_1_Conditional_0_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-empty");
  }
}
function NzEmbedEmptyComponent_Conditional_1_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzEmbedEmptyComponent_Conditional_1_Conditional_0_Case_0_Template, 1, 0, "nz-empty", 2)(1, NzEmbedEmptyComponent_Conditional_1_Conditional_0_Case_1_Template, 1, 0, "nz-empty", 3)(2, NzEmbedEmptyComponent_Conditional_1_Conditional_0_Case_2_Template, 1, 0, "nz-empty");
  }
  if (rf & 2) {
    let tmp_2_0;
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵconditional((tmp_2_0 = ctx_r0.size) === "normal" ? 0 : tmp_2_0 === "small" ? 1 : 2);
  }
}
function NzEmbedEmptyComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzEmbedEmptyComponent_Conditional_1_Conditional_0_Template, 3, 1);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵconditional(ctx_r0.specificContent !== null ? 0 : -1);
  }
}
var NZ_EMPTY_COMPONENT_NAME = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "nz-empty-component-name" : "");
var NzEmptyDefaultComponent = class _NzEmptyDefaultComponent {
  static ɵfac = function NzEmptyDefaultComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzEmptyDefaultComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzEmptyDefaultComponent,
    selectors: [["nz-empty-default"]],
    exportAs: ["nzEmptyDefault"],
    decls: 12,
    vars: 0,
    consts: [["width", "184", "height", "152", "viewBox", "0 0 184 152", "xmlns", "http://www.w3.org/2000/svg", 1, "ant-empty-img-default"], ["fill", "none", "fill-rule", "evenodd"], ["transform", "translate(24 31.67)"], ["cx", "67.797", "cy", "106.89", "rx", "67.797", "ry", "12.668", 1, "ant-empty-img-default-ellipse"], ["d", "M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z", 1, "ant-empty-img-default-path-1"], ["d", "M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z", "transform", "translate(13.56)", 1, "ant-empty-img-default-path-2"], ["d", "M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z", 1, "ant-empty-img-default-path-3"], ["d", "M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z", 1, "ant-empty-img-default-path-4"], ["d", "M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z", 1, "ant-empty-img-default-path-5"], ["transform", "translate(149.65 15.383)", 1, "ant-empty-img-default-g"], ["cx", "20.654", "cy", "3.167", "rx", "2.849", "ry", "2.815"], ["d", "M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z"]],
    template: function NzEmptyDefaultComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵnamespaceSVG();
        ɵɵdomElementStart(0, "svg", 0)(1, "g", 1)(2, "g", 2);
        ɵɵdomElement(3, "ellipse", 3)(4, "path", 4)(5, "path", 5)(6, "path", 6)(7, "path", 7);
        ɵɵdomElementEnd();
        ɵɵdomElement(8, "path", 8);
        ɵɵdomElementStart(9, "g", 9);
        ɵɵdomElement(10, "ellipse", 10)(11, "path", 11);
        ɵɵdomElementEnd()()();
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzEmptyDefaultComponent, [{
    type: Component,
    args: [{
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      selector: "nz-empty-default",
      exportAs: "nzEmptyDefault",
      template: `
    <svg
      class="ant-empty-img-default"
      width="184"
      height="152"
      viewBox="0 0 184 152"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fill-rule="evenodd">
        <g transform="translate(24 31.67)">
          <ellipse class="ant-empty-img-default-ellipse" cx="67.797" cy="106.89" rx="67.797" ry="12.668" />
          <path
            class="ant-empty-img-default-path-1"
            d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
          />
          <path
            class="ant-empty-img-default-path-2"
            d="M101.537 86.214L80.63 61.102c-1.001-1.207-2.507-1.867-4.048-1.867H31.724c-1.54 0-3.047.66-4.048 1.867L6.769 86.214v13.792h94.768V86.214z"
            transform="translate(13.56)"
          />
          <path
            class="ant-empty-img-default-path-3"
            d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
          />
          <path
            class="ant-empty-img-default-path-4"
            d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
          />
        </g>
        <path
          class="ant-empty-img-default-path-5"
          d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
        />
        <g class="ant-empty-img-default-g" transform="translate(149.65 15.383)">
          <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
          <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
        </g>
      </g>
    </svg>
  `
    }]
  }], null, null);
})();
var NzEmptySimpleComponent = class _NzEmptySimpleComponent {
  static ɵfac = function NzEmptySimpleComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzEmptySimpleComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzEmptySimpleComponent,
    selectors: [["nz-empty-simple"]],
    exportAs: ["nzEmptySimple"],
    decls: 6,
    vars: 0,
    consts: [["width", "64", "height", "41", "viewBox", "0 0 64 41", "xmlns", "http://www.w3.org/2000/svg", 1, "ant-empty-img-simple"], ["transform", "translate(0 1)", "fill", "none", "fill-rule", "evenodd"], ["cx", "32", "cy", "33", "rx", "32", "ry", "7", 1, "ant-empty-img-simple-ellipse"], ["fill-rule", "nonzero", 1, "ant-empty-img-simple-g"], ["d", "M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"], ["d", "M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z", 1, "ant-empty-img-simple-path"]],
    template: function NzEmptySimpleComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵnamespaceSVG();
        ɵɵdomElementStart(0, "svg", 0)(1, "g", 1);
        ɵɵdomElement(2, "ellipse", 2);
        ɵɵdomElementStart(3, "g", 3);
        ɵɵdomElement(4, "path", 4)(5, "path", 5);
        ɵɵdomElementEnd()()();
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzEmptySimpleComponent, [{
    type: Component,
    args: [{
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      selector: "nz-empty-simple",
      exportAs: "nzEmptySimple",
      template: `
    <svg class="ant-empty-img-simple" width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
        <ellipse class="ant-empty-img-simple-ellipse" cx="32" cy="33" rx="32" ry="7" />
        <g class="ant-empty-img-simple-g" fill-rule="nonzero">
          <path
            d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"
          />
          <path
            d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z"
            class="ant-empty-img-simple-path"
          />
        </g>
      </g>
    </svg>
  `
    }]
  }], null, null);
})();
var NzEmptyDefaultImages = ["default", "simple"];
var NzEmptyComponent = class _NzEmptyComponent {
  i18n = inject(NzI18nService);
  cdr = inject(ChangeDetectorRef);
  destroyRef = inject(DestroyRef);
  nzNotFoundImage = "default";
  nzNotFoundContent;
  nzNotFoundFooter;
  isContentString = false;
  isImageBuildIn = true;
  locale;
  ngOnChanges(changes) {
    const {
      nzNotFoundContent,
      nzNotFoundImage
    } = changes;
    if (nzNotFoundContent) {
      const content = nzNotFoundContent.currentValue;
      this.isContentString = typeof content === "string";
    }
    if (nzNotFoundImage) {
      const image = nzNotFoundImage.currentValue || "default";
      this.isImageBuildIn = NzEmptyDefaultImages.findIndex((i) => i === image) > -1;
    }
  }
  ngOnInit() {
    this.i18n.localeChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.locale = this.i18n.getLocaleData("Empty");
      this.cdr.markForCheck();
    });
  }
  static ɵfac = function NzEmptyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzEmptyComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzEmptyComponent,
    selectors: [["nz-empty"]],
    hostAttrs: [1, "ant-empty"],
    inputs: {
      nzNotFoundImage: "nzNotFoundImage",
      nzNotFoundContent: "nzNotFoundContent",
      nzNotFoundFooter: "nzNotFoundFooter"
    },
    exportAs: ["nzEmpty"],
    features: [ɵɵNgOnChangesFeature],
    decls: 5,
    vars: 3,
    consts: [[1, "ant-empty-image"], [1, "ant-empty-description"], [1, "ant-empty-footer"], [4, "nzStringTemplateOutlet"], [3, "src", "alt"]],
    template: function NzEmptyComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelementStart(0, "div", 0);
        ɵɵconditionalCreate(1, NzEmptyComponent_Conditional_1_Template, 1, 1, "ng-container")(2, NzEmptyComponent_Conditional_2_Template, 2, 1);
        ɵɵelementEnd();
        ɵɵconditionalCreate(3, NzEmptyComponent_Conditional_3_Template, 2, 1, "p", 1);
        ɵɵconditionalCreate(4, NzEmptyComponent_Conditional_4_Template, 2, 1, "div", 2);
      }
      if (rf & 2) {
        ɵɵadvance();
        ɵɵconditional(!ctx.isImageBuildIn ? 1 : 2);
        ɵɵadvance(2);
        ɵɵconditional(ctx.nzNotFoundContent !== null ? 3 : -1);
        ɵɵadvance();
        ɵɵconditional(ctx.nzNotFoundFooter ? 4 : -1);
      }
    },
    dependencies: [NzOutletModule, NzStringTemplateOutletDirective, NzEmptyDefaultComponent, NzEmptySimpleComponent],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzEmptyComponent, [{
    type: Component,
    args: [{
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      selector: "nz-empty",
      exportAs: "nzEmpty",
      template: `
    <div class="ant-empty-image">
      @if (!isImageBuildIn) {
        <ng-container *nzStringTemplateOutlet="nzNotFoundImage">
          <img [src]="nzNotFoundImage" [alt]="isContentString ? nzNotFoundContent : 'empty'" />
        </ng-container>
      } @else {
        @if (nzNotFoundImage === 'simple') {
          <nz-empty-simple />
        } @else {
          <nz-empty-default />
        }
      }
    </div>
    @if (nzNotFoundContent !== null) {
      <p class="ant-empty-description">
        <ng-container *nzStringTemplateOutlet="nzNotFoundContent">
          {{ isContentString ? nzNotFoundContent : locale['description'] }}
        </ng-container>
      </p>
    }

    @if (nzNotFoundFooter) {
      <div class="ant-empty-footer">
        <ng-container *nzStringTemplateOutlet="nzNotFoundFooter">
          {{ nzNotFoundFooter }}
        </ng-container>
      </div>
    }
  `,
      host: {
        class: "ant-empty"
      },
      imports: [NzOutletModule, NzEmptyDefaultComponent, NzEmptySimpleComponent]
    }]
  }], null, {
    nzNotFoundImage: [{
      type: Input
    }],
    nzNotFoundContent: [{
      type: Input
    }],
    nzNotFoundFooter: [{
      type: Input
    }]
  });
})();
function getEmptySize(componentName) {
  switch (componentName) {
    case "table":
    case "list":
      return "normal";
    case "select":
    case "tree-select":
    case "cascader":
    case "transfer":
      return "small";
    default:
      return "";
  }
}
var NzEmbedEmptyComponent = class _NzEmbedEmptyComponent {
  configService = inject(NzConfigService);
  viewContainerRef = inject(ViewContainerRef);
  cdr = inject(ChangeDetectorRef);
  injector = inject(Injector);
  nzComponentName;
  specificContent;
  content;
  contentType = "string";
  contentPortal;
  size = "";
  constructor() {
    onConfigChangeEventForComponent("empty", () => {
      this.content = this.specificContent || this.getUserDefaultEmptyContent();
      this.renderEmpty();
    });
  }
  ngOnChanges(changes) {
    if (changes.nzComponentName) {
      this.size = getEmptySize(changes.nzComponentName.currentValue);
    }
    if (changes.specificContent && !changes.specificContent.isFirstChange()) {
      this.content = changes.specificContent.currentValue;
      this.renderEmpty();
    }
  }
  ngOnInit() {
    this.content = this.specificContent || this.getUserDefaultEmptyContent();
    this.renderEmpty();
  }
  renderEmpty() {
    const content = this.content;
    if (typeof content === "string") {
      this.contentType = "string";
    } else if (content instanceof TemplateRef) {
      this.contentType = "template";
      this.contentPortal = void 0;
    } else if (content instanceof Type) {
      const injector = Injector.create({
        parent: this.injector,
        providers: [{
          provide: NZ_EMPTY_COMPONENT_NAME,
          useValue: this.nzComponentName
        }]
      });
      this.contentType = "component";
      this.contentPortal = new ComponentPortal(content, this.viewContainerRef, injector);
    } else {
      this.contentType = "string";
      this.contentPortal = void 0;
    }
    this.cdr.detectChanges();
  }
  getUserDefaultEmptyContent() {
    return (this.configService.getConfigForComponent("empty") || {}).nzDefaultEmptyContent;
  }
  static ɵfac = function NzEmbedEmptyComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzEmbedEmptyComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzEmbedEmptyComponent,
    selectors: [["nz-embed-empty"]],
    inputs: {
      nzComponentName: "nzComponentName",
      specificContent: "specificContent"
    },
    exportAs: ["nzEmbedEmpty"],
    features: [ɵɵNgOnChangesFeature],
    decls: 2,
    vars: 1,
    consts: [[3, "cdkPortalOutlet"], [4, "nzStringTemplateOutlet", "nzStringTemplateOutletContext"], ["nzNotFoundImage", "simple", 1, "ant-empty-normal"], ["nzNotFoundImage", "simple", 1, "ant-empty-small"]],
    template: function NzEmbedEmptyComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵconditionalCreate(0, NzEmbedEmptyComponent_Conditional_0_Template, 2, 1)(1, NzEmbedEmptyComponent_Conditional_1_Template, 1, 1);
      }
      if (rf & 2) {
        ɵɵconditional(ctx.content ? 0 : 1);
      }
    },
    dependencies: [NzEmptyComponent, PortalModule, CdkPortalOutlet, NzOutletModule, NzStringTemplateOutletDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzEmbedEmptyComponent, [{
    type: Component,
    args: [{
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      selector: "nz-embed-empty",
      exportAs: "nzEmbedEmpty",
      template: `
    @if (content) {
      @if (contentType === 'template' || contentType === 'string') {
        <ng-container *nzStringTemplateOutlet="content; context: { $implicit: this.nzComponentName }">{{
          content
        }}</ng-container>
      } @else {
        <ng-template [cdkPortalOutlet]="contentPortal" />
      }
    } @else {
      @if (specificContent !== null) {
        @switch (size) {
          @case ('normal') {
            <nz-empty class="ant-empty-normal" nzNotFoundImage="simple" />
          }
          @case ('small') {
            <nz-empty class="ant-empty-small" nzNotFoundImage="simple" />
          }
          @default {
            <nz-empty />
          }
        }
      }
    }
  `,
      imports: [NzEmptyComponent, PortalModule, NzOutletModule]
    }]
  }], () => [], {
    nzComponentName: [{
      type: Input
    }],
    specificContent: [{
      type: Input
    }]
  });
})();
var NzEmptyModule = class _NzEmptyModule {
  static ɵfac = function NzEmptyModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzEmptyModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzEmptyModule,
    imports: [NzEmptyComponent, NzEmbedEmptyComponent, NzEmptyDefaultComponent, NzEmptySimpleComponent],
    exports: [NzEmptyComponent, NzEmbedEmptyComponent]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [NzEmptyComponent, NzEmbedEmptyComponent]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzEmptyModule, [{
    type: NgModule,
    args: [{
      imports: [NzEmptyComponent, NzEmbedEmptyComponent, NzEmptyDefaultComponent, NzEmptySimpleComponent],
      exports: [NzEmptyComponent, NzEmbedEmptyComponent]
    }]
  }], null, null);
})();

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-animation.mjs
var NZ_NO_ANIMATION_CLASS = "nz-animate-disabled";
var NzNoAnimationDirective = class _NzNoAnimationDirective {
  animationType = inject(ANIMATION_MODULE_TYPE, {
    optional: true
  });
  nzNoAnimation = input(false, ...ngDevMode ? [{
    debugName: "nzNoAnimation",
    transform: booleanAttribute
  }] : [{
    transform: booleanAttribute
  }]);
  static ɵfac = function NzNoAnimationDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzNoAnimationDirective)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzNoAnimationDirective,
    selectors: [["", "nzNoAnimation", ""]],
    hostVars: 2,
    hostBindings: function NzNoAnimationDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("nz-animate-disabled", ctx.nzNoAnimation() || ctx.animationType === "NoopAnimations");
      }
    },
    inputs: {
      nzNoAnimation: [1, "nzNoAnimation"]
    },
    exportAs: ["nzNoAnimation"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzNoAnimationDirective, [{
    type: Directive,
    args: [{
      selector: "[nzNoAnimation]",
      exportAs: "nzNoAnimation",
      host: {
        [`[class.${NZ_NO_ANIMATION_CLASS}]`]: `nzNoAnimation() || animationType === 'NoopAnimations'`
      }
    }]
  }], null, {
    nzNoAnimation: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "nzNoAnimation",
        required: false
      }]
    }]
  });
})();
var NzNoAnimationModule = class _NzNoAnimationModule {
  static ɵfac = function NzNoAnimationModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzNoAnimationModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzNoAnimationModule,
    imports: [NzNoAnimationDirective],
    exports: [NzNoAnimationDirective]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzNoAnimationModule, [{
    type: NgModule,
    args: [{
      imports: [NzNoAnimationDirective],
      exports: [NzNoAnimationDirective]
    }]
  }], null, null);
})();
function _internalAnimationEnabled() {
  return inject(ANIMATION_MODULE_TYPE, {
    optional: true
  }) !== "NoopAnimations";
}
function isAnimationEnabled(getter) {
  if (typeof ngDevMode !== "undefined" && ngDevMode) {
    assertInInjectionContext(isAnimationEnabled);
  }
  return _internalAnimationEnabled() ? computed(getter) : signal(false);
}
function withAnimationCheck(classNameGetter) {
  if (typeof ngDevMode !== "undefined" && ngDevMode) {
    assertInInjectionContext(withAnimationCheck);
  }
  return _internalAnimationEnabled() ? computed(classNameGetter) : signal(NZ_NO_ANIMATION_CLASS);
}
var COLLAPSE_MOTION_CLASS = "ant-motion-collapse";
var NzAnimationCollapseDirective = class _NzAnimationCollapseDirective {
  elementRef = inject(ElementRef);
  noAnimation = inject(NzNoAnimationDirective, {
    optional: true,
    host: true
  });
  animationEnabled = isAnimationEnabled(() => !this.noAnimation?.nzNoAnimation());
  open = input(false, ...ngDevMode ? [{
    debugName: "open"
  }] : []);
  leavedClassName = input("", ...ngDevMode ? [{
    debugName: "leavedClassName"
  }] : []);
  firstRender = true;
  constructor() {
    effect(() => {
      const open = this.open();
      const animationEnabled = this.animationEnabled() && !this.firstRender;
      const element = this.elementRef.nativeElement;
      const leavedClassName = this.leavedClassName();
      if (open && leavedClassName) {
        element.classList.remove(leavedClassName);
      }
      if (animationEnabled) {
        element.classList.add(COLLAPSE_MOTION_CLASS);
        if (open) {
          requestAnimationFrame(() => {
            const scrollHeight = this.getActualScrollHeight(element);
            element.style.height = coerceCssPixelValue(scrollHeight);
            element.style.opacity = "1";
          });
        } else {
          const scrollHeight = this.getActualScrollHeight(element);
          element.style.height = coerceCssPixelValue(scrollHeight);
          requestAnimationFrame(() => {
            element.style.height = coerceCssPixelValue(0);
            element.style.opacity = "0";
          });
        }
      } else {
        if (open) {
          element.style.height = "auto";
          element.style.opacity = "1";
        } else {
          element.style.height = coerceCssPixelValue(0);
          element.style.opacity = "0";
        }
      }
      this.firstRender = false;
    });
  }
  // Calculate height by summing up direct children's offsetHeight
  // This naturally excludes collapsed nested submenus since they have height: 0
  getActualScrollHeight(element) {
    return Array.from(element.children).reduce((acc, child) => acc + child.offsetHeight, 0);
  }
  onTransitionEnd(event) {
    if (!this.animationEnabled() || event.target !== this.elementRef.nativeElement) {
      return;
    }
    if (this.open()) {
      this.elementRef.nativeElement.style.height = "auto";
    } else if (this.leavedClassName()) {
      this.elementRef.nativeElement.classList.add(this.leavedClassName());
    }
    this.elementRef.nativeElement.classList.remove(COLLAPSE_MOTION_CLASS);
  }
  static ɵfac = function NzAnimationCollapseDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzAnimationCollapseDirective)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzAnimationCollapseDirective,
    selectors: [["", "animation-collapse", ""]],
    hostBindings: function NzAnimationCollapseDirective_HostBindings(rf, ctx) {
      if (rf & 1) {
        ɵɵlistener("transitionend", function NzAnimationCollapseDirective_transitionend_HostBindingHandler($event) {
          return ctx.onTransitionEnd($event);
        });
      }
    },
    inputs: {
      open: [1, "open"],
      leavedClassName: [1, "leavedClassName"]
    }
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzAnimationCollapseDirective, [{
    type: Directive,
    args: [{
      // eslint-disable-next-line @angular-eslint/directive-selector
      selector: "[animation-collapse]",
      host: {
        "(transitionend)": "onTransitionEnd($event)"
      }
    }]
  }], () => [], {
    open: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "open",
        required: false
      }]
    }],
    leavedClassName: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "leavedClassName",
        required: false
      }]
    }]
  });
})();
var NzAnimationTreeCollapseService = class _NzAnimationTreeCollapseService {
  firstRender = true;
  virtualScroll = false;
  animationDone$ = new Subject();
  constructor() {
    this.animationDone$.pipe(debounceTime(50), take(1)).subscribe(() => {
      this.firstRender = false;
    });
  }
  static ɵfac = function NzAnimationTreeCollapseService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzAnimationTreeCollapseService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzAnimationTreeCollapseService,
    factory: _NzAnimationTreeCollapseService.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzAnimationTreeCollapseService, [{
    type: Injectable
  }], () => [], null);
})();
var NzAnimationTreeCollapseDirective = class _NzAnimationTreeCollapseDirective {
  treeCollapseService = inject(NzAnimationTreeCollapseService, {
    optional: true
  });
  noAnimation = inject(NzNoAnimationDirective, {
    optional: true,
    host: true
  });
  // should disable animation in virtual scrolling
  animationEnabled = isAnimationEnabled(() => !this.noAnimation?.nzNoAnimation() && !(this.treeCollapseService?.virtualScroll ?? false));
  get firstRender() {
    return this.treeCollapseService?.firstRender ?? false;
  }
  onAnimationEnter(event) {
    if (!this.animationEnabled() || this.firstRender) {
      this.treeCollapseService?.animationDone$.next();
      event.animationComplete();
      return;
    }
    const element = event.target;
    element.style.height = coerceCssPixelValue(0);
    element.style.opacity = "0";
    element.classList.add(COLLAPSE_MOTION_CLASS);
    const onTransitionEnd = (e) => {
      if (e.propertyName !== "height") {
        return;
      }
      element.removeEventListener("transitionend", onTransitionEnd);
      element.style.height = "auto";
      element.classList.remove(COLLAPSE_MOTION_CLASS);
      event.animationComplete();
    };
    requestAnimationFrame(() => {
      element.style.height = coerceCssPixelValue(element.scrollHeight);
      element.style.opacity = "1";
    });
    element.addEventListener("transitionend", onTransitionEnd);
  }
  onAnimationLeave(event) {
    if (!this.animationEnabled()) {
      event.animationComplete();
      return;
    }
    const element = event.target;
    element.style.height = coerceCssPixelValue(element.scrollHeight);
    element.style.opacity = "1";
    element.classList.add(COLLAPSE_MOTION_CLASS);
    const onTransitionEnd = (e) => {
      if (e.propertyName !== "height") {
        return;
      }
      element.removeEventListener("transitionend", onTransitionEnd);
      event.animationComplete();
    };
    requestAnimationFrame(() => {
      element.style.height = coerceCssPixelValue(0);
      element.style.opacity = "0";
      element.style.marginBottom = "0";
    });
    element.addEventListener("transitionend", onTransitionEnd);
  }
  static ɵfac = function NzAnimationTreeCollapseDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzAnimationTreeCollapseDirective)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzAnimationTreeCollapseDirective,
    selectors: [["", "animation-tree-collapse", ""]],
    hostBindings: function NzAnimationTreeCollapseDirective_HostBindings(rf, ctx) {
      if (rf & 1) {
        ɵɵanimateEnterListener(function NzAnimationTreeCollapseDirective_animateenter_HostBindingHandler($event) {
          return ctx.onAnimationEnter($event);
        });
        ɵɵanimateLeaveListener(function NzAnimationTreeCollapseDirective_animateleave_HostBindingHandler($event) {
          return ctx.onAnimationLeave($event);
        });
      }
    }
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzAnimationTreeCollapseDirective, [{
    type: Directive,
    args: [{
      // eslint-disable-next-line @angular-eslint/directive-selector
      selector: "[animation-tree-collapse]",
      host: {
        "(animate.enter)": "onAnimationEnter($event)",
        "(animate.leave)": "onAnimationLeave($event)"
      }
    }]
  }], null, null);
})();
var SLIDE_ANIMATION_CLASS = {
  enter: "ant-slide-up-enter ant-slide-up-enter-active",
  leave: "ant-slide-up-leave ant-slide-up-leave-active"
};
var slideAnimationEnter = () => withAnimationCheck(() => SLIDE_ANIMATION_CLASS.enter);
var slideAnimationLeave = () => withAnimationCheck(() => SLIDE_ANIMATION_CLASS.leave);

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-form.mjs
function NzFormItemFeedbackIconComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 0);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("nzType", ctx_r0.iconType);
  }
}
var NzFormStatusService = class _NzFormStatusService {
  formStatusChanges = new ReplaySubject(1);
  static ɵfac = function NzFormStatusService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzFormStatusService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzFormStatusService,
    factory: _NzFormStatusService.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzFormStatusService, [{
    type: Injectable
  }], null, null);
})();
var NzFormNoStatusService = class _NzFormNoStatusService {
  noFormStatus = new BehaviorSubject(false);
  static ɵfac = function NzFormNoStatusService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzFormNoStatusService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzFormNoStatusService,
    factory: _NzFormNoStatusService.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzFormNoStatusService, [{
    type: Injectable
  }], null, null);
})();
var iconTypeMap = {
  error: "close-circle-fill",
  validating: "loading",
  success: "check-circle-fill",
  warning: "exclamation-circle-fill"
};
var NzFormItemFeedbackIconComponent = class _NzFormItemFeedbackIconComponent {
  cdr = inject(ChangeDetectorRef);
  status = "";
  iconType = null;
  ngOnChanges(_changes) {
    this.updateIcon();
  }
  updateIcon() {
    this.iconType = this.status ? iconTypeMap[this.status] : null;
    this.cdr.markForCheck();
  }
  static ɵfac = function NzFormItemFeedbackIconComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzFormItemFeedbackIconComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzFormItemFeedbackIconComponent,
    selectors: [["nz-form-item-feedback-icon"]],
    hostAttrs: [1, "ant-form-item-feedback-icon"],
    hostVars: 8,
    hostBindings: function NzFormItemFeedbackIconComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("ant-form-item-feedback-icon-error", ctx.status === "error")("ant-form-item-feedback-icon-warning", ctx.status === "warning")("ant-form-item-feedback-icon-success", ctx.status === "success")("ant-form-item-feedback-icon-validating", ctx.status === "validating");
      }
    },
    inputs: {
      status: "status"
    },
    exportAs: ["nzFormFeedbackIcon"],
    features: [ɵɵNgOnChangesFeature],
    decls: 1,
    vars: 1,
    consts: [[3, "nzType"]],
    template: function NzFormItemFeedbackIconComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵconditionalCreate(0, NzFormItemFeedbackIconComponent_Conditional_0_Template, 1, 1, "nz-icon", 0);
      }
      if (rf & 2) {
        ɵɵconditional(ctx.iconType ? 0 : -1);
      }
    },
    dependencies: [NzIconModule, NzIconDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzFormItemFeedbackIconComponent, [{
    type: Component,
    args: [{
      selector: "nz-form-item-feedback-icon",
      exportAs: "nzFormFeedbackIcon",
      imports: [NzIconModule],
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    @if (iconType) {
      <nz-icon [nzType]="iconType" />
    }
  `,
      host: {
        class: "ant-form-item-feedback-icon",
        "[class.ant-form-item-feedback-icon-error]": 'status==="error"',
        "[class.ant-form-item-feedback-icon-warning]": 'status==="warning"',
        "[class.ant-form-item-feedback-icon-success]": 'status==="success"',
        "[class.ant-form-item-feedback-icon-validating]": 'status==="validating"'
      }
    }]
  }], null, {
    status: [{
      type: Input
    }]
  });
})();

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-select.mjs
var _c02 = ["*"];
function NzOptionItemGroupComponent_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.nzLabel);
  }
}
function NzOptionItemComponent_Conditional_1_ng_template_0_Template(rf, ctx) {
}
function NzOptionItemComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzOptionItemComponent_Conditional_1_ng_template_0_Template, 0, 0, "ng-template", 1);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("ngTemplateOutlet", ctx_r0.template);
  }
}
function NzOptionItemComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵtextInterpolate1(" ", ctx_r0.label, " ");
  }
}
function NzOptionItemComponent_Conditional_3_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 3);
  }
}
function NzOptionItemComponent_Conditional_3_Conditional_2_ng_template_0_Template(rf, ctx) {
}
function NzOptionItemComponent_Conditional_3_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzOptionItemComponent_Conditional_3_Conditional_2_ng_template_0_Template, 0, 0, "ng-template", 1);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("ngTemplateOutlet", ctx_r0.icon);
  }
}
function NzOptionItemComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 2);
    ɵɵconditionalCreate(1, NzOptionItemComponent_Conditional_3_Conditional_1_Template, 1, 0, "nz-icon", 3)(2, NzOptionItemComponent_Conditional_3_Conditional_2_Template, 1, 1, null, 1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵconditional(!ctx_r0.icon ? 1 : 2);
  }
}
function NzOptionContainerComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 0);
    ɵɵelement(1, "nz-embed-empty", 4);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("specificContent", ctx_r0.notFoundContent);
  }
}
function NzOptionContainerComponent_ng_template_3_Case_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-option-item-group", 5);
  }
  if (rf & 2) {
    const item_r2 = ɵɵnextContext().$implicit;
    ɵɵproperty("nzLabel", item_r2.groupLabel ?? null);
  }
}
function NzOptionContainerComponent_ng_template_3_Case_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "nz-option-item", 7);
    ɵɵlistener("itemHover", function NzOptionContainerComponent_ng_template_3_Case_1_Template_nz_option_item_itemHover_0_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r0 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r0.onItemHover($event));
    })("itemClick", function NzOptionContainerComponent_ng_template_3_Case_1_Template_nz_option_item_itemClick_0_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r0 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r0.onItemClick($event));
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const item_r2 = ɵɵnextContext().$implicit;
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("icon", ctx_r0.menuItemSelectedIcon)("customContent", item_r2.nzCustomContent)("template", item_r2.template ?? null)("grouped", !!item_r2.groupLabel)("disabled", item_r2.nzDisabled || ctx_r0.isMaxMultipleCountReached && !ctx_r0.listOfSelectedValue.includes(item_r2["nzValue"]))("showState", ctx_r0.mode === "tags" || ctx_r0.mode === "multiple")("title", item_r2.nzTitle)("label", item_r2.nzLabel)("compareWith", ctx_r0.compareWith)("activatedValue", ctx_r0.activatedValue)("listOfSelectedValue", ctx_r0.listOfSelectedValue)("value", item_r2.nzValue);
  }
}
function NzOptionContainerComponent_ng_template_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzOptionContainerComponent_ng_template_3_Case_0_Template, 1, 1, "nz-option-item-group", 5)(1, NzOptionContainerComponent_ng_template_3_Case_1_Template, 1, 12, "nz-option-item", 6);
  }
  if (rf & 2) {
    let tmp_2_0;
    const item_r2 = ctx.$implicit;
    ɵɵconditional((tmp_2_0 = item_r2.type) === "group" ? 0 : tmp_2_0 === "item" ? 1 : -1);
  }
}
function NzOptionContainerComponent_ng_template_4_Template(rf, ctx) {
}
function NzOptionComponent_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵprojection(0);
  }
}
function NzSelectArrowComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span");
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵtextInterpolate2("", ctx_r0.listOfValue.length, " / ", ctx_r0.nzMaxMultipleCount);
  }
}
function NzSelectArrowComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 0);
  }
}
function NzSelectArrowComponent_Conditional_2_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 2);
  }
}
function NzSelectArrowComponent_Conditional_2_Conditional_0_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 3);
  }
}
function NzSelectArrowComponent_Conditional_2_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzSelectArrowComponent_Conditional_2_Conditional_0_Conditional_0_Template, 1, 0, "nz-icon", 2)(1, NzSelectArrowComponent_Conditional_2_Conditional_0_Conditional_1_Template, 1, 0, "nz-icon", 3);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵconditional(ctx_r0.search ? 0 : 1);
  }
}
function NzSelectArrowComponent_Conditional_2_Conditional_1_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵelement(1, "nz-icon", 4);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const suffixIcon_r2 = ctx.$implicit;
    ɵɵadvance();
    ɵɵproperty("nzType", suffixIcon_r2);
  }
}
function NzSelectArrowComponent_Conditional_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzSelectArrowComponent_Conditional_2_Conditional_1_ng_container_0_Template, 2, 1, "ng-container", 1);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("nzStringTemplateOutlet", ctx_r0.suffixIcon);
  }
}
function NzSelectArrowComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzSelectArrowComponent_Conditional_2_Conditional_0_Template, 2, 1)(1, NzSelectArrowComponent_Conditional_2_Conditional_1_Template, 1, 1, "ng-container");
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵconditional(ctx_r0.showArrow && !ctx_r0.suffixIcon ? 0 : 1);
  }
}
function NzSelectArrowComponent_ng_container_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.feedbackIcon);
  }
}
function NzSelectClearComponent_Conditional_0_ng_template_0_Template(rf, ctx) {
}
function NzSelectClearComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzSelectClearComponent_Conditional_0_ng_template_0_Template, 0, 0, "ng-template", 0);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("ngTemplateOutlet", ctx_r0.clearIcon);
  }
}
function NzSelectClearComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 1);
  }
}
function NzSelectItemComponent_ng_container_0_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "span", 4);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵclassProp("ant-select-selection-item-content", ctx_r0.deletable);
    ɵɵproperty("innerHTML", ctx_r0.label, ɵɵsanitizeHtml);
  }
}
function NzSelectItemComponent_ng_container_0_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span");
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵclassProp("ant-select-selection-item-content", ctx_r0.deletable);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.label);
  }
}
function NzSelectItemComponent_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵconditionalCreate(1, NzSelectItemComponent_ng_container_0_Conditional_1_Template, 1, 3, "span", 2)(2, NzSelectItemComponent_ng_container_0_Conditional_2_Template, 2, 3, "span", 3);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵconditional(ctx_r0.displayLabelInHtml ? 1 : 2);
  }
}
function NzSelectItemComponent_Conditional_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 6);
  }
}
function NzSelectItemComponent_Conditional_1_Conditional_2_ng_template_0_Template(rf, ctx) {
}
function NzSelectItemComponent_Conditional_1_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzSelectItemComponent_Conditional_1_Conditional_2_ng_template_0_Template, 0, 0, "ng-template", 7);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("ngTemplateOutlet", ctx_r0.removeIcon);
  }
}
function NzSelectItemComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "span", 5);
    ɵɵlistener("click", function NzSelectItemComponent_Conditional_1_Template_span_click_0_listener($event) {
      ɵɵrestoreView(_r2);
      const ctx_r0 = ɵɵnextContext();
      return ɵɵresetView(ctx_r0.onDelete($event));
    });
    ɵɵconditionalCreate(1, NzSelectItemComponent_Conditional_1_Conditional_1_Template, 1, 0, "nz-icon", 6)(2, NzSelectItemComponent_Conditional_1_Conditional_2_Template, 1, 1, null, 7);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵconditional(!ctx_r0.removeIcon ? 1 : 2);
  }
}
function NzSelectPlaceholderComponent_ng_container_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", ctx_r0.placeholder, " ");
  }
}
var _c1 = ["inputElement"];
var _c2 = ["mirrorElement"];
function NzSelectSearchComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "span", 3, 1);
  }
}
var _forTrack0 = ($index, $item) => $item.nzValue;
function NzSelectTopControlComponent_Conditional_0_ng_container_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementContainerStart(0);
    ɵɵtext(1);
    ɵɵelementContainerEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵtextInterpolate(ctx_r0.prefix);
  }
}
function NzSelectTopControlComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 0);
    ɵɵtemplate(1, NzSelectTopControlComponent_Conditional_0_ng_container_1_Template, 2, 1, "ng-container", 4);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("nzStringTemplateOutlet", ctx_r0.prefix);
  }
}
function NzSelectTopControlComponent_Case_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-select-item", 6);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("removeIcon", ctx_r0.removeIcon)("label", ctx_r0.listOfTopItem[0].nzLabel)("contentTemplateOutlet", ctx_r0.customTemplate)("contentTemplateOutletContext", ctx_r0.listOfTopItem[0]);
  }
}
function NzSelectTopControlComponent_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "nz-select-search", 5);
    ɵɵlistener("isComposingChange", function NzSelectTopControlComponent_Case_2_Template_nz_select_search_isComposingChange_0_listener($event) {
      ɵɵrestoreView(_r2);
      const ctx_r0 = ɵɵnextContext();
      return ɵɵresetView(ctx_r0.isComposingChange($event));
    })("valueChange", function NzSelectTopControlComponent_Case_2_Template_nz_select_search_valueChange_0_listener($event) {
      ɵɵrestoreView(_r2);
      const ctx_r0 = ɵɵnextContext();
      return ɵɵresetView(ctx_r0.onInputValueChange($event));
    });
    ɵɵelementEnd();
    ɵɵconditionalCreate(1, NzSelectTopControlComponent_Case_2_Conditional_1_Template, 1, 4, "nz-select-item", 6);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("nzId", ctx_r0.nzId)("disabled", ctx_r0.disabled)("value", ctx_r0.inputValue)("showInput", ctx_r0.showSearch)("mirrorSync", false)("autofocus", ctx_r0.autofocus)("focusTrigger", ctx_r0.open);
    ɵɵadvance();
    ɵɵconditional(ctx_r0.isShowSingleLabel ? 1 : -1);
  }
}
function NzSelectTopControlComponent_Case_3_For_2_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 7)(1, "nz-select-item", 10);
    ɵɵlistener("delete", function NzSelectTopControlComponent_Case_3_For_2_Template_nz_select_item_delete_1_listener() {
      const item_r5 = ɵɵrestoreView(_r4).$implicit;
      const ctx_r0 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r0.onDeleteItem(item_r5.contentTemplateOutletContext));
    });
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const item_r5 = ctx.$implicit;
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("removeIcon", ctx_r0.removeIcon)("label", item_r5.nzLabel)("disabled", item_r5.nzDisabled || ctx_r0.disabled)("contentTemplateOutlet", item_r5.contentTemplateOutlet)("contentTemplateOutletContext", item_r5.contentTemplateOutletContext);
  }
}
function NzSelectTopControlComponent_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 2);
    ɵɵrepeaterCreate(1, NzSelectTopControlComponent_Case_3_For_2_Template, 2, 5, "div", 7, _forTrack0);
    ɵɵelementStart(3, "div", 8)(4, "nz-select-search", 9);
    ɵɵlistener("isComposingChange", function NzSelectTopControlComponent_Case_3_Template_nz_select_search_isComposingChange_4_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r0 = ɵɵnextContext();
      return ɵɵresetView(ctx_r0.isComposingChange($event));
    })("valueChange", function NzSelectTopControlComponent_Case_3_Template_nz_select_search_valueChange_4_listener($event) {
      ɵɵrestoreView(_r3);
      const ctx_r0 = ɵɵnextContext();
      return ɵɵresetView(ctx_r0.onInputValueChange($event));
    });
    ɵɵelementEnd()()();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵrepeater(ctx_r0.listOfSlicedItem);
    ɵɵadvance(3);
    ɵɵproperty("nzId", ctx_r0.nzId)("disabled", ctx_r0.disabled)("value", ctx_r0.inputValue)("autofocus", ctx_r0.autofocus)("showInput", true)("mirrorSync", true)("focusTrigger", ctx_r0.open);
  }
}
function NzSelectTopControlComponent_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-select-placeholder", 3);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵproperty("placeholder", ctx_r0.placeHolder);
  }
}
function NzSelectComponent_Conditional_2_ng_template_1_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-form-item-feedback-icon", 6);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵproperty("status", ctx_r1.status);
  }
}
function NzSelectComponent_Conditional_2_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzSelectComponent_Conditional_2_ng_template_1_Conditional_0_Template, 1, 1, "nz-form-item-feedback-icon", 6);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵconditional(ctx_r1.hasFeedback && !!ctx_r1.status ? 0 : -1);
  }
}
function NzSelectComponent_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "nz-select-arrow", 3);
    ɵɵtemplate(1, NzSelectComponent_Conditional_2_ng_template_1_Template, 1, 1, "ng-template", null, 1, ɵɵtemplateRefExtractor);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const feedbackIconTpl_r3 = ɵɵreference(2);
    const ctx_r1 = ɵɵnextContext();
    ɵɵproperty("showArrow", ctx_r1.nzShowArrow)("loading", ctx_r1.nzLoading)("search", ctx_r1.nzOpen && ctx_r1.nzShowSearch)("suffixIcon", ctx_r1.nzSuffixIcon)("feedbackIcon", feedbackIconTpl_r3)("nzMaxMultipleCount", ctx_r1.nzMaxMultipleCount)("listOfValue", ctx_r1.listOfValue)("isMaxMultipleCountSet", ctx_r1.isMaxMultipleCountSet);
  }
}
function NzSelectComponent_Conditional_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "nz-select-clear", 7);
    ɵɵlistener("clear", function NzSelectComponent_Conditional_3_Template_nz_select_clear_clear_0_listener() {
      ɵɵrestoreView(_r4);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.onClearSelection());
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵproperty("clearIcon", ctx_r1.nzClearIcon);
  }
}
function NzSelectComponent_ng_template_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r5 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "nz-option-container", 8);
    ɵɵanimateLeave(function NzSelectComponent_ng_template_4_Template_animateleave_cb() {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.selectAnimationLeave());
    });
    ɵɵanimateEnter(function NzSelectComponent_ng_template_4_Template_animateenter_cb() {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.selectAnimationEnter());
    });
    ɵɵlistener("keydown", function NzSelectComponent_ng_template_4_Template_nz_option_container_keydown_0_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.onKeyDown($event));
    })("itemClick", function NzSelectComponent_ng_template_4_Template_nz_option_container_itemClick_0_listener($event) {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.onItemClick($event));
    })("scrollToBottom", function NzSelectComponent_ng_template_4_Template_nz_option_container_scrollToBottom_0_listener() {
      ɵɵrestoreView(_r5);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.nzScrollToBottom.emit());
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵstyleMap(ctx_r1.nzDropdownStyle);
    ɵɵclassProp("ant-select-dropdown-placement-bottomLeft", ctx_r1.dropdownPosition === "bottomLeft")("ant-select-dropdown-placement-topLeft", ctx_r1.dropdownPosition === "topLeft")("ant-select-dropdown-placement-bottomRight", ctx_r1.dropdownPosition === "bottomRight")("ant-select-dropdown-placement-topRight", ctx_r1.dropdownPosition === "topRight");
    ɵɵproperty("itemSize", ctx_r1.nzOptionHeightPx)("maxItemLength", ctx_r1.nzOptionOverflowSize)("matchWidth", ctx_r1.nzDropdownMatchSelectWidth)("nzNoAnimation", !!(ctx_r1.noAnimation == null ? null : ctx_r1.noAnimation.nzNoAnimation == null ? null : ctx_r1.noAnimation.nzNoAnimation()))("listOfContainerItem", ctx_r1.listOfContainerItem)("menuItemSelectedIcon", ctx_r1.nzMenuItemSelectedIcon)("notFoundContent", ctx_r1.nzNotFoundContent)("activatedValue", ctx_r1.activatedValue)("listOfSelectedValue", ctx_r1.listOfValue)("dropdownRender", ctx_r1.nzDropdownRender)("compareWith", ctx_r1.compareWith)("mode", ctx_r1.nzMode)("isMaxMultipleCountReached", ctx_r1.isMaxMultipleCountReached);
  }
}
var NzOptionGroupComponent = class _NzOptionGroupComponent {
  nzLabel = null;
  changes = new Subject();
  ngOnChanges() {
    this.changes.next();
  }
  static ɵfac = function NzOptionGroupComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzOptionGroupComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzOptionGroupComponent,
    selectors: [["nz-option-group"]],
    inputs: {
      nzLabel: "nzLabel"
    },
    exportAs: ["nzOptionGroup"],
    features: [ɵɵNgOnChangesFeature],
    ngContentSelectors: _c02,
    decls: 1,
    vars: 0,
    template: function NzOptionGroupComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵprojection(0);
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzOptionGroupComponent, [{
    type: Component,
    args: [{
      selector: "nz-option-group",
      exportAs: "nzOptionGroup",
      template: `<ng-content></ng-content>`,
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], null, {
    nzLabel: [{
      type: Input
    }]
  });
})();
var NzOptionItemGroupComponent = class _NzOptionItemGroupComponent {
  nzLabel = null;
  static ɵfac = function NzOptionItemGroupComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzOptionItemGroupComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzOptionItemGroupComponent,
    selectors: [["nz-option-item-group"]],
    hostAttrs: [1, "ant-select-item", "ant-select-item-group"],
    inputs: {
      nzLabel: "nzLabel"
    },
    decls: 1,
    vars: 1,
    consts: [[4, "nzStringTemplateOutlet"]],
    template: function NzOptionItemGroupComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, NzOptionItemGroupComponent_ng_container_0_Template, 2, 1, "ng-container", 0);
      }
      if (rf & 2) {
        ɵɵproperty("nzStringTemplateOutlet", ctx.nzLabel);
      }
    },
    dependencies: [NzOutletModule, NzStringTemplateOutletDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzOptionItemGroupComponent, [{
    type: Component,
    args: [{
      selector: "nz-option-item-group",
      template: `<ng-container *nzStringTemplateOutlet="nzLabel">{{ nzLabel }}</ng-container>`,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      host: {
        class: "ant-select-item ant-select-item-group"
      },
      imports: [NzOutletModule]
    }]
  }], null, {
    nzLabel: [{
      type: Input
    }]
  });
})();
var NzOptionItemComponent = class _NzOptionItemComponent {
  el = inject(ElementRef).nativeElement;
  ngZone = inject(NgZone);
  destroyRef = inject(DestroyRef);
  selected = false;
  activated = false;
  grouped = false;
  customContent = false;
  template = null;
  disabled = false;
  showState = false;
  title;
  label = null;
  value = null;
  activatedValue = null;
  listOfSelectedValue = [];
  icon = null;
  compareWith;
  itemClick = new EventEmitter();
  itemHover = new EventEmitter();
  ngOnChanges(changes) {
    const {
      value,
      activatedValue,
      listOfSelectedValue
    } = changes;
    if (value || listOfSelectedValue) {
      this.selected = this.listOfSelectedValue.some((v) => this.compareWith(v, this.value));
    }
    if (value || activatedValue) {
      this.activated = this.compareWith(this.activatedValue, this.value);
    }
  }
  ngOnInit() {
    fromEventOutsideAngular(this.el, "click").pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.disabled) {
        this.ngZone.run(() => this.itemClick.emit(this.value));
      }
    });
    fromEventOutsideAngular(this.el, "mouseenter").pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (!this.disabled) {
        this.ngZone.run(() => this.itemHover.emit(this.value));
      }
    });
  }
  static ɵfac = function NzOptionItemComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzOptionItemComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzOptionItemComponent,
    selectors: [["nz-option-item"]],
    hostAttrs: [1, "ant-select-item", "ant-select-item-option"],
    hostVars: 9,
    hostBindings: function NzOptionItemComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("title", ctx.title);
        ɵɵclassProp("ant-select-item-option-grouped", ctx.grouped)("ant-select-item-option-selected", ctx.selected && !ctx.disabled)("ant-select-item-option-disabled", ctx.disabled)("ant-select-item-option-active", ctx.activated && !ctx.disabled);
      }
    },
    inputs: {
      grouped: "grouped",
      customContent: [2, "customContent", "customContent", booleanAttribute],
      template: "template",
      disabled: "disabled",
      showState: "showState",
      title: "title",
      label: "label",
      value: "value",
      activatedValue: "activatedValue",
      listOfSelectedValue: "listOfSelectedValue",
      icon: "icon",
      compareWith: "compareWith"
    },
    outputs: {
      itemClick: "itemClick",
      itemHover: "itemHover"
    },
    features: [ɵɵNgOnChangesFeature],
    decls: 4,
    vars: 2,
    consts: [[1, "ant-select-item-option-content"], [3, "ngTemplateOutlet"], ["unselectable", "on", 1, "ant-select-item-option-state"], ["nzType", "check", 1, "ant-select-selected-icon"]],
    template: function NzOptionItemComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelementStart(0, "div", 0);
        ɵɵconditionalCreate(1, NzOptionItemComponent_Conditional_1_Template, 1, 1, null, 1)(2, NzOptionItemComponent_Conditional_2_Template, 1, 1);
        ɵɵelementEnd();
        ɵɵconditionalCreate(3, NzOptionItemComponent_Conditional_3_Template, 3, 1, "div", 2);
      }
      if (rf & 2) {
        ɵɵadvance();
        ɵɵconditional(ctx.customContent ? 1 : 2);
        ɵɵadvance(2);
        ɵɵconditional(ctx.showState && ctx.selected ? 3 : -1);
      }
    },
    dependencies: [NgTemplateOutlet, NzIconModule, NzIconDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzOptionItemComponent, [{
    type: Component,
    args: [{
      selector: "nz-option-item",
      template: `
    <div class="ant-select-item-option-content">
      @if (customContent) {
        <ng-template [ngTemplateOutlet]="template"></ng-template>
      } @else {
        {{ label }}
      }
    </div>
    @if (showState && selected) {
      <div class="ant-select-item-option-state" unselectable="on">
        @if (!icon) {
          <nz-icon nzType="check" class="ant-select-selected-icon" />
        } @else {
          <ng-template [ngTemplateOutlet]="icon"></ng-template>
        }
      </div>
    }
  `,
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      host: {
        class: "ant-select-item ant-select-item-option",
        "[attr.title]": "title",
        "[class.ant-select-item-option-grouped]": "grouped",
        "[class.ant-select-item-option-selected]": "selected && !disabled",
        "[class.ant-select-item-option-disabled]": "disabled",
        "[class.ant-select-item-option-active]": "activated && !disabled"
      },
      imports: [NgTemplateOutlet, NzIconModule]
    }]
  }], null, {
    grouped: [{
      type: Input
    }],
    customContent: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    template: [{
      type: Input
    }],
    disabled: [{
      type: Input
    }],
    showState: [{
      type: Input
    }],
    title: [{
      type: Input
    }],
    label: [{
      type: Input
    }],
    value: [{
      type: Input
    }],
    activatedValue: [{
      type: Input
    }],
    listOfSelectedValue: [{
      type: Input
    }],
    icon: [{
      type: Input
    }],
    compareWith: [{
      type: Input
    }],
    itemClick: [{
      type: Output
    }],
    itemHover: [{
      type: Output
    }]
  });
})();
var NzOptionContainerComponent = class _NzOptionContainerComponent {
  ngZone = inject(NgZone);
  platformId = inject(PLATFORM_ID);
  notFoundContent = void 0;
  menuItemSelectedIcon = null;
  dropdownRender = null;
  activatedValue = null;
  listOfSelectedValue = [];
  compareWith;
  mode = "default";
  matchWidth = true;
  itemSize = 32;
  maxItemLength = 8;
  isMaxMultipleCountReached = false;
  listOfContainerItem = [];
  itemClick = new EventEmitter();
  scrollToBottom = new EventEmitter();
  cdkVirtualScrollViewport;
  scrolledIndex = 0;
  onItemClick(value) {
    this.itemClick.emit(value);
  }
  onItemHover(value) {
    this.activatedValue = value;
  }
  trackValue(_index, option) {
    return option.key;
  }
  onScrolledIndexChange(index) {
    this.scrolledIndex = index;
    if (index === this.listOfContainerItem.length - this.maxItemLength - 1) {
      this.scrollToBottom.emit();
    }
  }
  scrollToActivatedValue() {
    const index = this.listOfContainerItem.findIndex((item) => this.compareWith(item.key, this.activatedValue));
    if (index < this.scrolledIndex || index >= this.scrolledIndex + this.maxItemLength) {
      this.cdkVirtualScrollViewport.scrollToIndex(index || 0);
    }
  }
  ngOnChanges(changes) {
    const {
      listOfContainerItem,
      activatedValue
    } = changes;
    if (listOfContainerItem || activatedValue) {
      this.scrollToActivatedValue();
    }
  }
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.ngZone.runOutsideAngular(() => setTimeout(() => this.scrollToActivatedValue()));
    }
  }
  static ɵfac = function NzOptionContainerComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzOptionContainerComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzOptionContainerComponent,
    selectors: [["nz-option-container"]],
    viewQuery: function NzOptionContainerComponent_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(CdkVirtualScrollViewport, 7);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.cdkVirtualScrollViewport = _t.first);
      }
    },
    hostAttrs: [1, "ant-select-dropdown"],
    inputs: {
      notFoundContent: "notFoundContent",
      menuItemSelectedIcon: "menuItemSelectedIcon",
      dropdownRender: "dropdownRender",
      activatedValue: "activatedValue",
      listOfSelectedValue: "listOfSelectedValue",
      compareWith: "compareWith",
      mode: "mode",
      matchWidth: "matchWidth",
      itemSize: "itemSize",
      maxItemLength: "maxItemLength",
      isMaxMultipleCountReached: "isMaxMultipleCountReached",
      listOfContainerItem: "listOfContainerItem"
    },
    outputs: {
      itemClick: "itemClick",
      scrollToBottom: "scrollToBottom"
    },
    exportAs: ["nzOptionContainer"],
    features: [ɵɵNgOnChangesFeature],
    decls: 5,
    vars: 14,
    consts: [[1, "ant-select-item-empty"], [3, "scrolledIndexChange", "itemSize", "maxBufferPx", "minBufferPx"], ["cdkVirtualFor", "", 3, "cdkVirtualForOf", "cdkVirtualForTrackBy", "cdkVirtualForTemplateCacheSize"], [3, "ngTemplateOutlet"], ["nzComponentName", "select", 3, "specificContent"], [3, "nzLabel"], [3, "icon", "customContent", "template", "grouped", "disabled", "showState", "title", "label", "compareWith", "activatedValue", "listOfSelectedValue", "value"], [3, "itemHover", "itemClick", "icon", "customContent", "template", "grouped", "disabled", "showState", "title", "label", "compareWith", "activatedValue", "listOfSelectedValue", "value"]],
    template: function NzOptionContainerComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵelementStart(0, "div");
        ɵɵconditionalCreate(1, NzOptionContainerComponent_Conditional_1_Template, 2, 1, "div", 0);
        ɵɵelementStart(2, "cdk-virtual-scroll-viewport", 1);
        ɵɵlistener("scrolledIndexChange", function NzOptionContainerComponent_Template_cdk_virtual_scroll_viewport_scrolledIndexChange_2_listener($event) {
          return ctx.onScrolledIndexChange($event);
        });
        ɵɵtemplate(3, NzOptionContainerComponent_ng_template_3_Template, 2, 1, "ng-template", 2);
        ɵɵelementEnd();
        ɵɵtemplate(4, NzOptionContainerComponent_ng_template_4_Template, 0, 0, "ng-template", 3);
        ɵɵelementEnd();
      }
      if (rf & 2) {
        ɵɵadvance();
        ɵɵconditional(ctx.listOfContainerItem.length === 0 ? 1 : -1);
        ɵɵadvance();
        ɵɵstyleProp("height", ctx.listOfContainerItem.length * ctx.itemSize, "px")("max-height", ctx.itemSize * ctx.maxItemLength, "px");
        ɵɵclassProp("full-width", !ctx.matchWidth);
        ɵɵproperty("itemSize", ctx.itemSize)("maxBufferPx", ctx.itemSize * ctx.maxItemLength)("minBufferPx", ctx.itemSize * ctx.maxItemLength);
        ɵɵadvance();
        ɵɵproperty("cdkVirtualForOf", ctx.listOfContainerItem)("cdkVirtualForTrackBy", ctx.trackValue)("cdkVirtualForTemplateCacheSize", 0);
        ɵɵadvance();
        ɵɵproperty("ngTemplateOutlet", ctx.dropdownRender);
      }
    },
    dependencies: [NzEmptyModule, NzEmbedEmptyComponent, NzOptionItemGroupComponent, NzOptionItemComponent, NgTemplateOutlet, OverlayModule, CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport, NzOverlayModule],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzOptionContainerComponent, [{
    type: Component,
    args: [{
      selector: "nz-option-container",
      exportAs: "nzOptionContainer",
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      template: `
    <div>
      @if (listOfContainerItem.length === 0) {
        <div class="ant-select-item-empty">
          <nz-embed-empty nzComponentName="select" [specificContent]="notFoundContent!"></nz-embed-empty>
        </div>
      }
      <cdk-virtual-scroll-viewport
        [class.full-width]="!matchWidth"
        [itemSize]="itemSize"
        [maxBufferPx]="itemSize * maxItemLength"
        [minBufferPx]="itemSize * maxItemLength"
        (scrolledIndexChange)="onScrolledIndexChange($event)"
        [style.height.px]="listOfContainerItem.length * itemSize"
        [style.max-height.px]="itemSize * maxItemLength"
      >
        <ng-template
          cdkVirtualFor
          [cdkVirtualForOf]="listOfContainerItem"
          [cdkVirtualForTrackBy]="trackValue"
          [cdkVirtualForTemplateCacheSize]="0"
          let-item
        >
          @switch (item.type) {
            @case ('group') {
              <nz-option-item-group [nzLabel]="item.groupLabel ?? null"></nz-option-item-group>
            }
            @case ('item') {
              <nz-option-item
                [icon]="menuItemSelectedIcon"
                [customContent]="item.nzCustomContent"
                [template]="item.template ?? null"
                [grouped]="!!item.groupLabel"
                [disabled]="
                  item.nzDisabled || (isMaxMultipleCountReached && !listOfSelectedValue.includes(item['nzValue']))
                "
                [showState]="mode === 'tags' || mode === 'multiple'"
                [title]="item.nzTitle"
                [label]="item.nzLabel"
                [compareWith]="compareWith"
                [activatedValue]="activatedValue"
                [listOfSelectedValue]="listOfSelectedValue"
                [value]="item.nzValue"
                (itemHover)="onItemHover($event)"
                (itemClick)="onItemClick($event)"
              ></nz-option-item>
            }
          }
        </ng-template>
      </cdk-virtual-scroll-viewport>
      <ng-template [ngTemplateOutlet]="dropdownRender"></ng-template>
    </div>
  `,
      host: {
        class: "ant-select-dropdown"
      },
      imports: [NzEmptyModule, NzOptionItemGroupComponent, NzOptionItemComponent, NgTemplateOutlet, OverlayModule, NzOverlayModule]
    }]
  }], null, {
    notFoundContent: [{
      type: Input
    }],
    menuItemSelectedIcon: [{
      type: Input
    }],
    dropdownRender: [{
      type: Input
    }],
    activatedValue: [{
      type: Input
    }],
    listOfSelectedValue: [{
      type: Input
    }],
    compareWith: [{
      type: Input
    }],
    mode: [{
      type: Input
    }],
    matchWidth: [{
      type: Input
    }],
    itemSize: [{
      type: Input
    }],
    maxItemLength: [{
      type: Input
    }],
    isMaxMultipleCountReached: [{
      type: Input
    }],
    listOfContainerItem: [{
      type: Input
    }],
    itemClick: [{
      type: Output
    }],
    scrollToBottom: [{
      type: Output
    }],
    cdkVirtualScrollViewport: [{
      type: ViewChild,
      args: [CdkVirtualScrollViewport, {
        static: true
      }]
    }]
  });
})();
var NzOptionComponent = class _NzOptionComponent {
  destroyRef = inject(DestroyRef);
  nzOptionGroupComponent = inject(NzOptionGroupComponent, {
    optional: true
  });
  changes = new Subject();
  groupLabel = null;
  template;
  nzTitle;
  nzLabel = null;
  nzValue = null;
  nzKey;
  nzDisabled = false;
  nzHide = false;
  nzCustomContent = false;
  ngOnInit() {
    this.nzOptionGroupComponent?.changes.pipe(startWith(true), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.groupLabel = this.nzOptionGroupComponent?.nzLabel;
    });
  }
  ngOnChanges() {
    this.changes.next();
  }
  static ɵfac = function NzOptionComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzOptionComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzOptionComponent,
    selectors: [["nz-option"]],
    viewQuery: function NzOptionComponent_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(TemplateRef, 7);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.template = _t.first);
      }
    },
    inputs: {
      nzTitle: "nzTitle",
      nzLabel: "nzLabel",
      nzValue: "nzValue",
      nzKey: "nzKey",
      nzDisabled: [2, "nzDisabled", "nzDisabled", booleanAttribute],
      nzHide: [2, "nzHide", "nzHide", booleanAttribute],
      nzCustomContent: [2, "nzCustomContent", "nzCustomContent", booleanAttribute]
    },
    exportAs: ["nzOption"],
    features: [ɵɵNgOnChangesFeature],
    ngContentSelectors: _c02,
    decls: 1,
    vars: 0,
    template: function NzOptionComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵprojectionDef();
        ɵɵdomTemplate(0, NzOptionComponent_ng_template_0_Template, 1, 0, "ng-template");
      }
    },
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzOptionComponent, [{
    type: Component,
    args: [{
      selector: "nz-option",
      exportAs: "nzOption",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    <ng-template>
      <ng-content></ng-content>
    </ng-template>
  `
    }]
  }], null, {
    template: [{
      type: ViewChild,
      args: [TemplateRef, {
        static: true
      }]
    }],
    nzTitle: [{
      type: Input
    }],
    nzLabel: [{
      type: Input
    }],
    nzValue: [{
      type: Input
    }],
    nzKey: [{
      type: Input
    }],
    nzDisabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzHide: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzCustomContent: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }]
  });
})();
var NzSelectArrowComponent = class _NzSelectArrowComponent {
  listOfValue = [];
  loading = false;
  search = false;
  showArrow = false;
  isMaxMultipleCountSet = false;
  suffixIcon = null;
  feedbackIcon = null;
  nzMaxMultipleCount = Infinity;
  static ɵfac = function NzSelectArrowComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSelectArrowComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzSelectArrowComponent,
    selectors: [["nz-select-arrow"]],
    hostAttrs: [1, "ant-select-arrow"],
    hostVars: 2,
    hostBindings: function NzSelectArrowComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("ant-select-arrow-loading", ctx.loading);
      }
    },
    inputs: {
      listOfValue: "listOfValue",
      loading: "loading",
      search: "search",
      showArrow: "showArrow",
      isMaxMultipleCountSet: "isMaxMultipleCountSet",
      suffixIcon: "suffixIcon",
      feedbackIcon: "feedbackIcon",
      nzMaxMultipleCount: [2, "nzMaxMultipleCount", "nzMaxMultipleCount", numberAttributeWithInfinityFallback]
    },
    decls: 4,
    vars: 3,
    consts: [["nzType", "loading"], [4, "nzStringTemplateOutlet"], ["nzType", "search"], ["nzType", "down"], [3, "nzType"]],
    template: function NzSelectArrowComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵconditionalCreate(0, NzSelectArrowComponent_Conditional_0_Template, 2, 2, "span");
        ɵɵconditionalCreate(1, NzSelectArrowComponent_Conditional_1_Template, 1, 0, "nz-icon", 0)(2, NzSelectArrowComponent_Conditional_2_Template, 2, 1);
        ɵɵtemplate(3, NzSelectArrowComponent_ng_container_3_Template, 2, 1, "ng-container", 1);
      }
      if (rf & 2) {
        ɵɵconditional(ctx.isMaxMultipleCountSet ? 0 : -1);
        ɵɵadvance();
        ɵɵconditional(ctx.loading ? 1 : 2);
        ɵɵadvance(2);
        ɵɵproperty("nzStringTemplateOutlet", ctx.feedbackIcon);
      }
    },
    dependencies: [NzIconModule, NzIconDirective, NzOutletModule, NzStringTemplateOutletDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSelectArrowComponent, [{
    type: Component,
    args: [{
      selector: "nz-select-arrow",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    @if (isMaxMultipleCountSet) {
      <span>{{ listOfValue.length }} / {{ nzMaxMultipleCount }}</span>
    }
    @if (loading) {
      <nz-icon nzType="loading" />
    } @else {
      @if (showArrow && !suffixIcon) {
        @if (search) {
          <nz-icon nzType="search" />
        } @else {
          <nz-icon nzType="down" />
        }
      } @else {
        <ng-container *nzStringTemplateOutlet="suffixIcon; let suffixIcon">
          <nz-icon [nzType]="suffixIcon" />
        </ng-container>
      }
    }
    <ng-container *nzStringTemplateOutlet="feedbackIcon">{{ feedbackIcon }}</ng-container>
  `,
      host: {
        class: "ant-select-arrow",
        "[class.ant-select-arrow-loading]": "loading"
      },
      imports: [NzIconModule, NzOutletModule]
    }]
  }], null, {
    listOfValue: [{
      type: Input
    }],
    loading: [{
      type: Input
    }],
    search: [{
      type: Input
    }],
    showArrow: [{
      type: Input
    }],
    isMaxMultipleCountSet: [{
      type: Input
    }],
    suffixIcon: [{
      type: Input
    }],
    feedbackIcon: [{
      type: Input
    }],
    nzMaxMultipleCount: [{
      type: Input,
      args: [{
        transform: numberAttributeWithInfinityFallback
      }]
    }]
  });
})();
var NzSelectClearComponent = class _NzSelectClearComponent {
  clearIcon = null;
  clear = new EventEmitter();
  onClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.clear.emit(e);
  }
  static ɵfac = function NzSelectClearComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSelectClearComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzSelectClearComponent,
    selectors: [["nz-select-clear"]],
    hostAttrs: [1, "ant-select-clear"],
    hostBindings: function NzSelectClearComponent_HostBindings(rf, ctx) {
      if (rf & 1) {
        ɵɵlistener("click", function NzSelectClearComponent_click_HostBindingHandler($event) {
          return ctx.onClick($event);
        });
      }
    },
    inputs: {
      clearIcon: "clearIcon"
    },
    outputs: {
      clear: "clear"
    },
    decls: 2,
    vars: 1,
    consts: [[3, "ngTemplateOutlet"], ["nzType", "close-circle", "nzTheme", "fill", 1, "ant-select-close-icon"]],
    template: function NzSelectClearComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵconditionalCreate(0, NzSelectClearComponent_Conditional_0_Template, 1, 1, null, 0)(1, NzSelectClearComponent_Conditional_1_Template, 1, 0, "nz-icon", 1);
      }
      if (rf & 2) {
        ɵɵconditional(ctx.clearIcon ? 0 : 1);
      }
    },
    dependencies: [NgTemplateOutlet, NzIconModule, NzIconDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSelectClearComponent, [{
    type: Component,
    args: [{
      selector: "nz-select-clear",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    @if (clearIcon) {
      <ng-template [ngTemplateOutlet]="clearIcon"></ng-template>
    } @else {
      <nz-icon nzType="close-circle" nzTheme="fill" class="ant-select-close-icon" />
    }
  `,
      host: {
        class: "ant-select-clear",
        "(click)": "onClick($event)"
      },
      imports: [NgTemplateOutlet, NzIconModule]
    }]
  }], null, {
    clearIcon: [{
      type: Input
    }],
    clear: [{
      type: Output
    }]
  });
})();
var NzSelectItemComponent = class _NzSelectItemComponent {
  disabled = false;
  label = null;
  /**
   * @internal Internally used, please do not use it directly.
   * @description Whether the label is in HTML format.
   */
  displayLabelInHtml = false;
  deletable = false;
  removeIcon = null;
  contentTemplateOutletContext = null;
  contentTemplateOutlet = null;
  delete = new EventEmitter();
  get templateOutletContext() {
    return __spreadValues({
      $implicit: this.contentTemplateOutletContext
    }, this.contentTemplateOutletContext);
  }
  onDelete(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.disabled) {
      this.delete.next(e);
    }
  }
  static ɵfac = function NzSelectItemComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSelectItemComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzSelectItemComponent,
    selectors: [["nz-select-item"]],
    hostAttrs: [1, "ant-select-selection-item"],
    hostVars: 3,
    hostBindings: function NzSelectItemComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("title", ctx.label);
        ɵɵclassProp("ant-select-selection-item-disabled", ctx.disabled);
      }
    },
    inputs: {
      disabled: [2, "disabled", "disabled", booleanAttribute],
      label: "label",
      displayLabelInHtml: [2, "displayLabelInHtml", "displayLabelInHtml", booleanAttribute],
      deletable: [2, "deletable", "deletable", booleanAttribute],
      removeIcon: "removeIcon",
      contentTemplateOutletContext: "contentTemplateOutletContext",
      contentTemplateOutlet: "contentTemplateOutlet"
    },
    outputs: {
      delete: "delete"
    },
    decls: 2,
    vars: 3,
    consts: [[4, "nzStringTemplateOutlet", "nzStringTemplateOutletContext"], [1, "ant-select-selection-item-remove"], [3, "ant-select-selection-item-content", "innerHTML"], [3, "ant-select-selection-item-content"], [3, "innerHTML"], [1, "ant-select-selection-item-remove", 3, "click"], ["nzType", "close"], [3, "ngTemplateOutlet"]],
    template: function NzSelectItemComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, NzSelectItemComponent_ng_container_0_Template, 3, 1, "ng-container", 0);
        ɵɵconditionalCreate(1, NzSelectItemComponent_Conditional_1_Template, 3, 1, "span", 1);
      }
      if (rf & 2) {
        ɵɵproperty("nzStringTemplateOutlet", ctx.contentTemplateOutlet)("nzStringTemplateOutletContext", ctx.templateOutletContext);
        ɵɵadvance();
        ɵɵconditional(ctx.deletable && !ctx.disabled ? 1 : -1);
      }
    },
    dependencies: [NgTemplateOutlet, NzOutletModule, NzStringTemplateOutletDirective, NzIconModule, NzIconDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSelectItemComponent, [{
    type: Component,
    args: [{
      selector: "nz-select-item",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    <ng-container *nzStringTemplateOutlet="contentTemplateOutlet; context: templateOutletContext">
      @if (displayLabelInHtml) {
        <span [class.ant-select-selection-item-content]="deletable" [innerHTML]="label"></span>
      } @else {
        <span [class.ant-select-selection-item-content]="deletable">{{ label }}</span>
      }
    </ng-container>
    @if (deletable && !disabled) {
      <span class="ant-select-selection-item-remove" (click)="onDelete($event)">
        @if (!removeIcon) {
          <nz-icon nzType="close" />
        } @else {
          <ng-template [ngTemplateOutlet]="removeIcon"></ng-template>
        }
      </span>
    }
  `,
      host: {
        class: "ant-select-selection-item",
        "[attr.title]": "label",
        "[class.ant-select-selection-item-disabled]": "disabled"
      },
      imports: [NgTemplateOutlet, NzOutletModule, NzIconModule]
    }]
  }], null, {
    disabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    label: [{
      type: Input
    }],
    displayLabelInHtml: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    deletable: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    removeIcon: [{
      type: Input
    }],
    contentTemplateOutletContext: [{
      type: Input
    }],
    contentTemplateOutlet: [{
      type: Input
    }],
    delete: [{
      type: Output
    }]
  });
})();
var NzSelectPlaceholderComponent = class _NzSelectPlaceholderComponent {
  placeholder = null;
  static ɵfac = function NzSelectPlaceholderComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSelectPlaceholderComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzSelectPlaceholderComponent,
    selectors: [["nz-select-placeholder"]],
    hostAttrs: [1, "ant-select-selection-placeholder"],
    inputs: {
      placeholder: "placeholder"
    },
    decls: 1,
    vars: 1,
    consts: [[4, "nzStringTemplateOutlet"]],
    template: function NzSelectPlaceholderComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, NzSelectPlaceholderComponent_ng_container_0_Template, 2, 1, "ng-container", 0);
      }
      if (rf & 2) {
        ɵɵproperty("nzStringTemplateOutlet", ctx.placeholder);
      }
    },
    dependencies: [NzOutletModule, NzStringTemplateOutletDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSelectPlaceholderComponent, [{
    type: Component,
    args: [{
      selector: "nz-select-placeholder",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    <ng-container *nzStringTemplateOutlet="placeholder">
      {{ placeholder }}
    </ng-container>
  `,
      host: {
        class: "ant-select-selection-placeholder"
      },
      imports: [NzOutletModule]
    }]
  }], null, {
    placeholder: [{
      type: Input
    }]
  });
})();
var NzSelectSearchComponent = class _NzSelectSearchComponent {
  elementRef = inject(ElementRef);
  renderer = inject(Renderer2);
  focusMonitor = inject(FocusMonitor);
  nzId = null;
  disabled = false;
  mirrorSync = false;
  showInput = true;
  focusTrigger = false;
  value = "";
  autofocus = false;
  valueChange = new EventEmitter();
  isComposingChange = new EventEmitter();
  inputElement;
  mirrorElement;
  constructor() {
    afterNextRender(() => {
      if (this.mirrorSync) {
        this.syncMirrorWidth();
      }
      if (this.autofocus) {
        this.focus();
      }
    });
  }
  setCompositionState(isComposing) {
    this.isComposingChange.next(isComposing);
  }
  onValueChange(value) {
    this.value = value;
    this.valueChange.next(value);
    if (this.mirrorSync) {
      this.syncMirrorWidth();
    }
  }
  clearInputValue() {
    const inputDOM = this.inputElement.nativeElement;
    inputDOM.value = "";
    this.onValueChange("");
  }
  syncMirrorWidth() {
    const mirrorDOM = this.mirrorElement.nativeElement;
    const hostDOM = this.elementRef.nativeElement;
    const inputDOM = this.inputElement.nativeElement;
    this.renderer.removeStyle(hostDOM, "width");
    this.renderer.setProperty(mirrorDOM, "textContent", `${inputDOM.value} `);
    this.renderer.setStyle(hostDOM, "width", `${mirrorDOM.scrollWidth}px`);
  }
  focus() {
    this.focusMonitor.focusVia(this.inputElement, "keyboard");
  }
  blur() {
    this.inputElement.nativeElement.blur();
  }
  ngOnChanges(changes) {
    const inputDOM = this.inputElement.nativeElement;
    const {
      focusTrigger,
      showInput
    } = changes;
    if (showInput) {
      if (this.showInput) {
        this.renderer.removeAttribute(inputDOM, "readonly");
      } else {
        this.renderer.setAttribute(inputDOM, "readonly", "readonly");
      }
    }
    if (focusTrigger && focusTrigger.currentValue === true && focusTrigger.previousValue === false) {
      inputDOM.focus();
    }
  }
  static ɵfac = function NzSelectSearchComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSelectSearchComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzSelectSearchComponent,
    selectors: [["nz-select-search"]],
    viewQuery: function NzSelectSearchComponent_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(_c1, 7)(_c2, 5);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.inputElement = _t.first);
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.mirrorElement = _t.first);
      }
    },
    hostAttrs: [1, "ant-select-selection-search"],
    hostVars: 2,
    hostBindings: function NzSelectSearchComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵstyleProp("width", ctx.mirrorSync ? 0 : null, "px");
      }
    },
    inputs: {
      nzId: "nzId",
      disabled: "disabled",
      mirrorSync: "mirrorSync",
      showInput: "showInput",
      focusTrigger: "focusTrigger",
      value: "value",
      autofocus: "autofocus"
    },
    outputs: {
      valueChange: "valueChange",
      isComposingChange: "isComposingChange"
    },
    features: [ɵɵProvidersFeature([{
      provide: COMPOSITION_BUFFER_MODE,
      useValue: false
    }]), ɵɵNgOnChangesFeature],
    decls: 3,
    vars: 7,
    consts: [["inputElement", ""], ["mirrorElement", ""], ["autocomplete", "off", 1, "ant-select-selection-search-input", 3, "ngModelChange", "compositionstart", "compositionend", "ngModel", "disabled"], [1, "ant-select-selection-search-mirror"]],
    template: function NzSelectSearchComponent_Template(rf, ctx) {
      if (rf & 1) {
        const _r1 = ɵɵgetCurrentView();
        ɵɵelementStart(0, "input", 2, 0);
        ɵɵlistener("ngModelChange", function NzSelectSearchComponent_Template_input_ngModelChange_0_listener($event) {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.onValueChange($event));
        })("compositionstart", function NzSelectSearchComponent_Template_input_compositionstart_0_listener() {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.setCompositionState(true));
        })("compositionend", function NzSelectSearchComponent_Template_input_compositionend_0_listener() {
          ɵɵrestoreView(_r1);
          return ɵɵresetView(ctx.setCompositionState(false));
        });
        ɵɵelementEnd();
        ɵɵconditionalCreate(2, NzSelectSearchComponent_Conditional_2_Template, 2, 0, "span", 3);
      }
      if (rf & 2) {
        ɵɵstyleProp("opacity", ctx.showInput ? null : 0);
        ɵɵproperty("ngModel", ctx.value)("disabled", ctx.disabled);
        ɵɵattribute("id", ctx.nzId)("autofocus", ctx.autofocus ? "autofocus" : null);
        ɵɵadvance(2);
        ɵɵconditional(ctx.mirrorSync ? 2 : -1);
      }
    },
    dependencies: [FormsModule, DefaultValueAccessor, NgControlStatus, NgModel],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSelectSearchComponent, [{
    type: Component,
    args: [{
      selector: "nz-select-search",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    <input
      #inputElement
      [attr.id]="nzId"
      autocomplete="off"
      class="ant-select-selection-search-input"
      [ngModel]="value"
      [attr.autofocus]="autofocus ? 'autofocus' : null"
      [disabled]="disabled"
      [style.opacity]="showInput ? null : 0"
      (ngModelChange)="onValueChange($event)"
      (compositionstart)="setCompositionState(true)"
      (compositionend)="setCompositionState(false)"
    />
    @if (mirrorSync) {
      <span #mirrorElement class="ant-select-selection-search-mirror"></span>
    }
  `,
      host: {
        class: "ant-select-selection-search",
        "[style.width.px]": "mirrorSync ? 0 : null"
      },
      providers: [{
        provide: COMPOSITION_BUFFER_MODE,
        useValue: false
      }],
      imports: [FormsModule]
    }]
  }], () => [], {
    nzId: [{
      type: Input
    }],
    disabled: [{
      type: Input
    }],
    mirrorSync: [{
      type: Input
    }],
    showInput: [{
      type: Input
    }],
    focusTrigger: [{
      type: Input
    }],
    value: [{
      type: Input
    }],
    autofocus: [{
      type: Input
    }],
    valueChange: [{
      type: Output
    }],
    isComposingChange: [{
      type: Output
    }],
    inputElement: [{
      type: ViewChild,
      args: ["inputElement", {
        static: true
      }]
    }],
    mirrorElement: [{
      type: ViewChild,
      args: ["mirrorElement", {
        static: false
      }]
    }]
  });
})();
var NzSelectTopControlComponent = class _NzSelectTopControlComponent {
  destroyRef = inject(DestroyRef);
  elementRef = inject(ElementRef);
  ngZone = inject(NgZone);
  noAnimation = inject(NzNoAnimationDirective, {
    host: true,
    optional: true
  });
  nzId = null;
  showSearch = false;
  placeHolder = null;
  open = false;
  maxTagCount = Infinity;
  autofocus = false;
  disabled = false;
  mode = "default";
  customTemplate = null;
  maxTagPlaceholder = null;
  removeIcon = null;
  listOfTopItem = [];
  tokenSeparators = [];
  prefix = null;
  tokenize = new EventEmitter();
  inputValueChange = new EventEmitter();
  deleteItem = new EventEmitter();
  nzSelectSearchComponent;
  listOfSlicedItem = [];
  isShowPlaceholder = true;
  isShowSingleLabel = false;
  isComposing = false;
  inputValue = null;
  updateTemplateVariable() {
    const isSelectedValueEmpty = this.listOfTopItem.length === 0;
    this.isShowPlaceholder = isSelectedValueEmpty && !this.isComposing && !this.inputValue;
    this.isShowSingleLabel = !isSelectedValueEmpty && !this.isComposing && !this.inputValue;
  }
  isComposingChange(isComposing) {
    this.isComposing = isComposing;
    this.updateTemplateVariable();
  }
  onInputValueChange(value) {
    if (value !== this.inputValue) {
      this.inputValue = value;
      this.updateTemplateVariable();
      this.inputValueChange.emit(value);
      this.tokenSeparate(value, this.tokenSeparators);
    }
  }
  tokenSeparate(inputValue, tokenSeparators) {
    const includesSeparators = (str, separators) => {
      for (let i = 0; i < separators.length; ++i) {
        if (str.lastIndexOf(separators[i]) > 0) {
          return true;
        }
      }
      return false;
    };
    const splitBySeparators = (str, separators) => {
      const reg = new RegExp(`[${separators.join()}]`);
      const array = str.split(reg).filter((token) => token);
      return [...new Set(array)];
    };
    if (inputValue && inputValue.length && tokenSeparators.length && this.mode !== "default" && includesSeparators(inputValue, tokenSeparators)) {
      const listOfLabel = splitBySeparators(inputValue, tokenSeparators);
      this.tokenize.next(listOfLabel);
    }
  }
  clearInputValue() {
    this.nzSelectSearchComponent?.clearInputValue();
  }
  focus() {
    this.nzSelectSearchComponent?.focus();
  }
  blur() {
    this.nzSelectSearchComponent?.blur();
  }
  onDeleteItem(item) {
    if (!this.disabled && !item.nzDisabled) {
      this.deleteItem.next(item);
    }
  }
  ngOnChanges(changes) {
    const {
      listOfTopItem,
      maxTagCount,
      customTemplate,
      maxTagPlaceholder
    } = changes;
    if (listOfTopItem) {
      this.updateTemplateVariable();
    }
    if (listOfTopItem || maxTagCount || customTemplate || maxTagPlaceholder) {
      const listOfSlicedItem = this.listOfTopItem.slice(0, this.maxTagCount).map((o) => ({
        nzLabel: o.nzLabel,
        nzValue: o.nzValue,
        nzDisabled: o.nzDisabled,
        contentTemplateOutlet: this.customTemplate,
        contentTemplateOutletContext: o
      }));
      if (this.listOfTopItem.length > this.maxTagCount) {
        const exceededLabel = `+ ${this.listOfTopItem.length - this.maxTagCount} ...`;
        const listOfSelectedValue = this.listOfTopItem.map((item) => item.nzValue);
        const exceededItem = {
          nzLabel: exceededLabel,
          nzValue: "$$__nz_exceeded_item",
          nzDisabled: true,
          contentTemplateOutlet: this.maxTagPlaceholder,
          contentTemplateOutletContext: listOfSelectedValue.slice(this.maxTagCount)
        };
        listOfSlicedItem.push(exceededItem);
      }
      this.listOfSlicedItem = listOfSlicedItem;
    }
  }
  ngOnInit() {
    fromEventOutsideAngular(this.elementRef.nativeElement, "click").pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event.target !== this.nzSelectSearchComponent.inputElement.nativeElement) {
        this.nzSelectSearchComponent.focus();
      }
    });
    fromEventOutsideAngular(this.elementRef.nativeElement, "keydown").pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
      if (event.target instanceof HTMLInputElement) {
        const inputValue = event.target.value;
        if (event.keyCode === BACKSPACE && this.mode !== "default" && !inputValue && this.listOfTopItem.length > 0) {
          event.preventDefault();
          this.ngZone.run(() => this.onDeleteItem(this.listOfTopItem[this.listOfTopItem.length - 1]));
        }
      }
    });
  }
  static ɵfac = function NzSelectTopControlComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSelectTopControlComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzSelectTopControlComponent,
    selectors: [["nz-select-top-control"]],
    viewQuery: function NzSelectTopControlComponent_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(NzSelectSearchComponent, 5);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.nzSelectSearchComponent = _t.first);
      }
    },
    hostAttrs: [1, "ant-select-selector"],
    inputs: {
      nzId: "nzId",
      showSearch: "showSearch",
      placeHolder: "placeHolder",
      open: "open",
      maxTagCount: [2, "maxTagCount", "maxTagCount", numberAttribute],
      autofocus: "autofocus",
      disabled: "disabled",
      mode: "mode",
      customTemplate: "customTemplate",
      maxTagPlaceholder: "maxTagPlaceholder",
      removeIcon: "removeIcon",
      listOfTopItem: "listOfTopItem",
      tokenSeparators: "tokenSeparators",
      prefix: "prefix"
    },
    outputs: {
      tokenize: "tokenize",
      inputValueChange: "inputValueChange",
      deleteItem: "deleteItem"
    },
    exportAs: ["nzSelectTopControl"],
    features: [ɵɵNgOnChangesFeature],
    decls: 5,
    vars: 3,
    consts: [[1, "ant-select-prefix"], [1, "ant-select-selection-wrap"], [1, "ant-select-selection-overflow"], [3, "placeholder"], [4, "nzStringTemplateOutlet"], [3, "isComposingChange", "valueChange", "nzId", "disabled", "value", "showInput", "mirrorSync", "autofocus", "focusTrigger"], [3, "removeIcon", "label", "contentTemplateOutlet", "contentTemplateOutletContext"], [1, "ant-select-selection-overflow-item"], [1, "ant-select-selection-overflow-item", "ant-select-selection-overflow-item-suffix"], [3, "isComposingChange", "valueChange", "nzId", "disabled", "value", "autofocus", "showInput", "mirrorSync", "focusTrigger"], ["deletable", "", 3, "delete", "removeIcon", "label", "disabled", "contentTemplateOutlet", "contentTemplateOutletContext"]],
    template: function NzSelectTopControlComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵconditionalCreate(0, NzSelectTopControlComponent_Conditional_0_Template, 2, 1, "div", 0);
        ɵɵelementStart(1, "span", 1);
        ɵɵconditionalCreate(2, NzSelectTopControlComponent_Case_2_Template, 2, 8)(3, NzSelectTopControlComponent_Case_3_Template, 5, 7, "div", 2);
        ɵɵconditionalCreate(4, NzSelectTopControlComponent_Conditional_4_Template, 1, 1, "nz-select-placeholder", 3);
        ɵɵelementEnd();
      }
      if (rf & 2) {
        let tmp_1_0;
        ɵɵconditional(ctx.prefix ? 0 : -1);
        ɵɵadvance(2);
        ɵɵconditional((tmp_1_0 = ctx.mode) === "default" ? 2 : 3);
        ɵɵadvance(2);
        ɵɵconditional(ctx.isShowPlaceholder ? 4 : -1);
      }
    },
    dependencies: [NzSelectSearchComponent, NzSelectItemComponent, NzSelectPlaceholderComponent, NzStringTemplateOutletDirective],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSelectTopControlComponent, [{
    type: Component,
    args: [{
      selector: "nz-select-top-control",
      exportAs: "nzSelectTopControl",
      imports: [NzSelectSearchComponent, NzSelectItemComponent, NzSelectPlaceholderComponent, NzStringTemplateOutletDirective],
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      template: `
    @if (prefix) {
      <div class="ant-select-prefix">
        <ng-container *nzStringTemplateOutlet="prefix">{{ prefix }}</ng-container>
      </div>
    }
    <span class="ant-select-selection-wrap">
      <!--single mode-->
      @switch (mode) {
        @case ('default') {
          <nz-select-search
            [nzId]="nzId"
            [disabled]="disabled"
            [value]="inputValue!"
            [showInput]="showSearch"
            [mirrorSync]="false"
            [autofocus]="autofocus"
            [focusTrigger]="open"
            (isComposingChange)="isComposingChange($event)"
            (valueChange)="onInputValueChange($event)"
          />
          @if (isShowSingleLabel) {
            <nz-select-item
              [removeIcon]="removeIcon"
              [label]="listOfTopItem[0].nzLabel"
              [contentTemplateOutlet]="customTemplate"
              [contentTemplateOutletContext]="listOfTopItem[0]"
            />
          }
        }
        @default {
          <div class="ant-select-selection-overflow">
            <!--multiple or tags mode-->
            @for (item of listOfSlicedItem; track item.nzValue) {
              <div class="ant-select-selection-overflow-item">
                <nz-select-item
                  [removeIcon]="removeIcon"
                  [label]="item.nzLabel"
                  [disabled]="item.nzDisabled || disabled"
                  [contentTemplateOutlet]="item.contentTemplateOutlet"
                  deletable
                  [contentTemplateOutletContext]="item.contentTemplateOutletContext"
                  (delete)="onDeleteItem(item.contentTemplateOutletContext)"
                />
              </div>
            }
            <div class="ant-select-selection-overflow-item ant-select-selection-overflow-item-suffix">
              <nz-select-search
                [nzId]="nzId"
                [disabled]="disabled"
                [value]="inputValue!"
                [autofocus]="autofocus"
                [showInput]="true"
                [mirrorSync]="true"
                [focusTrigger]="open"
                (isComposingChange)="isComposingChange($event)"
                (valueChange)="onInputValueChange($event)"
              />
            </div>
          </div>
        }
      }
      @if (isShowPlaceholder) {
        <nz-select-placeholder [placeholder]="placeHolder" />
      }
    </span>
  `,
      host: {
        class: "ant-select-selector"
      }
    }]
  }], null, {
    nzId: [{
      type: Input
    }],
    showSearch: [{
      type: Input
    }],
    placeHolder: [{
      type: Input
    }],
    open: [{
      type: Input
    }],
    maxTagCount: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    autofocus: [{
      type: Input
    }],
    disabled: [{
      type: Input
    }],
    mode: [{
      type: Input
    }],
    customTemplate: [{
      type: Input
    }],
    maxTagPlaceholder: [{
      type: Input
    }],
    removeIcon: [{
      type: Input
    }],
    listOfTopItem: [{
      type: Input
    }],
    tokenSeparators: [{
      type: Input
    }],
    prefix: [{
      type: Input
    }],
    tokenize: [{
      type: Output
    }],
    inputValueChange: [{
      type: Output
    }],
    deleteItem: [{
      type: Output
    }],
    nzSelectSearchComponent: [{
      type: ViewChild,
      args: [NzSelectSearchComponent]
    }]
  });
})();
var defaultFilterOption = (searchValue, item) => {
  if (item && item.nzLabel) {
    return item.nzLabel.toString().toLowerCase().indexOf(searchValue.toLowerCase()) > -1;
  } else {
    return false;
  }
};
var NZ_CONFIG_MODULE_NAME = "select";
var NzSelectComponent = (() => {
  let _nzVariant_decorators;
  let _nzVariant_initializers = [];
  let _nzVariant_extraInitializers = [];
  let _nzOptionHeightPx_decorators;
  let _nzOptionHeightPx_initializers = [];
  let _nzOptionHeightPx_extraInitializers = [];
  let _nzSuffixIcon_decorators;
  let _nzSuffixIcon_initializers = [];
  let _nzSuffixIcon_extraInitializers = [];
  let _nzBackdrop_decorators;
  let _nzBackdrop_initializers = [];
  let _nzBackdrop_extraInitializers = [];
  return class NzSelectComponent2 {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
      _nzVariant_decorators = [WithConfig()];
      _nzOptionHeightPx_decorators = [WithConfig()];
      _nzSuffixIcon_decorators = [WithConfig()];
      _nzBackdrop_decorators = [WithConfig()];
      __esDecorate(null, null, _nzVariant_decorators, {
        kind: "field",
        name: "nzVariant",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzVariant" in obj,
          get: (obj) => obj.nzVariant,
          set: (obj, value) => {
            obj.nzVariant = value;
          }
        },
        metadata: _metadata
      }, _nzVariant_initializers, _nzVariant_extraInitializers);
      __esDecorate(null, null, _nzOptionHeightPx_decorators, {
        kind: "field",
        name: "nzOptionHeightPx",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzOptionHeightPx" in obj,
          get: (obj) => obj.nzOptionHeightPx,
          set: (obj, value) => {
            obj.nzOptionHeightPx = value;
          }
        },
        metadata: _metadata
      }, _nzOptionHeightPx_initializers, _nzOptionHeightPx_extraInitializers);
      __esDecorate(null, null, _nzSuffixIcon_decorators, {
        kind: "field",
        name: "nzSuffixIcon",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzSuffixIcon" in obj,
          get: (obj) => obj.nzSuffixIcon,
          set: (obj, value) => {
            obj.nzSuffixIcon = value;
          }
        },
        metadata: _metadata
      }, _nzSuffixIcon_initializers, _nzSuffixIcon_extraInitializers);
      __esDecorate(null, null, _nzBackdrop_decorators, {
        kind: "field",
        name: "nzBackdrop",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzBackdrop" in obj,
          get: (obj) => obj.nzBackdrop,
          set: (obj, value) => {
            obj.nzBackdrop = value;
          }
        },
        metadata: _metadata
      }, _nzBackdrop_initializers, _nzBackdrop_extraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata
      });
    }
    _nzModuleName = NZ_CONFIG_MODULE_NAME;
    ngZone = inject(NgZone);
    cdr = inject(ChangeDetectorRef);
    host = inject(ElementRef);
    renderer = inject(Renderer2);
    platform = inject(Platform);
    focusMonitor = inject(FocusMonitor);
    directionality = inject(Directionality);
    destroyRef = inject(DestroyRef);
    noAnimation = inject(NzNoAnimationDirective, {
      host: true,
      optional: true
    });
    nzFormStatusService = inject(NzFormStatusService, {
      optional: true
    });
    nzFormNoStatusService = inject(NzFormNoStatusService, {
      optional: true
    });
    nzId = null;
    nzSize = "default";
    nzStatus = "";
    nzVariant = __runInitializers(this, _nzVariant_initializers, "outlined");
    nzOptionHeightPx = (__runInitializers(this, _nzVariant_extraInitializers), __runInitializers(this, _nzOptionHeightPx_initializers, 32));
    nzOptionOverflowSize = (__runInitializers(this, _nzOptionHeightPx_extraInitializers), 8);
    nzDropdownClassName = null;
    nzDropdownMatchSelectWidth = true;
    nzDropdownStyle = null;
    nzNotFoundContent = void 0;
    nzPlaceHolder = null;
    nzPlacement = null;
    nzMaxTagCount = Infinity;
    nzDropdownRender = null;
    nzCustomTemplate = null;
    nzPrefix = null;
    nzSuffixIcon = __runInitializers(this, _nzSuffixIcon_initializers, null);
    nzClearIcon = (__runInitializers(this, _nzSuffixIcon_extraInitializers), null);
    nzRemoveIcon = null;
    nzMenuItemSelectedIcon = null;
    nzTokenSeparators = [];
    nzMaxTagPlaceholder = null;
    nzMaxMultipleCount = Infinity;
    nzMode = "default";
    nzFilterOption = defaultFilterOption;
    compareWith = (o1, o2) => o1 === o2;
    nzAllowClear = false;
    nzShowSearch = false;
    nzLoading = false;
    nzAutoFocus = false;
    nzAutoClearSearchValue = true;
    nzServerSearch = false;
    nzDisabled = false;
    nzOpen = false;
    nzSelectOnTab = false;
    nzBackdrop = __runInitializers(this, _nzBackdrop_initializers, false);
    nzOptions = (__runInitializers(this, _nzBackdrop_extraInitializers), []);
    nzShowArrow = true;
    get showArrow() {
      return this.nzShowArrow || !!this.nzSuffixIcon;
    }
    get isMultiple() {
      return this.nzMode === "multiple" || this.nzMode === "tags";
    }
    get isMaxMultipleCountSet() {
      return this.isMultiple && this.nzMaxMultipleCount !== Infinity;
    }
    get isMaxMultipleCountReached() {
      return this.nzMaxMultipleCount !== Infinity && this.listOfValue.length === this.nzMaxMultipleCount;
    }
    nzOnSearch = new EventEmitter();
    nzScrollToBottom = new EventEmitter();
    nzOpenChange = new EventEmitter();
    nzBlur = new EventEmitter();
    nzFocus = new EventEmitter();
    nzOnClear = output();
    originElement;
    cdkConnectedOverlay;
    nzSelectTopControlComponent;
    listOfNzOptionComponent;
    listOfNzOptionGroupComponent;
    nzOptionGroupComponentElement;
    nzSelectTopControlComponentElement;
    finalSize = computed(() => {
      if (this.compactSize) {
        return this.compactSize();
      }
      return this.size();
    }, ...ngDevMode ? [{
      debugName: "finalSize"
    }] : []);
    size = signal(this.nzSize, ...ngDevMode ? [{
      debugName: "size"
    }] : []);
    compactSize = inject(NZ_SPACE_COMPACT_SIZE, {
      optional: true
    });
    listOfValue$ = new BehaviorSubject([]);
    listOfTemplateItem$ = new BehaviorSubject([]);
    listOfTagAndTemplateItem = [];
    searchValue = "";
    isReactiveDriven = false;
    value;
    requestId = -1;
    isNzDisableFirstChange = true;
    onChange = () => {
    };
    onTouched = () => {
    };
    dropdownPosition = "bottomLeft";
    triggerWidth = null;
    listOfContainerItem = [];
    listOfTopItem = [];
    activatedValue = null;
    listOfValue = [];
    focused = false;
    dir = "ltr";
    positions = [];
    selectAnimationEnter = slideAnimationEnter();
    selectAnimationLeave = slideAnimationLeave();
    // status
    prefixCls = "ant-select";
    statusCls = {};
    status = "";
    hasFeedback = false;
    generateTagItem(value) {
      return {
        nzValue: value,
        nzLabel: value,
        type: "item"
      };
    }
    onItemClick(value) {
      this.activatedValue = value;
      if (this.nzMode === "default") {
        if (this.listOfValue.length === 0 || !this.compareWith(this.listOfValue[0], value)) {
          this.updateListOfValue([value]);
        }
        this.setOpenState(false);
      } else {
        const targetIndex = this.listOfValue.findIndex((o) => this.compareWith(o, value));
        if (targetIndex !== -1) {
          const listOfValueAfterRemoved = this.listOfValue.filter((_, i) => i !== targetIndex);
          this.updateListOfValue(listOfValueAfterRemoved);
        } else if (this.listOfValue.length < this.nzMaxMultipleCount) {
          const listOfValueAfterAdded = [...this.listOfValue, value];
          this.updateListOfValue(listOfValueAfterAdded);
        }
        this.focus();
        if (this.nzAutoClearSearchValue) {
          this.clearInput();
        }
      }
    }
    onItemDelete(item) {
      const listOfSelectedValue = this.listOfValue.filter((v) => !this.compareWith(v, item.nzValue));
      this.updateListOfValue(listOfSelectedValue);
      this.clearInput();
    }
    updateListOfContainerItem() {
      let listOfContainerItem = this.listOfTagAndTemplateItem.filter((item) => !item.nzHide).filter((item) => {
        if (!this.nzServerSearch && this.searchValue) {
          return this.nzFilterOption(this.searchValue, item);
        } else {
          return true;
        }
      });
      if (this.nzMode === "tags" && this.searchValue) {
        const matchedItem = this.listOfTagAndTemplateItem.find((item) => item.nzLabel === this.searchValue);
        if (!matchedItem) {
          const tagItem = this.generateTagItem(this.searchValue);
          listOfContainerItem = [tagItem, ...listOfContainerItem];
          this.activatedValue = tagItem.nzValue;
        } else {
          this.activatedValue = matchedItem.nzValue;
        }
      }
      const activatedItem = listOfContainerItem.find((item) => item.nzLabel === this.searchValue) || listOfContainerItem.find((item) => this.compareWith(item.nzValue, this.activatedValue)) || listOfContainerItem.find((item) => this.compareWith(item.nzValue, this.listOfValue[0])) || listOfContainerItem[0];
      this.activatedValue = activatedItem && activatedItem.nzValue || null;
      let listOfGroupLabel = [];
      if (this.isReactiveDriven) {
        listOfGroupLabel = [...new Set(this.nzOptions.filter((o) => o.groupLabel).map((o) => o.groupLabel))];
      } else {
        if (this.listOfNzOptionGroupComponent) {
          listOfGroupLabel = this.listOfNzOptionGroupComponent.map((o) => o.nzLabel);
        }
      }
      listOfGroupLabel.forEach((label) => {
        const index = listOfContainerItem.findIndex((item) => label === item.groupLabel);
        if (index > -1) {
          const groupItem = {
            groupLabel: label,
            type: "group",
            key: label
          };
          listOfContainerItem.splice(index, 0, groupItem);
        }
      });
      this.listOfContainerItem = [...listOfContainerItem];
      this.updateCdkConnectedOverlayPositions();
    }
    clearInput() {
      this.nzSelectTopControlComponent.clearInputValue();
    }
    updateListOfValue(listOfValue) {
      const covertListToModel = (list, mode) => {
        if (mode === "default") {
          if (list.length > 0) {
            return list[0];
          } else {
            return null;
          }
        } else {
          return list;
        }
      };
      const model = covertListToModel(listOfValue, this.nzMode);
      if (this.value !== model) {
        this.listOfValue = listOfValue;
        this.listOfValue$.next(listOfValue);
        this.value = model;
        this.onChange(this.value);
      }
    }
    onTokenSeparate(listOfLabel) {
      const listOfMatchedValue = this.listOfTagAndTemplateItem.filter((item) => listOfLabel.findIndex((label) => label === item.nzLabel) !== -1).map((item) => item.nzValue).filter((item) => this.listOfValue.findIndex((v) => this.compareWith(v, item)) === -1);
      const limitWithinMaxCount = (value) => this.isMaxMultipleCountSet ? value.slice(0, this.nzMaxMultipleCount) : value;
      if (this.nzMode === "multiple") {
        const updateValue = limitWithinMaxCount([...this.listOfValue, ...listOfMatchedValue]);
        this.updateListOfValue(updateValue);
      } else if (this.nzMode === "tags") {
        const listOfUnMatchedLabel = listOfLabel.filter((label) => this.listOfTagAndTemplateItem.findIndex((item) => item.nzLabel === label) === -1);
        const updateValue = limitWithinMaxCount([...this.listOfValue, ...listOfMatchedValue, ...listOfUnMatchedLabel]);
        this.updateListOfValue(updateValue);
      }
      this.clearInput();
    }
    onKeyDown(e) {
      if (this.nzDisabled) {
        return;
      }
      const listOfFilteredOptionNotDisabled = this.listOfContainerItem.filter((item) => item.type === "item").filter((item) => !item.nzDisabled);
      const activatedIndex = listOfFilteredOptionNotDisabled.findIndex((item) => this.compareWith(item.nzValue, this.activatedValue));
      switch (e.keyCode) {
        case UP_ARROW:
          e.preventDefault();
          if (this.nzOpen && listOfFilteredOptionNotDisabled.length > 0) {
            const preIndex = activatedIndex > 0 ? activatedIndex - 1 : listOfFilteredOptionNotDisabled.length - 1;
            this.activatedValue = listOfFilteredOptionNotDisabled[preIndex].nzValue;
          }
          break;
        case DOWN_ARROW:
          e.preventDefault();
          if (this.nzOpen && listOfFilteredOptionNotDisabled.length > 0) {
            const nextIndex = activatedIndex < listOfFilteredOptionNotDisabled.length - 1 ? activatedIndex + 1 : 0;
            this.activatedValue = listOfFilteredOptionNotDisabled[nextIndex].nzValue;
          } else {
            this.setOpenState(true);
          }
          break;
        case ENTER:
          e.preventDefault();
          if (this.nzOpen) {
            if (isNotNil(this.activatedValue) && activatedIndex !== -1) {
              this.onItemClick(this.activatedValue);
            }
          } else {
            this.setOpenState(true);
          }
          break;
        case SPACE:
          if (!this.nzOpen) {
            this.setOpenState(true);
            e.preventDefault();
          }
          break;
        case TAB:
          if (this.nzSelectOnTab) {
            if (this.nzOpen) {
              e.preventDefault();
              if (isNotNil(this.activatedValue)) {
                this.onItemClick(this.activatedValue);
              }
            }
          } else {
            this.setOpenState(false);
          }
          break;
        case ESCAPE:
          break;
        default:
          if (!this.nzOpen) {
            this.setOpenState(true);
          }
      }
    }
    setOpenState(value) {
      if (this.nzOpen !== value) {
        this.nzOpen = value;
        this.nzOpenChange.emit(value);
        this.onOpenChange();
        this.cdr.markForCheck();
      }
    }
    onOpenChange() {
      this.updateCdkConnectedOverlayStatus();
      if (this.nzAutoClearSearchValue || !this.isMultiple) {
        this.clearInput();
      }
    }
    onInputValueChange(value) {
      this.searchValue = value;
      this.updateListOfContainerItem();
      this.nzOnSearch.emit(value);
      this.updateCdkConnectedOverlayPositions();
    }
    onClearSelection() {
      this.updateListOfValue([]);
      this.nzOnClear.emit();
    }
    onClickOutside(event) {
      const target = _getEventTarget(event);
      if (!this.host.nativeElement.contains(target)) {
        this.setOpenState(false);
      }
    }
    focus() {
      this.nzSelectTopControlComponent.focus();
    }
    blur() {
      this.nzSelectTopControlComponent.blur();
    }
    onPositionChange(position) {
      const placement = getPlacementName(position);
      this.dropdownPosition = placement;
    }
    updateCdkConnectedOverlayStatus() {
      if (this.platform.isBrowser && this.originElement.nativeElement) {
        const triggerWidth = this.triggerWidth;
        cancelAnimationFrame(this.requestId);
        this.requestId = requestAnimationFrame(() => {
          this.triggerWidth = this.originElement.nativeElement.getBoundingClientRect().width;
          if (triggerWidth !== this.triggerWidth) {
            this.cdr.detectChanges();
          }
        });
      }
    }
    updateCdkConnectedOverlayPositions() {
      requestAnimationFrame(() => {
        this.cdkConnectedOverlay?.overlayRef?.updatePosition();
      });
    }
    constructor() {
      this.destroyRef.onDestroy(() => {
        cancelAnimationFrame(this.requestId);
        this.focusMonitor.stopMonitoring(this.host);
      });
      onConfigChangeEventForComponent(NZ_CONFIG_MODULE_NAME, () => {
        this.size.set(this.nzSize);
        this.cdr.markForCheck();
      });
    }
    writeValue(modelValue) {
      if (this.value !== modelValue) {
        this.value = modelValue;
        const covertModelToList = (model, mode) => {
          if (model === null || model === void 0) {
            return [];
          } else if (mode === "default") {
            return [model];
          } else {
            return model;
          }
        };
        const listOfValue = covertModelToList(modelValue, this.nzMode);
        this.listOfValue = listOfValue;
        this.listOfValue$.next(listOfValue);
        this.cdr.markForCheck();
      }
    }
    registerOnChange(fn) {
      this.onChange = fn;
    }
    registerOnTouched(fn) {
      this.onTouched = fn;
    }
    setDisabledState(disabled) {
      this.nzDisabled = this.isNzDisableFirstChange && this.nzDisabled || disabled;
      this.isNzDisableFirstChange = false;
      if (this.nzDisabled) {
        this.setOpenState(false);
      }
      this.cdr.markForCheck();
    }
    ngOnChanges({
      nzOpen,
      nzDisabled,
      nzOptions,
      nzStatus,
      nzPlacement,
      nzSize
    }) {
      if (nzOpen) {
        this.onOpenChange();
      }
      if (nzDisabled && this.nzDisabled) {
        this.setOpenState(false);
      }
      if (nzOptions) {
        this.isReactiveDriven = true;
        const listOfOptions = this.nzOptions || [];
        const listOfTransformedItem = listOfOptions.map((item) => {
          return {
            template: item.label instanceof TemplateRef ? item.label : null,
            nzTitle: this.getTitle(item.title, item.label),
            nzLabel: typeof item.label === "string" || typeof item.label === "number" ? item.label : null,
            nzValue: item.value,
            nzDisabled: item.disabled || false,
            nzHide: item.hide || false,
            nzCustomContent: item.label instanceof TemplateRef,
            groupLabel: item.groupLabel || null,
            type: "item",
            key: item.key === void 0 ? item.value : item.key
          };
        });
        this.listOfTemplateItem$.next(listOfTransformedItem);
      }
      if (nzStatus) {
        this.setStatusStyles(this.nzStatus, this.hasFeedback);
      }
      if (nzPlacement) {
        const {
          currentValue
        } = nzPlacement;
        this.dropdownPosition = currentValue;
        const listOfPlacement = ["bottomLeft", "topLeft", "bottomRight", "topRight"];
        if (currentValue && listOfPlacement.includes(currentValue)) {
          this.positions = [POSITION_MAP[currentValue]];
        } else {
          this.positions = listOfPlacement.map((e) => POSITION_MAP[e]);
        }
      }
      if (nzSize) {
        this.size.set(nzSize.currentValue);
      }
    }
    ngOnInit() {
      this.nzFormStatusService?.formStatusChanges.pipe(distinctUntilChanged((pre, cur) => {
        return pre.status === cur.status && pre.hasFeedback === cur.hasFeedback;
      }), withLatestFrom(this.nzFormNoStatusService ? this.nzFormNoStatusService.noFormStatus : of(false)), map(([{
        status,
        hasFeedback
      }, noStatus]) => ({
        status: noStatus ? "" : status,
        hasFeedback
      })), takeUntilDestroyed(this.destroyRef)).subscribe(({
        status,
        hasFeedback
      }) => {
        this.setStatusStyles(status, hasFeedback);
      });
      this.focusMonitor.monitor(this.host, true).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((focusOrigin) => {
        if (!focusOrigin) {
          this.focused = false;
          this.cdr.markForCheck();
          this.nzBlur.emit();
          Promise.resolve().then(() => {
            this.onTouched();
          });
        } else {
          this.focused = true;
          this.cdr.markForCheck();
          this.nzFocus.emit();
        }
      });
      combineLatest([this.listOfValue$, this.listOfTemplateItem$]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(([listOfSelectedValue, listOfTemplateItem]) => {
        const listOfTagItem = listOfSelectedValue.filter(() => this.nzMode === "tags").filter((value) => listOfTemplateItem.findIndex((o) => this.compareWith(o.nzValue, value)) === -1).map((value) => this.listOfTopItem.find((o) => this.compareWith(o.nzValue, value)) || this.generateTagItem(value));
        this.listOfTagAndTemplateItem = [...listOfTemplateItem, ...listOfTagItem];
        this.listOfTopItem = this.listOfValue.map((v) => [...this.listOfTagAndTemplateItem, ...this.listOfTopItem].find((item) => this.compareWith(v, item.nzValue))).filter((item) => !!item);
        this.updateListOfContainerItem();
      });
      this.directionality.change?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((direction) => {
        this.dir = direction;
        this.cdr.detectChanges();
      });
      this.dir = this.directionality.value;
      fromEventOutsideAngular(this.host.nativeElement, "click").pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        if (this.nzOpen && this.nzShowSearch || this.nzDisabled) {
          return;
        }
        this.ngZone.run(() => this.setOpenState(!this.nzOpen));
      });
      this.cdkConnectedOverlay.overlayKeydown.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => {
        if (event.keyCode === ESCAPE) {
          this.setOpenState(false);
        }
      });
    }
    ngAfterContentInit() {
      if (!this.isReactiveDriven) {
        merge(this.listOfNzOptionGroupComponent.changes, this.listOfNzOptionComponent.changes).pipe(startWith(true), switchMap(() => merge(...[this.listOfNzOptionComponent.changes, this.listOfNzOptionGroupComponent.changes, ...this.listOfNzOptionComponent.map((option) => option.changes), ...this.listOfNzOptionGroupComponent.map((option) => option.changes)]).pipe(startWith(true))), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
          const listOfOptionInterface = this.listOfNzOptionComponent.toArray().map((item) => {
            const {
              template,
              nzLabel,
              nzValue,
              nzKey,
              nzDisabled,
              nzHide,
              nzCustomContent,
              groupLabel
            } = item;
            return {
              template,
              nzLabel,
              nzValue,
              nzDisabled,
              nzHide,
              nzCustomContent,
              groupLabel,
              nzTitle: this.getTitle(item.nzTitle, item.nzLabel),
              type: "item",
              key: nzKey === void 0 ? nzValue : nzKey
            };
          });
          this.listOfTemplateItem$.next(listOfOptionInterface);
          this.cdr.markForCheck();
        });
      }
    }
    setStatusStyles(status, hasFeedback) {
      this.status = status;
      this.hasFeedback = hasFeedback;
      this.cdr.markForCheck();
      this.statusCls = getStatusClassNames(this.prefixCls, status, hasFeedback);
      Object.keys(this.statusCls).forEach((status2) => {
        if (this.statusCls[status2]) {
          this.renderer.addClass(this.host.nativeElement, status2);
        } else {
          this.renderer.removeClass(this.host.nativeElement, status2);
        }
      });
    }
    getTitle(title, label) {
      let rawTitle = void 0;
      if (title === void 0) {
        if (typeof label === "string" || typeof label === "number") {
          rawTitle = label.toString();
        }
      } else if (typeof title === "string" || typeof title === "number") {
        rawTitle = title.toString();
      }
      return rawTitle;
    }
    static ɵfac = function NzSelectComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || NzSelectComponent2)();
    };
    static ɵcmp = ɵɵdefineComponent({
      type: NzSelectComponent2,
      selectors: [["nz-select"]],
      contentQueries: function NzSelectComponent_ContentQueries(rf, ctx, dirIndex) {
        if (rf & 1) {
          ɵɵcontentQuery(dirIndex, NzOptionComponent, 5)(dirIndex, NzOptionGroupComponent, 5);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.listOfNzOptionComponent = _t);
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.listOfNzOptionGroupComponent = _t);
        }
      },
      viewQuery: function NzSelectComponent_Query(rf, ctx) {
        if (rf & 1) {
          ɵɵviewQuery(CdkOverlayOrigin, 7, ElementRef)(CdkConnectedOverlay, 7)(NzSelectTopControlComponent, 7)(NzOptionGroupComponent, 7, ElementRef)(NzSelectTopControlComponent, 7, ElementRef);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.originElement = _t.first);
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.cdkConnectedOverlay = _t.first);
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.nzSelectTopControlComponent = _t.first);
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.nzOptionGroupComponentElement = _t.first);
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.nzSelectTopControlComponentElement = _t.first);
        }
      },
      hostAttrs: [1, "ant-select"],
      hostVars: 30,
      hostBindings: function NzSelectComponent_HostBindings(rf, ctx) {
        if (rf & 2) {
          ɵɵclassProp("ant-select-in-form-item", !!ctx.nzFormStatusService)("ant-select-lg", ctx.finalSize() === "large")("ant-select-sm", ctx.finalSize() === "small")("ant-select-show-arrow", ctx.showArrow)("ant-select-disabled", ctx.nzDisabled)("ant-select-show-search", (ctx.nzShowSearch || ctx.nzMode !== "default") && !ctx.nzDisabled)("ant-select-allow-clear", ctx.nzAllowClear)("ant-select-borderless", ctx.nzVariant === "borderless")("ant-select-filled", ctx.nzVariant === "filled")("ant-select-underlined", ctx.nzVariant === "underlined")("ant-select-open", ctx.nzOpen)("ant-select-focused", ctx.nzOpen || ctx.focused)("ant-select-single", ctx.nzMode === "default")("ant-select-multiple", ctx.nzMode !== "default")("ant-select-rtl", ctx.dir === "rtl");
        }
      },
      inputs: {
        nzId: "nzId",
        nzSize: "nzSize",
        nzStatus: "nzStatus",
        nzVariant: "nzVariant",
        nzOptionHeightPx: "nzOptionHeightPx",
        nzOptionOverflowSize: "nzOptionOverflowSize",
        nzDropdownClassName: "nzDropdownClassName",
        nzDropdownMatchSelectWidth: "nzDropdownMatchSelectWidth",
        nzDropdownStyle: "nzDropdownStyle",
        nzNotFoundContent: "nzNotFoundContent",
        nzPlaceHolder: "nzPlaceHolder",
        nzPlacement: "nzPlacement",
        nzMaxTagCount: "nzMaxTagCount",
        nzDropdownRender: "nzDropdownRender",
        nzCustomTemplate: "nzCustomTemplate",
        nzPrefix: "nzPrefix",
        nzSuffixIcon: "nzSuffixIcon",
        nzClearIcon: "nzClearIcon",
        nzRemoveIcon: "nzRemoveIcon",
        nzMenuItemSelectedIcon: "nzMenuItemSelectedIcon",
        nzTokenSeparators: "nzTokenSeparators",
        nzMaxTagPlaceholder: "nzMaxTagPlaceholder",
        nzMaxMultipleCount: [2, "nzMaxMultipleCount", "nzMaxMultipleCount", numberAttributeWithInfinityFallback],
        nzMode: "nzMode",
        nzFilterOption: "nzFilterOption",
        compareWith: "compareWith",
        nzAllowClear: [2, "nzAllowClear", "nzAllowClear", booleanAttribute],
        nzShowSearch: [2, "nzShowSearch", "nzShowSearch", booleanAttribute],
        nzLoading: [2, "nzLoading", "nzLoading", booleanAttribute],
        nzAutoFocus: [2, "nzAutoFocus", "nzAutoFocus", booleanAttribute],
        nzAutoClearSearchValue: [2, "nzAutoClearSearchValue", "nzAutoClearSearchValue", booleanAttribute],
        nzServerSearch: [2, "nzServerSearch", "nzServerSearch", booleanAttribute],
        nzDisabled: [2, "nzDisabled", "nzDisabled", booleanAttribute],
        nzOpen: [2, "nzOpen", "nzOpen", booleanAttribute],
        nzSelectOnTab: [2, "nzSelectOnTab", "nzSelectOnTab", booleanAttribute],
        nzBackdrop: [2, "nzBackdrop", "nzBackdrop", booleanAttribute],
        nzOptions: "nzOptions",
        nzShowArrow: [2, "nzShowArrow", "nzShowArrow", booleanAttribute]
      },
      outputs: {
        nzOnSearch: "nzOnSearch",
        nzScrollToBottom: "nzScrollToBottom",
        nzOpenChange: "nzOpenChange",
        nzBlur: "nzBlur",
        nzFocus: "nzFocus",
        nzOnClear: "nzOnClear"
      },
      exportAs: ["nzSelect"],
      features: [ɵɵProvidersFeature([{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => NzSelectComponent2),
        multi: true
      }, {
        provide: NZ_SPACE_COMPACT_ITEM_TYPE,
        useValue: "select"
      }]), ɵɵHostDirectivesFeature([NzSpaceCompactItemDirective]), ɵɵNgOnChangesFeature],
      decls: 5,
      vars: 25,
      consts: [["origin", "cdkOverlayOrigin"], ["feedbackIconTpl", ""], ["cdkOverlayOrigin", "", 3, "inputValueChange", "tokenize", "deleteItem", "keydown", "nzId", "open", "disabled", "mode", "nzNoAnimation", "maxTagPlaceholder", "removeIcon", "placeHolder", "maxTagCount", "customTemplate", "tokenSeparators", "showSearch", "autofocus", "listOfTopItem", "prefix"], [3, "showArrow", "loading", "search", "suffixIcon", "feedbackIcon", "nzMaxMultipleCount", "listOfValue", "isMaxMultipleCountSet"], [3, "clearIcon"], ["cdkConnectedOverlay", "", "nzConnectedOverlay", "", 3, "overlayOutsideClick", "detach", "positionChange", "cdkConnectedOverlayHasBackdrop", "cdkConnectedOverlayMinWidth", "cdkConnectedOverlayWidth", "cdkConnectedOverlayOrigin", "cdkConnectedOverlayTransformOriginOn", "cdkConnectedOverlayPanelClass", "cdkConnectedOverlayOpen", "cdkConnectedOverlayPositions"], [3, "status"], [3, "clear", "clearIcon"], [3, "keydown", "itemClick", "scrollToBottom", "itemSize", "maxItemLength", "matchWidth", "nzNoAnimation", "listOfContainerItem", "menuItemSelectedIcon", "notFoundContent", "activatedValue", "listOfSelectedValue", "dropdownRender", "compareWith", "mode", "isMaxMultipleCountReached"]],
      template: function NzSelectComponent_Template(rf, ctx) {
        if (rf & 1) {
          const _r1 = ɵɵgetCurrentView();
          ɵɵelementStart(0, "nz-select-top-control", 2, 0);
          ɵɵlistener("inputValueChange", function NzSelectComponent_Template_nz_select_top_control_inputValueChange_0_listener($event) {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onInputValueChange($event));
          })("tokenize", function NzSelectComponent_Template_nz_select_top_control_tokenize_0_listener($event) {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onTokenSeparate($event));
          })("deleteItem", function NzSelectComponent_Template_nz_select_top_control_deleteItem_0_listener($event) {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onItemDelete($event));
          })("keydown", function NzSelectComponent_Template_nz_select_top_control_keydown_0_listener($event) {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onKeyDown($event));
          });
          ɵɵelementEnd();
          ɵɵconditionalCreate(2, NzSelectComponent_Conditional_2_Template, 3, 8, "nz-select-arrow", 3);
          ɵɵconditionalCreate(3, NzSelectComponent_Conditional_3_Template, 1, 1, "nz-select-clear", 4);
          ɵɵtemplate(4, NzSelectComponent_ng_template_4_Template, 1, 23, "ng-template", 5);
          ɵɵlistener("overlayOutsideClick", function NzSelectComponent_Template_ng_template_overlayOutsideClick_4_listener($event) {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onClickOutside($event));
          })("detach", function NzSelectComponent_Template_ng_template_detach_4_listener() {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.setOpenState(false));
          })("positionChange", function NzSelectComponent_Template_ng_template_positionChange_4_listener($event) {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onPositionChange($event));
          });
        }
        if (rf & 2) {
          const origin_r6 = ɵɵreference(1);
          ɵɵproperty("nzId", ctx.nzId)("open", ctx.nzOpen)("disabled", ctx.nzDisabled)("mode", ctx.nzMode)("nzNoAnimation", ctx.noAnimation == null ? null : ctx.noAnimation.nzNoAnimation == null ? null : ctx.noAnimation.nzNoAnimation())("maxTagPlaceholder", ctx.nzMaxTagPlaceholder)("removeIcon", ctx.nzRemoveIcon)("placeHolder", ctx.nzPlaceHolder)("maxTagCount", ctx.nzMaxTagCount)("customTemplate", ctx.nzCustomTemplate)("tokenSeparators", ctx.nzTokenSeparators)("showSearch", ctx.nzShowSearch)("autofocus", ctx.nzAutoFocus)("listOfTopItem", ctx.listOfTopItem)("prefix", ctx.nzPrefix);
          ɵɵadvance(2);
          ɵɵconditional(ctx.showArrow || ctx.hasFeedback && !!ctx.status || ctx.isMaxMultipleCountSet ? 2 : -1);
          ɵɵadvance();
          ɵɵconditional(ctx.nzAllowClear && !ctx.nzDisabled && ctx.listOfValue.length ? 3 : -1);
          ɵɵadvance();
          ɵɵproperty("cdkConnectedOverlayHasBackdrop", ctx.nzBackdrop)("cdkConnectedOverlayMinWidth", ctx.nzDropdownMatchSelectWidth ? null : ctx.triggerWidth)("cdkConnectedOverlayWidth", ctx.nzDropdownMatchSelectWidth ? ctx.triggerWidth : null)("cdkConnectedOverlayOrigin", origin_r6)("cdkConnectedOverlayTransformOriginOn", ".ant-select-dropdown")("cdkConnectedOverlayPanelClass", ctx.nzDropdownClassName)("cdkConnectedOverlayOpen", ctx.nzOpen)("cdkConnectedOverlayPositions", ctx.positions);
        }
      },
      dependencies: [NzSelectTopControlComponent, CdkOverlayOrigin, NzNoAnimationDirective, NzSelectArrowComponent, NzFormItemFeedbackIconComponent, NzSelectClearComponent, CdkConnectedOverlay, NzOverlayModule, NzConnectedOverlayDirective, NzOptionContainerComponent],
      encapsulation: 2,
      changeDetection: 0
    });
  };
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSelectComponent, [{
    type: Component,
    args: [{
      selector: "nz-select",
      exportAs: "nzSelect",
      providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => NzSelectComponent),
        multi: true
      }, {
        provide: NZ_SPACE_COMPACT_ITEM_TYPE,
        useValue: "select"
      }],
      changeDetection: ChangeDetectionStrategy.OnPush,
      encapsulation: ViewEncapsulation.None,
      template: `
    <nz-select-top-control
      cdkOverlayOrigin
      #origin="cdkOverlayOrigin"
      [nzId]="nzId"
      [open]="nzOpen"
      [disabled]="nzDisabled"
      [mode]="nzMode"
      [nzNoAnimation]="noAnimation?.nzNoAnimation?.()"
      [maxTagPlaceholder]="nzMaxTagPlaceholder"
      [removeIcon]="nzRemoveIcon"
      [placeHolder]="nzPlaceHolder"
      [maxTagCount]="nzMaxTagCount"
      [customTemplate]="nzCustomTemplate"
      [tokenSeparators]="nzTokenSeparators"
      [showSearch]="nzShowSearch"
      [autofocus]="nzAutoFocus"
      [listOfTopItem]="listOfTopItem"
      [prefix]="nzPrefix"
      (inputValueChange)="onInputValueChange($event)"
      (tokenize)="onTokenSeparate($event)"
      (deleteItem)="onItemDelete($event)"
      (keydown)="onKeyDown($event)"
    />
    @if (showArrow || (hasFeedback && !!status) || isMaxMultipleCountSet) {
      <nz-select-arrow
        [showArrow]="nzShowArrow"
        [loading]="nzLoading"
        [search]="nzOpen && nzShowSearch"
        [suffixIcon]="nzSuffixIcon"
        [feedbackIcon]="feedbackIconTpl"
        [nzMaxMultipleCount]="nzMaxMultipleCount"
        [listOfValue]="listOfValue"
        [isMaxMultipleCountSet]="isMaxMultipleCountSet"
      >
        <ng-template #feedbackIconTpl>
          @if (hasFeedback && !!status) {
            <nz-form-item-feedback-icon [status]="status" />
          }
        </ng-template>
      </nz-select-arrow>
    }

    @if (nzAllowClear && !nzDisabled && listOfValue.length) {
      <nz-select-clear [clearIcon]="nzClearIcon" (clear)="onClearSelection()" />
    }
    <ng-template
      cdkConnectedOverlay
      nzConnectedOverlay
      [cdkConnectedOverlayHasBackdrop]="nzBackdrop"
      [cdkConnectedOverlayMinWidth]="$any(nzDropdownMatchSelectWidth ? null : triggerWidth)"
      [cdkConnectedOverlayWidth]="$any(nzDropdownMatchSelectWidth ? triggerWidth : null)"
      [cdkConnectedOverlayOrigin]="origin"
      [cdkConnectedOverlayTransformOriginOn]="'.ant-select-dropdown'"
      [cdkConnectedOverlayPanelClass]="nzDropdownClassName!"
      [cdkConnectedOverlayOpen]="nzOpen"
      [cdkConnectedOverlayPositions]="positions"
      (overlayOutsideClick)="onClickOutside($event)"
      (detach)="setOpenState(false)"
      (positionChange)="onPositionChange($event)"
    >
      <nz-option-container
        [style]="nzDropdownStyle"
        [itemSize]="nzOptionHeightPx"
        [maxItemLength]="nzOptionOverflowSize"
        [matchWidth]="nzDropdownMatchSelectWidth"
        [class.ant-select-dropdown-placement-bottomLeft]="dropdownPosition === 'bottomLeft'"
        [class.ant-select-dropdown-placement-topLeft]="dropdownPosition === 'topLeft'"
        [class.ant-select-dropdown-placement-bottomRight]="dropdownPosition === 'bottomRight'"
        [class.ant-select-dropdown-placement-topRight]="dropdownPosition === 'topRight'"
        [animate.enter]="selectAnimationEnter()"
        [animate.leave]="selectAnimationLeave()"
        [nzNoAnimation]="!!noAnimation?.nzNoAnimation?.()"
        [listOfContainerItem]="listOfContainerItem"
        [menuItemSelectedIcon]="nzMenuItemSelectedIcon"
        [notFoundContent]="nzNotFoundContent"
        [activatedValue]="activatedValue"
        [listOfSelectedValue]="listOfValue"
        [dropdownRender]="nzDropdownRender"
        [compareWith]="compareWith"
        [mode]="nzMode"
        [isMaxMultipleCountReached]="isMaxMultipleCountReached"
        (keydown)="onKeyDown($event)"
        (itemClick)="onItemClick($event)"
        (scrollToBottom)="nzScrollToBottom.emit()"
      />
    </ng-template>
  `,
      host: {
        class: "ant-select",
        "[class.ant-select-in-form-item]": "!!nzFormStatusService",
        "[class.ant-select-lg]": 'finalSize() === "large"',
        "[class.ant-select-sm]": 'finalSize() === "small"',
        "[class.ant-select-show-arrow]": `showArrow`,
        "[class.ant-select-disabled]": "nzDisabled",
        "[class.ant-select-show-search]": `(nzShowSearch || nzMode !== 'default') && !nzDisabled`,
        "[class.ant-select-allow-clear]": "nzAllowClear",
        "[class.ant-select-borderless]": `nzVariant === 'borderless'`,
        "[class.ant-select-filled]": `nzVariant === 'filled'`,
        "[class.ant-select-underlined]": `nzVariant === 'underlined'`,
        "[class.ant-select-open]": "nzOpen",
        "[class.ant-select-focused]": "nzOpen || focused",
        "[class.ant-select-single]": `nzMode === 'default'`,
        "[class.ant-select-multiple]": `nzMode !== 'default'`,
        "[class.ant-select-rtl]": `dir === 'rtl'`
      },
      hostDirectives: [NzSpaceCompactItemDirective],
      imports: [NzSelectTopControlComponent, CdkOverlayOrigin, NzNoAnimationDirective, NzSelectArrowComponent, NzFormItemFeedbackIconComponent, NzSelectClearComponent, CdkConnectedOverlay, NzOverlayModule, NzOptionContainerComponent]
    }]
  }], () => [], {
    nzId: [{
      type: Input
    }],
    nzSize: [{
      type: Input
    }],
    nzStatus: [{
      type: Input
    }],
    nzVariant: [{
      type: Input
    }],
    nzOptionHeightPx: [{
      type: Input
    }],
    nzOptionOverflowSize: [{
      type: Input
    }],
    nzDropdownClassName: [{
      type: Input
    }],
    nzDropdownMatchSelectWidth: [{
      type: Input
    }],
    nzDropdownStyle: [{
      type: Input
    }],
    nzNotFoundContent: [{
      type: Input
    }],
    nzPlaceHolder: [{
      type: Input
    }],
    nzPlacement: [{
      type: Input
    }],
    nzMaxTagCount: [{
      type: Input
    }],
    nzDropdownRender: [{
      type: Input
    }],
    nzCustomTemplate: [{
      type: Input
    }],
    nzPrefix: [{
      type: Input
    }],
    nzSuffixIcon: [{
      type: Input
    }],
    nzClearIcon: [{
      type: Input
    }],
    nzRemoveIcon: [{
      type: Input
    }],
    nzMenuItemSelectedIcon: [{
      type: Input
    }],
    nzTokenSeparators: [{
      type: Input
    }],
    nzMaxTagPlaceholder: [{
      type: Input
    }],
    nzMaxMultipleCount: [{
      type: Input,
      args: [{
        transform: numberAttributeWithInfinityFallback
      }]
    }],
    nzMode: [{
      type: Input
    }],
    nzFilterOption: [{
      type: Input
    }],
    compareWith: [{
      type: Input
    }],
    nzAllowClear: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzShowSearch: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzLoading: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzAutoFocus: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzAutoClearSearchValue: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzServerSearch: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzDisabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzOpen: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzSelectOnTab: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzBackdrop: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzOptions: [{
      type: Input
    }],
    nzShowArrow: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzOnSearch: [{
      type: Output
    }],
    nzScrollToBottom: [{
      type: Output
    }],
    nzOpenChange: [{
      type: Output
    }],
    nzBlur: [{
      type: Output
    }],
    nzFocus: [{
      type: Output
    }],
    nzOnClear: [{
      type: Output,
      args: ["nzOnClear"]
    }],
    originElement: [{
      type: ViewChild,
      args: [CdkOverlayOrigin, {
        static: true,
        read: ElementRef
      }]
    }],
    cdkConnectedOverlay: [{
      type: ViewChild,
      args: [CdkConnectedOverlay, {
        static: true
      }]
    }],
    nzSelectTopControlComponent: [{
      type: ViewChild,
      args: [NzSelectTopControlComponent, {
        static: true
      }]
    }],
    listOfNzOptionComponent: [{
      type: ContentChildren,
      args: [NzOptionComponent, {
        descendants: true
      }]
    }],
    listOfNzOptionGroupComponent: [{
      type: ContentChildren,
      args: [NzOptionGroupComponent, {
        descendants: true
      }]
    }],
    nzOptionGroupComponentElement: [{
      type: ViewChild,
      args: [NzOptionGroupComponent, {
        static: true,
        read: ElementRef
      }]
    }],
    nzSelectTopControlComponentElement: [{
      type: ViewChild,
      args: [NzSelectTopControlComponent, {
        static: true,
        read: ElementRef
      }]
    }]
  });
})();
var NzSelectModule = class _NzSelectModule {
  static ɵfac = function NzSelectModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSelectModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzSelectModule,
    imports: [NzOptionComponent, NzSelectComponent, NzOptionContainerComponent, NzOptionGroupComponent, NzOptionItemComponent, NzSelectTopControlComponent, NzSelectSearchComponent, NzSelectItemComponent, NzSelectClearComponent, NzSelectArrowComponent, NzSelectPlaceholderComponent, NzOptionItemGroupComponent],
    exports: [NzOptionComponent, NzSelectComponent, NzOptionGroupComponent, NzSelectArrowComponent, NzSelectClearComponent, NzSelectItemComponent, NzSelectPlaceholderComponent, NzSelectSearchComponent]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [NzSelectComponent, NzOptionContainerComponent, NzOptionItemComponent, NzSelectTopControlComponent, NzSelectSearchComponent, NzSelectItemComponent, NzSelectClearComponent, NzSelectArrowComponent, NzSelectPlaceholderComponent, NzOptionItemGroupComponent]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSelectModule, [{
    type: NgModule,
    args: [{
      imports: [NzOptionComponent, NzSelectComponent, NzOptionContainerComponent, NzOptionGroupComponent, NzOptionItemComponent, NzSelectTopControlComponent, NzSelectSearchComponent, NzSelectItemComponent, NzSelectClearComponent, NzSelectArrowComponent, NzSelectPlaceholderComponent, NzOptionItemGroupComponent],
      exports: [NzOptionComponent, NzSelectComponent, NzOptionGroupComponent, NzSelectArrowComponent, NzSelectClearComponent, NzSelectItemComponent, NzSelectPlaceholderComponent, NzSelectSearchComponent]
    }]
  }], null, null);
})();

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-pagination.mjs
var _c03 = ["nz-pagination-item", ""];
var _c12 = (a0, a1) => ({
  $implicit: a0,
  page: a1
});
function NzPaginationItemComponent_ng_template_0_Case_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "a");
    ɵɵtext(1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const page_r1 = ɵɵnextContext().page;
    ɵɵadvance();
    ɵɵtextInterpolate(page_r1);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_1_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 4);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_1_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 5);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "button", 2);
    ɵɵconditionalCreate(1, NzPaginationItemComponent_ng_template_0_Case_1_Conditional_1_Template, 1, 0, "nz-icon", 4)(2, NzPaginationItemComponent_ng_template_0_Case_1_Conditional_2_Template, 1, 0, "nz-icon", 5);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵproperty("disabled", ctx_r1.disabled);
    ɵɵattribute("title", ctx_r1.locale.prev_page);
    ɵɵadvance();
    ɵɵconditional(ctx_r1.direction === "rtl" ? 1 : 2);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 5);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 4);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "button", 2);
    ɵɵconditionalCreate(1, NzPaginationItemComponent_ng_template_0_Case_2_Conditional_1_Template, 1, 0, "nz-icon", 5)(2, NzPaginationItemComponent_ng_template_0_Case_2_Conditional_2_Template, 1, 0, "nz-icon", 4);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(2);
    ɵɵproperty("disabled", ctx_r1.disabled);
    ɵɵattribute("title", ctx_r1.locale.next_page);
    ɵɵadvance();
    ɵɵconditional(ctx_r1.direction === "rtl" ? 1 : 2);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_3_Case_2_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 8);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_3_Case_2_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 9);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_3_Case_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzPaginationItemComponent_ng_template_0_Case_3_Case_2_Conditional_0_Template, 1, 0, "nz-icon", 8)(1, NzPaginationItemComponent_ng_template_0_Case_3_Case_2_Conditional_1_Template, 1, 0, "nz-icon", 9);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵconditional(ctx_r1.direction === "rtl" ? 0 : 1);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_3_Case_3_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 9);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_3_Case_3_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-icon", 8);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_3_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzPaginationItemComponent_ng_template_0_Case_3_Case_3_Conditional_0_Template, 1, 0, "nz-icon", 9)(1, NzPaginationItemComponent_ng_template_0_Case_3_Case_3_Conditional_1_Template, 1, 0, "nz-icon", 8);
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext(3);
    ɵɵconditional(ctx_r1.direction === "rtl" ? 0 : 1);
  }
}
function NzPaginationItemComponent_ng_template_0_Case_3_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "a", 3)(1, "div", 6);
    ɵɵconditionalCreate(2, NzPaginationItemComponent_ng_template_0_Case_3_Case_2_Template, 2, 1)(3, NzPaginationItemComponent_ng_template_0_Case_3_Case_3_Template, 2, 1);
    ɵɵelementStart(4, "span", 7);
    ɵɵtext(5, "•••");
    ɵɵelementEnd()()();
  }
  if (rf & 2) {
    let tmp_5_0;
    const type_r3 = ɵɵnextContext().$implicit;
    ɵɵadvance(2);
    ɵɵconditional((tmp_5_0 = type_r3) === "prev_5" ? 2 : tmp_5_0 === "next_5" ? 3 : -1);
  }
}
function NzPaginationItemComponent_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzPaginationItemComponent_ng_template_0_Case_0_Template, 2, 1, "a")(1, NzPaginationItemComponent_ng_template_0_Case_1_Template, 3, 3, "button", 2)(2, NzPaginationItemComponent_ng_template_0_Case_2_Template, 3, 3, "button", 2)(3, NzPaginationItemComponent_ng_template_0_Case_3_Template, 6, 1, "a", 3);
  }
  if (rf & 2) {
    let tmp_4_0;
    const type_r3 = ctx.$implicit;
    ɵɵconditional((tmp_4_0 = type_r3) === "page" ? 0 : tmp_4_0 === "prev" ? 1 : tmp_4_0 === "next" ? 2 : 3);
  }
}
function NzPaginationItemComponent_ng_template_2_Template(rf, ctx) {
}
var _c22 = ["nz-pagination-options", ""];
var _forTrack02 = ($index, $item) => $item.value;
function NzPaginationOptionsComponent_Conditional_0_For_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelement(0, "nz-option", 3);
  }
  if (rf & 2) {
    const option_r3 = ctx.$implicit;
    ɵɵproperty("nzLabel", option_r3.label)("nzValue", option_r3.value);
  }
}
function NzPaginationOptionsComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "nz-select", 2);
    ɵɵlistener("ngModelChange", function NzPaginationOptionsComponent_Conditional_0_Template_nz_select_ngModelChange_0_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.onPageSizeChange($event));
    });
    ɵɵrepeaterCreate(1, NzPaginationOptionsComponent_Conditional_0_For_2_Template, 1, 2, "nz-option", 3, _forTrack02);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵproperty("nzDisabled", ctx_r1.disabled)("nzSize", ctx_r1.nzSize)("ngModel", ctx_r1.pageSize);
    ɵɵadvance();
    ɵɵrepeater(ctx_r1.listOfPageSizeOption);
  }
}
function NzPaginationOptionsComponent_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "div", 1);
    ɵɵtext(1);
    ɵɵelementStart(2, "input", 4);
    ɵɵlistener("keydown.enter", function NzPaginationOptionsComponent_Conditional_1_Template_input_keydown_enter_2_listener($event) {
      ɵɵrestoreView(_r4);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.jumpToPageViaInput($event));
    });
    ɵɵelementEnd();
    ɵɵtext(3);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", ctx_r1.locale.jump_to, " ");
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r1.disabled);
    ɵɵadvance();
    ɵɵtextInterpolate1(" ", ctx_r1.locale.page, " ");
  }
}
var _c3 = ["containerTemplate"];
var _c4 = (a0, a1) => ({
  $implicit: a0,
  range: a1
});
function NzPaginationDefaultComponent_ng_template_0_Conditional_1_ng_template_1_Template(rf, ctx) {
}
function NzPaginationDefaultComponent_ng_template_0_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "li", 1);
    ɵɵtemplate(1, NzPaginationDefaultComponent_ng_template_0_Conditional_1_ng_template_1_Template, 0, 0, "ng-template", 4);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", ctx_r0.showTotal)("ngTemplateOutletContext", ɵɵpureFunction2(2, _c4, ctx_r0.total, ctx_r0.ranges));
  }
}
function NzPaginationDefaultComponent_ng_template_0_For_3_Template(rf, ctx) {
  if (rf & 1) {
    const _r2 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "li", 5);
    ɵɵlistener("gotoIndex", function NzPaginationDefaultComponent_ng_template_0_For_3_Template_li_gotoIndex_0_listener($event) {
      ɵɵrestoreView(_r2);
      const ctx_r0 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r0.jumpPage($event));
    })("diffIndex", function NzPaginationDefaultComponent_ng_template_0_For_3_Template_li_diffIndex_0_listener($event) {
      ɵɵrestoreView(_r2);
      const ctx_r0 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r0.jumpDiff($event));
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const page_r3 = ctx.$implicit;
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("locale", ctx_r0.locale)("type", page_r3.type)("index", page_r3.index)("disabled", !!page_r3.disabled)("itemRender", ctx_r0.itemRender)("active", ctx_r0.pageIndex === page_r3.index)("direction", ctx_r0.dir);
  }
}
function NzPaginationDefaultComponent_ng_template_0_Conditional_4_Template(rf, ctx) {
  if (rf & 1) {
    const _r4 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "li", 6);
    ɵɵlistener("pageIndexChange", function NzPaginationDefaultComponent_ng_template_0_Conditional_4_Template_li_pageIndexChange_0_listener($event) {
      ɵɵrestoreView(_r4);
      const ctx_r0 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r0.onPageIndexChange($event));
    })("pageSizeChange", function NzPaginationDefaultComponent_ng_template_0_Conditional_4_Template_li_pageSizeChange_0_listener($event) {
      ɵɵrestoreView(_r4);
      const ctx_r0 = ɵɵnextContext(2);
      return ɵɵresetView(ctx_r0.onPageSizeChange($event));
    });
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(2);
    ɵɵproperty("total", ctx_r0.total)("locale", ctx_r0.locale)("disabled", ctx_r0.disabled)("nzSize", ctx_r0.nzSize)("showSizeChanger", ctx_r0.showSizeChanger)("showQuickJumper", ctx_r0.showQuickJumper)("pageIndex", ctx_r0.pageIndex)("pageSize", ctx_r0.pageSize)("pageSizeOptions", ctx_r0.pageSizeOptions);
  }
}
function NzPaginationDefaultComponent_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "ul");
    ɵɵconditionalCreate(1, NzPaginationDefaultComponent_ng_template_0_Conditional_1_Template, 2, 5, "li", 1);
    ɵɵrepeaterCreate(2, NzPaginationDefaultComponent_ng_template_0_For_3_Template, 1, 7, "li", 2, ɵɵcomponentInstance().trackByPageItem, true);
    ɵɵconditionalCreate(4, NzPaginationDefaultComponent_ng_template_0_Conditional_4_Template, 1, 9, "li", 3);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵconditional(ctx_r0.showTotal ? 1 : -1);
    ɵɵadvance();
    ɵɵrepeater(ctx_r0.listOfPageItem);
    ɵɵadvance(2);
    ɵɵconditional(ctx_r0.showQuickJumper || ctx_r0.showSizeChanger ? 4 : -1);
  }
}
function NzPaginationSimpleComponent_ng_template_0_Template(rf, ctx) {
  if (rf & 1) {
    const _r1 = ɵɵgetCurrentView();
    ɵɵelementStart(0, "ul")(1, "li", 1);
    ɵɵlistener("click", function NzPaginationSimpleComponent_ng_template_0_Template_li_click_1_listener() {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.prePage());
    });
    ɵɵelementEnd();
    ɵɵelementStart(2, "li", 2)(3, "input", 3);
    ɵɵlistener("keydown.enter", function NzPaginationSimpleComponent_ng_template_0_Template_input_keydown_enter_3_listener($event) {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.jumpToPageViaInput($event));
    });
    ɵɵelementEnd();
    ɵɵelementStart(4, "span", 4);
    ɵɵtext(5, "/");
    ɵɵelementEnd();
    ɵɵtext(6);
    ɵɵelementEnd();
    ɵɵelementStart(7, "li", 5);
    ɵɵlistener("click", function NzPaginationSimpleComponent_ng_template_0_Template_li_click_7_listener() {
      ɵɵrestoreView(_r1);
      const ctx_r1 = ɵɵnextContext();
      return ɵɵresetView(ctx_r1.nextPage());
    });
    ɵɵelementEnd()();
  }
  if (rf & 2) {
    const ctx_r1 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("locale", ctx_r1.locale)("disabled", ctx_r1.isFirstIndex)("direction", ctx_r1.dir)("itemRender", ctx_r1.itemRender);
    ɵɵattribute("title", ctx_r1.locale.prev_page);
    ɵɵadvance();
    ɵɵattribute("title", ctx_r1.pageIndex + "/" + ctx_r1.lastIndex);
    ɵɵadvance();
    ɵɵproperty("disabled", ctx_r1.disabled)("value", ctx_r1.pageIndex);
    ɵɵadvance(3);
    ɵɵtextInterpolate1(" ", ctx_r1.lastIndex, " ");
    ɵɵadvance();
    ɵɵproperty("locale", ctx_r1.locale)("disabled", ctx_r1.isLastIndex)("direction", ctx_r1.dir)("itemRender", ctx_r1.itemRender);
    ɵɵattribute("title", ctx_r1.locale == null ? null : ctx_r1.locale.next_page);
  }
}
function NzPaginationComponent_Conditional_0_Conditional_0_ng_template_0_Template(rf, ctx) {
}
function NzPaginationComponent_Conditional_0_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzPaginationComponent_Conditional_0_Conditional_0_ng_template_0_Template, 0, 0, "ng-template", 4);
  }
  if (rf & 2) {
    ɵɵnextContext(2);
    const simplePagination_r2 = ɵɵreference(2);
    ɵɵproperty("ngTemplateOutlet", simplePagination_r2.template);
  }
}
function NzPaginationComponent_Conditional_0_Conditional_1_ng_template_0_Template(rf, ctx) {
}
function NzPaginationComponent_Conditional_0_Conditional_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtemplate(0, NzPaginationComponent_Conditional_0_Conditional_1_ng_template_0_Template, 0, 0, "ng-template", 4);
  }
  if (rf & 2) {
    ɵɵnextContext(2);
    const defaultPagination_r3 = ɵɵreference(4);
    ɵɵproperty("ngTemplateOutlet", defaultPagination_r3.template);
  }
}
function NzPaginationComponent_Conditional_0_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵconditionalCreate(0, NzPaginationComponent_Conditional_0_Conditional_0_Template, 1, 1, null, 4)(1, NzPaginationComponent_Conditional_0_Conditional_1_Template, 1, 1, null, 4);
  }
  if (rf & 2) {
    const ctx_r3 = ɵɵnextContext();
    ɵɵconditional(ctx_r3.nzSimple ? 0 : 1);
  }
}
var NzPaginationItemComponent = class _NzPaginationItemComponent {
  active = false;
  locale;
  index = null;
  disabled = false;
  direction = "ltr";
  type = null;
  itemRender = null;
  diffIndex = new EventEmitter();
  gotoIndex = new EventEmitter();
  title = null;
  clickItem() {
    if (!this.disabled) {
      if (this.type === "page") {
        this.gotoIndex.emit(this.index);
      } else {
        this.diffIndex.emit({
          next: 1,
          prev: -1,
          prev_5: -5,
          next_5: 5
        }[this.type]);
      }
    }
  }
  ngOnChanges(changes) {
    const {
      locale,
      index,
      type
    } = changes;
    if (locale || index || type) {
      this.title = {
        page: `${this.index}`,
        next: this.locale?.next_page,
        prev: this.locale?.prev_page,
        prev_5: this.locale?.prev_5,
        next_5: this.locale?.next_5
      }[this.type];
    }
  }
  static ɵfac = function NzPaginationItemComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzPaginationItemComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzPaginationItemComponent,
    selectors: [["li", "nz-pagination-item", ""]],
    hostVars: 19,
    hostBindings: function NzPaginationItemComponent_HostBindings(rf, ctx) {
      if (rf & 1) {
        ɵɵlistener("click", function NzPaginationItemComponent_click_HostBindingHandler() {
          return ctx.clickItem();
        });
      }
      if (rf & 2) {
        ɵɵattribute("title", ctx.title);
        ɵɵclassProp("ant-pagination-prev", ctx.type === "prev")("ant-pagination-next", ctx.type === "next")("ant-pagination-item", ctx.type === "page")("ant-pagination-jump-prev", ctx.type === "prev_5")("ant-pagination-jump-prev-custom-icon", ctx.type === "prev_5")("ant-pagination-jump-next", ctx.type === "next_5")("ant-pagination-jump-next-custom-icon", ctx.type === "next_5")("ant-pagination-disabled", ctx.disabled)("ant-pagination-item-active", ctx.active);
      }
    },
    inputs: {
      active: "active",
      locale: "locale",
      index: "index",
      disabled: "disabled",
      direction: "direction",
      type: "type",
      itemRender: "itemRender"
    },
    outputs: {
      diffIndex: "diffIndex",
      gotoIndex: "gotoIndex"
    },
    features: [ɵɵNgOnChangesFeature],
    attrs: _c03,
    decls: 3,
    vars: 5,
    consts: [["renderItemTemplate", ""], [3, "ngTemplateOutlet", "ngTemplateOutletContext"], ["type", "button", 1, "ant-pagination-item-link", 3, "disabled"], [1, "ant-pagination-item-link"], ["nzType", "right"], ["nzType", "left"], [1, "ant-pagination-item-container"], [1, "ant-pagination-item-ellipsis"], ["nzType", "double-right", 1, "ant-pagination-item-link-icon"], ["nzType", "double-left", 1, "ant-pagination-item-link-icon"]],
    template: function NzPaginationItemComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, NzPaginationItemComponent_ng_template_0_Template, 4, 1, "ng-template", null, 0, ɵɵtemplateRefExtractor)(2, NzPaginationItemComponent_ng_template_2_Template, 0, 0, "ng-template", 1);
      }
      if (rf & 2) {
        const renderItemTemplate_r4 = ɵɵreference(1);
        ɵɵadvance(2);
        ɵɵproperty("ngTemplateOutlet", ctx.itemRender || renderItemTemplate_r4)("ngTemplateOutletContext", ɵɵpureFunction2(2, _c12, ctx.type, ctx.index));
      }
    },
    dependencies: [NzIconModule, NzIconDirective, NgTemplateOutlet],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzPaginationItemComponent, [{
    type: Component,
    args: [{
      selector: "li[nz-pagination-item]",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    <ng-template #renderItemTemplate let-type let-page="page">
      @switch (type) {
        @case ('page') {
          <a>{{ page }}</a>
        }
        @case ('prev') {
          <button type="button" [disabled]="disabled" [attr.title]="locale.prev_page" class="ant-pagination-item-link">
            @if (direction === 'rtl') {
              <nz-icon nzType="right" />
            } @else {
              <nz-icon nzType="left" />
            }
          </button>
        }
        @case ('next') {
          <button type="button" [disabled]="disabled" [attr.title]="locale.next_page" class="ant-pagination-item-link">
            @if (direction === 'rtl') {
              <nz-icon nzType="left" />
            } @else {
              <nz-icon nzType="right" />
            }
          </button>
        }
        @default {
          <a class="ant-pagination-item-link">
            <div class="ant-pagination-item-container">
              @switch (type) {
                @case ('prev_5') {
                  @if (direction === 'rtl') {
                    <nz-icon nzType="double-right" class="ant-pagination-item-link-icon" />
                  } @else {
                    <nz-icon nzType="double-left" class="ant-pagination-item-link-icon" />
                  }
                }
                @case ('next_5') {
                  @if (direction === 'rtl') {
                    <nz-icon nzType="double-left" class="ant-pagination-item-link-icon" />
                  } @else {
                    <nz-icon nzType="double-right" class="ant-pagination-item-link-icon" />
                  }
                }
              }
              <span class="ant-pagination-item-ellipsis">•••</span>
            </div>
          </a>
        }
      }
    </ng-template>
    <ng-template
      [ngTemplateOutlet]="itemRender || renderItemTemplate"
      [ngTemplateOutletContext]="{ $implicit: type, page: index }"
    />
  `,
      host: {
        "[class.ant-pagination-prev]": `type === 'prev'`,
        "[class.ant-pagination-next]": `type === 'next'`,
        "[class.ant-pagination-item]": `type === 'page'`,
        "[class.ant-pagination-jump-prev]": `type === 'prev_5'`,
        "[class.ant-pagination-jump-prev-custom-icon]": `type === 'prev_5'`,
        "[class.ant-pagination-jump-next]": `type === 'next_5'`,
        "[class.ant-pagination-jump-next-custom-icon]": `type === 'next_5'`,
        "[class.ant-pagination-disabled]": "disabled",
        "[class.ant-pagination-item-active]": "active",
        "[attr.title]": "title",
        "(click)": "clickItem()"
      },
      imports: [NzIconModule, NgTemplateOutlet]
    }]
  }], null, {
    active: [{
      type: Input
    }],
    locale: [{
      type: Input
    }],
    index: [{
      type: Input
    }],
    disabled: [{
      type: Input
    }],
    direction: [{
      type: Input
    }],
    type: [{
      type: Input
    }],
    itemRender: [{
      type: Input
    }],
    diffIndex: [{
      type: Output
    }],
    gotoIndex: [{
      type: Output
    }]
  });
})();
var NzPaginationOptionsComponent = class _NzPaginationOptionsComponent {
  nzSize = "default";
  disabled = false;
  showSizeChanger = false;
  showQuickJumper = false;
  locale;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  pageSizeOptions = [];
  pageIndexChange = new EventEmitter();
  pageSizeChange = new EventEmitter();
  listOfPageSizeOption = [];
  onPageSizeChange(size) {
    if (this.pageSize !== size) {
      this.pageSizeChange.next(size);
    }
  }
  jumpToPageViaInput($event) {
    const target = $event.target;
    const index = Math.floor(toNumber(target.value, this.pageIndex));
    this.pageIndexChange.next(index);
    target.value = "";
  }
  ngOnChanges(changes) {
    const {
      pageSize,
      pageSizeOptions,
      locale
    } = changes;
    if (pageSize || pageSizeOptions || locale) {
      this.listOfPageSizeOption = [.../* @__PURE__ */ new Set([...this.pageSizeOptions, this.pageSize])].map((item) => ({
        value: item,
        label: `${item} ${this.locale.items_per_page}`
      }));
    }
  }
  static ɵfac = function NzPaginationOptionsComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzPaginationOptionsComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzPaginationOptionsComponent,
    selectors: [["li", "nz-pagination-options", ""]],
    hostAttrs: [1, "ant-pagination-options"],
    inputs: {
      nzSize: "nzSize",
      disabled: "disabled",
      showSizeChanger: "showSizeChanger",
      showQuickJumper: "showQuickJumper",
      locale: "locale",
      total: "total",
      pageIndex: "pageIndex",
      pageSize: "pageSize",
      pageSizeOptions: "pageSizeOptions"
    },
    outputs: {
      pageIndexChange: "pageIndexChange",
      pageSizeChange: "pageSizeChange"
    },
    features: [ɵɵNgOnChangesFeature],
    attrs: _c22,
    decls: 2,
    vars: 2,
    consts: [[1, "ant-pagination-options-size-changer", 3, "nzDisabled", "nzSize", "ngModel"], [1, "ant-pagination-options-quick-jumper"], [1, "ant-pagination-options-size-changer", 3, "ngModelChange", "nzDisabled", "nzSize", "ngModel"], [3, "nzLabel", "nzValue"], [3, "keydown.enter", "disabled"]],
    template: function NzPaginationOptionsComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵconditionalCreate(0, NzPaginationOptionsComponent_Conditional_0_Template, 3, 3, "nz-select", 0);
        ɵɵconditionalCreate(1, NzPaginationOptionsComponent_Conditional_1_Template, 4, 3, "div", 1);
      }
      if (rf & 2) {
        ɵɵconditional(ctx.showSizeChanger ? 0 : -1);
        ɵɵadvance();
        ɵɵconditional(ctx.showQuickJumper ? 1 : -1);
      }
    },
    dependencies: [NzSelectModule, NzOptionComponent, NzSelectComponent, FormsModule, NgControlStatus, NgModel],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzPaginationOptionsComponent, [{
    type: Component,
    args: [{
      selector: "li[nz-pagination-options]",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    @if (showSizeChanger) {
      <nz-select
        class="ant-pagination-options-size-changer"
        [nzDisabled]="disabled"
        [nzSize]="nzSize"
        [ngModel]="pageSize"
        (ngModelChange)="onPageSizeChange($event)"
      >
        @for (option of listOfPageSizeOption; track option.value) {
          <nz-option [nzLabel]="option.label" [nzValue]="option.value" />
        }
      </nz-select>
    }

    @if (showQuickJumper) {
      <div class="ant-pagination-options-quick-jumper">
        {{ locale.jump_to }}
        <input [disabled]="disabled" (keydown.enter)="jumpToPageViaInput($event)" />
        {{ locale.page }}
      </div>
    }
  `,
      host: {
        class: "ant-pagination-options"
      },
      imports: [NzSelectModule, FormsModule]
    }]
  }], null, {
    nzSize: [{
      type: Input
    }],
    disabled: [{
      type: Input
    }],
    showSizeChanger: [{
      type: Input
    }],
    showQuickJumper: [{
      type: Input
    }],
    locale: [{
      type: Input
    }],
    total: [{
      type: Input
    }],
    pageIndex: [{
      type: Input
    }],
    pageSize: [{
      type: Input
    }],
    pageSizeOptions: [{
      type: Input
    }],
    pageIndexChange: [{
      type: Output
    }],
    pageSizeChange: [{
      type: Output
    }]
  });
})();
var NzPaginationDefaultComponent = class _NzPaginationDefaultComponent {
  cdr = inject(ChangeDetectorRef);
  directionality = inject(Directionality);
  destroyRef = inject(DestroyRef);
  template;
  nzSize = "default";
  itemRender = null;
  showTotal = null;
  disabled = false;
  locale;
  showSizeChanger = false;
  showQuickJumper = false;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  pageSizeOptions = [10, 20, 30, 40];
  pageIndexChange = new EventEmitter();
  pageSizeChange = new EventEmitter();
  ranges = [0, 0];
  listOfPageItem = [];
  dir = "ltr";
  constructor() {
    const el = inject(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    renderer.removeChild(renderer.parentNode(el), el);
  }
  ngOnInit() {
    this.directionality.change?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((direction) => {
      this.dir = direction;
      this.cdr.detectChanges();
    });
    this.dir = this.directionality.value;
  }
  jumpPage(index) {
    this.onPageIndexChange(index);
  }
  jumpDiff(diff) {
    this.jumpPage(this.pageIndex + diff);
  }
  trackByPageItem(_, value) {
    return `${value.type}-${value.index}`;
  }
  onPageIndexChange(index) {
    this.pageIndexChange.next(index);
  }
  onPageSizeChange(size) {
    this.pageSizeChange.next(size);
  }
  getLastIndex(total, pageSize) {
    return Math.ceil(total / pageSize);
  }
  buildIndexes() {
    const lastIndex = this.getLastIndex(this.total, this.pageSize);
    this.listOfPageItem = this.getListOfPageItem(this.pageIndex, lastIndex);
  }
  getListOfPageItem(pageIndex, lastIndex) {
    const concatWithPrevNext = (listOfPage) => {
      const prevItem = {
        type: "prev",
        disabled: pageIndex === 1
      };
      const nextItem = {
        type: "next",
        disabled: pageIndex === lastIndex
      };
      return [prevItem, ...listOfPage, nextItem];
    };
    const generatePage = (start, end) => {
      const list = [];
      for (let i = start; i <= end; i++) {
        list.push({
          index: i,
          type: "page"
        });
      }
      return list;
    };
    if (lastIndex <= 9) {
      return concatWithPrevNext(generatePage(1, lastIndex));
    } else {
      const generateRangeItem = (selected, last) => {
        let listOfRange = [];
        const prevFiveItem = {
          type: "prev_5"
        };
        const nextFiveItem = {
          type: "next_5"
        };
        const firstPageItem = generatePage(1, 1);
        const lastPageItem = generatePage(lastIndex, lastIndex);
        if (selected < 5) {
          const maxLeft = selected === 4 ? 6 : 5;
          listOfRange = [...generatePage(2, maxLeft), nextFiveItem];
        } else if (selected < last - 3) {
          listOfRange = [prevFiveItem, ...generatePage(selected - 2, selected + 2), nextFiveItem];
        } else {
          const minRight = selected === last - 3 ? last - 5 : last - 4;
          listOfRange = [prevFiveItem, ...generatePage(minRight, last - 1)];
        }
        return [...firstPageItem, ...listOfRange, ...lastPageItem];
      };
      return concatWithPrevNext(generateRangeItem(pageIndex, lastIndex));
    }
  }
  ngOnChanges(changes) {
    const {
      pageIndex,
      pageSize,
      total
    } = changes;
    if (pageIndex || pageSize || total) {
      this.ranges = [(this.pageIndex - 1) * this.pageSize + 1, Math.min(this.pageIndex * this.pageSize, this.total)];
      this.buildIndexes();
    }
  }
  static ɵfac = function NzPaginationDefaultComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzPaginationDefaultComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzPaginationDefaultComponent,
    selectors: [["nz-pagination-default"]],
    viewQuery: function NzPaginationDefaultComponent_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(_c3, 7);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.template = _t.first);
      }
    },
    hostVars: 2,
    hostBindings: function NzPaginationDefaultComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("ant-pagination-rtl", ctx.dir === "rtl");
      }
    },
    inputs: {
      nzSize: "nzSize",
      itemRender: "itemRender",
      showTotal: "showTotal",
      disabled: "disabled",
      locale: "locale",
      showSizeChanger: "showSizeChanger",
      showQuickJumper: "showQuickJumper",
      total: "total",
      pageIndex: "pageIndex",
      pageSize: "pageSize",
      pageSizeOptions: "pageSizeOptions"
    },
    outputs: {
      pageIndexChange: "pageIndexChange",
      pageSizeChange: "pageSizeChange"
    },
    features: [ɵɵNgOnChangesFeature],
    decls: 2,
    vars: 0,
    consts: [["containerTemplate", ""], [1, "ant-pagination-total-text"], ["nz-pagination-item", "", 3, "locale", "type", "index", "disabled", "itemRender", "active", "direction"], ["nz-pagination-options", "", 3, "total", "locale", "disabled", "nzSize", "showSizeChanger", "showQuickJumper", "pageIndex", "pageSize", "pageSizeOptions"], [3, "ngTemplateOutlet", "ngTemplateOutletContext"], ["nz-pagination-item", "", 3, "gotoIndex", "diffIndex", "locale", "type", "index", "disabled", "itemRender", "active", "direction"], ["nz-pagination-options", "", 3, "pageIndexChange", "pageSizeChange", "total", "locale", "disabled", "nzSize", "showSizeChanger", "showQuickJumper", "pageIndex", "pageSize", "pageSizeOptions"]],
    template: function NzPaginationDefaultComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, NzPaginationDefaultComponent_ng_template_0_Template, 5, 2, "ng-template", null, 0, ɵɵtemplateRefExtractor);
      }
    },
    dependencies: [NgTemplateOutlet, NzPaginationItemComponent, NzPaginationOptionsComponent],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzPaginationDefaultComponent, [{
    type: Component,
    args: [{
      selector: "nz-pagination-default",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    <ng-template #containerTemplate>
      <ul>
        @if (showTotal) {
          <li class="ant-pagination-total-text">
            <ng-template
              [ngTemplateOutlet]="showTotal"
              [ngTemplateOutletContext]="{ $implicit: total, range: ranges }"
            />
          </li>
        }

        @for (page of listOfPageItem; track trackByPageItem($index, page)) {
          <li
            nz-pagination-item
            [locale]="locale"
            [type]="page.type"
            [index]="page.index"
            [disabled]="!!page.disabled"
            [itemRender]="itemRender"
            [active]="pageIndex === page.index"
            (gotoIndex)="jumpPage($event)"
            (diffIndex)="jumpDiff($event)"
            [direction]="dir"
          ></li>
        }

        @if (showQuickJumper || showSizeChanger) {
          <li
            nz-pagination-options
            [total]="total"
            [locale]="locale"
            [disabled]="disabled"
            [nzSize]="nzSize"
            [showSizeChanger]="showSizeChanger"
            [showQuickJumper]="showQuickJumper"
            [pageIndex]="pageIndex"
            [pageSize]="pageSize"
            [pageSizeOptions]="pageSizeOptions"
            (pageIndexChange)="onPageIndexChange($event)"
            (pageSizeChange)="onPageSizeChange($event)"
          ></li>
        }
      </ul>
    </ng-template>
  `,
      imports: [NgTemplateOutlet, NzPaginationItemComponent, NzPaginationOptionsComponent],
      host: {
        "[class.ant-pagination-rtl]": "dir === 'rtl'"
      }
    }]
  }], () => [], {
    template: [{
      type: ViewChild,
      args: ["containerTemplate", {
        static: true
      }]
    }],
    nzSize: [{
      type: Input
    }],
    itemRender: [{
      type: Input
    }],
    showTotal: [{
      type: Input
    }],
    disabled: [{
      type: Input
    }],
    locale: [{
      type: Input
    }],
    showSizeChanger: [{
      type: Input
    }],
    showQuickJumper: [{
      type: Input
    }],
    total: [{
      type: Input
    }],
    pageIndex: [{
      type: Input
    }],
    pageSize: [{
      type: Input
    }],
    pageSizeOptions: [{
      type: Input
    }],
    pageIndexChange: [{
      type: Output
    }],
    pageSizeChange: [{
      type: Output
    }]
  });
})();
var NzPaginationSimpleComponent = class _NzPaginationSimpleComponent {
  cdr = inject(ChangeDetectorRef);
  directionality = inject(Directionality);
  destroyRef = inject(DestroyRef);
  template;
  itemRender = null;
  disabled = false;
  locale;
  total = 0;
  pageIndex = 1;
  pageSize = 10;
  pageIndexChange = new EventEmitter();
  lastIndex = 0;
  isFirstIndex = false;
  isLastIndex = false;
  dir = "ltr";
  constructor() {
    const el = inject(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    renderer.removeChild(renderer.parentNode(el), el);
  }
  ngOnInit() {
    this.directionality.change?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((direction) => {
      this.dir = direction;
      this.cdr.detectChanges();
    });
    this.dir = this.directionality.value;
  }
  jumpToPageViaInput($event) {
    const target = $event.target;
    const index = toNumber(target.value, this.pageIndex);
    this.onPageIndexChange(index);
    target.value = `${this.pageIndex}`;
  }
  prePage() {
    this.onPageIndexChange(this.pageIndex - 1);
  }
  nextPage() {
    this.onPageIndexChange(this.pageIndex + 1);
  }
  onPageIndexChange(index) {
    this.pageIndexChange.next(index);
  }
  updateBindingValue() {
    this.lastIndex = Math.ceil(this.total / this.pageSize);
    this.isFirstIndex = this.pageIndex === 1;
    this.isLastIndex = this.pageIndex === this.lastIndex;
  }
  ngOnChanges(changes) {
    const {
      pageIndex,
      total,
      pageSize
    } = changes;
    if (pageIndex || total || pageSize) {
      this.updateBindingValue();
    }
  }
  static ɵfac = function NzPaginationSimpleComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzPaginationSimpleComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzPaginationSimpleComponent,
    selectors: [["nz-pagination-simple"]],
    viewQuery: function NzPaginationSimpleComponent_Query(rf, ctx) {
      if (rf & 1) {
        ɵɵviewQuery(_c3, 7);
      }
      if (rf & 2) {
        let _t;
        ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.template = _t.first);
      }
    },
    hostVars: 2,
    hostBindings: function NzPaginationSimpleComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("ant-pagination-rtl", ctx.dir === "rtl");
      }
    },
    inputs: {
      itemRender: "itemRender",
      disabled: "disabled",
      locale: "locale",
      total: "total",
      pageIndex: "pageIndex",
      pageSize: "pageSize"
    },
    outputs: {
      pageIndexChange: "pageIndexChange"
    },
    features: [ɵɵNgOnChangesFeature],
    decls: 2,
    vars: 0,
    consts: [["containerTemplate", ""], ["nz-pagination-item", "", "type", "prev", 3, "click", "locale", "disabled", "direction", "itemRender"], [1, "ant-pagination-simple-pager"], ["size", "3", 3, "keydown.enter", "disabled", "value"], [1, "ant-pagination-slash"], ["nz-pagination-item", "", "type", "next", 3, "click", "locale", "disabled", "direction", "itemRender"]],
    template: function NzPaginationSimpleComponent_Template(rf, ctx) {
      if (rf & 1) {
        ɵɵtemplate(0, NzPaginationSimpleComponent_ng_template_0_Template, 8, 14, "ng-template", null, 0, ɵɵtemplateRefExtractor);
      }
    },
    dependencies: [NzPaginationItemComponent],
    encapsulation: 2,
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzPaginationSimpleComponent, [{
    type: Component,
    args: [{
      selector: "nz-pagination-simple",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    <ng-template #containerTemplate>
      <ul>
        <li
          nz-pagination-item
          [locale]="locale"
          [attr.title]="locale.prev_page"
          [disabled]="isFirstIndex"
          [direction]="dir"
          (click)="prePage()"
          type="prev"
          [itemRender]="itemRender"
        ></li>
        <li [attr.title]="pageIndex + '/' + lastIndex" class="ant-pagination-simple-pager">
          <input [disabled]="disabled" [value]="pageIndex" (keydown.enter)="jumpToPageViaInput($event)" size="3" />
          <span class="ant-pagination-slash">/</span>
          {{ lastIndex }}
        </li>
        <li
          nz-pagination-item
          [locale]="locale"
          [attr.title]="locale?.next_page"
          [disabled]="isLastIndex"
          [direction]="dir"
          (click)="nextPage()"
          type="next"
          [itemRender]="itemRender"
        ></li>
      </ul>
    </ng-template>
  `,
      imports: [NzPaginationItemComponent],
      host: {
        "[class.ant-pagination-rtl]": "dir === 'rtl'"
      }
    }]
  }], () => [], {
    template: [{
      type: ViewChild,
      args: ["containerTemplate", {
        static: true
      }]
    }],
    itemRender: [{
      type: Input
    }],
    disabled: [{
      type: Input
    }],
    locale: [{
      type: Input
    }],
    total: [{
      type: Input
    }],
    pageIndex: [{
      type: Input
    }],
    pageSize: [{
      type: Input
    }],
    pageIndexChange: [{
      type: Output
    }]
  });
})();
var NZ_CONFIG_MODULE_NAME2 = "pagination";
var NzPaginationComponent = (() => {
  let _nzSize_decorators;
  let _nzSize_initializers = [];
  let _nzSize_extraInitializers = [];
  let _nzPageSizeOptions_decorators;
  let _nzPageSizeOptions_initializers = [];
  let _nzPageSizeOptions_extraInitializers = [];
  let _nzShowSizeChanger_decorators;
  let _nzShowSizeChanger_initializers = [];
  let _nzShowSizeChanger_extraInitializers = [];
  let _nzShowQuickJumper_decorators;
  let _nzShowQuickJumper_initializers = [];
  let _nzShowQuickJumper_extraInitializers = [];
  let _nzSimple_decorators;
  let _nzSimple_initializers = [];
  let _nzSimple_extraInitializers = [];
  return class NzPaginationComponent2 {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
      _nzSize_decorators = [WithConfig()];
      _nzPageSizeOptions_decorators = [WithConfig()];
      _nzShowSizeChanger_decorators = [WithConfig()];
      _nzShowQuickJumper_decorators = [WithConfig()];
      _nzSimple_decorators = [WithConfig()];
      __esDecorate(null, null, _nzSize_decorators, {
        kind: "field",
        name: "nzSize",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzSize" in obj,
          get: (obj) => obj.nzSize,
          set: (obj, value) => {
            obj.nzSize = value;
          }
        },
        metadata: _metadata
      }, _nzSize_initializers, _nzSize_extraInitializers);
      __esDecorate(null, null, _nzPageSizeOptions_decorators, {
        kind: "field",
        name: "nzPageSizeOptions",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzPageSizeOptions" in obj,
          get: (obj) => obj.nzPageSizeOptions,
          set: (obj, value) => {
            obj.nzPageSizeOptions = value;
          }
        },
        metadata: _metadata
      }, _nzPageSizeOptions_initializers, _nzPageSizeOptions_extraInitializers);
      __esDecorate(null, null, _nzShowSizeChanger_decorators, {
        kind: "field",
        name: "nzShowSizeChanger",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzShowSizeChanger" in obj,
          get: (obj) => obj.nzShowSizeChanger,
          set: (obj, value) => {
            obj.nzShowSizeChanger = value;
          }
        },
        metadata: _metadata
      }, _nzShowSizeChanger_initializers, _nzShowSizeChanger_extraInitializers);
      __esDecorate(null, null, _nzShowQuickJumper_decorators, {
        kind: "field",
        name: "nzShowQuickJumper",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzShowQuickJumper" in obj,
          get: (obj) => obj.nzShowQuickJumper,
          set: (obj, value) => {
            obj.nzShowQuickJumper = value;
          }
        },
        metadata: _metadata
      }, _nzShowQuickJumper_initializers, _nzShowQuickJumper_extraInitializers);
      __esDecorate(null, null, _nzSimple_decorators, {
        kind: "field",
        name: "nzSimple",
        static: false,
        private: false,
        access: {
          has: (obj) => "nzSimple" in obj,
          get: (obj) => obj.nzSimple,
          set: (obj, value) => {
            obj.nzSimple = value;
          }
        },
        metadata: _metadata
      }, _nzSimple_initializers, _nzSimple_extraInitializers);
      if (_metadata) Object.defineProperty(this, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata
      });
    }
    _nzModuleName = NZ_CONFIG_MODULE_NAME2;
    i18n = inject(NzI18nService);
    cdr = inject(ChangeDetectorRef);
    breakpointService = inject(NzBreakpointService);
    nzConfigService = inject(NzConfigService);
    directionality = inject(Directionality);
    destroyRef = inject(DestroyRef);
    nzPageSizeChange = new EventEmitter();
    nzPageIndexChange = new EventEmitter();
    nzShowTotal = null;
    nzItemRender = null;
    nzSize = __runInitializers(this, _nzSize_initializers, "default");
    nzPageSizeOptions = (__runInitializers(this, _nzSize_extraInitializers), __runInitializers(this, _nzPageSizeOptions_initializers, [10, 20, 30, 40]));
    nzShowSizeChanger = (__runInitializers(this, _nzPageSizeOptions_extraInitializers), __runInitializers(this, _nzShowSizeChanger_initializers, false));
    nzShowQuickJumper = (__runInitializers(this, _nzShowSizeChanger_extraInitializers), __runInitializers(this, _nzShowQuickJumper_initializers, false));
    nzSimple = (__runInitializers(this, _nzShowQuickJumper_extraInitializers), __runInitializers(this, _nzSimple_initializers, false));
    nzDisabled = (__runInitializers(this, _nzSimple_extraInitializers), false);
    nzResponsive = false;
    nzHideOnSinglePage = false;
    nzTotal = 0;
    nzPageIndex = 1;
    nzPageSize = 10;
    nzAlign = input("start", ...ngDevMode ? [{
      debugName: "nzAlign"
    }] : []);
    showPagination = true;
    locale;
    size = "default";
    dir = "ltr";
    total$ = new ReplaySubject(1);
    validatePageIndex(value, lastIndex) {
      if (value > lastIndex) {
        return lastIndex;
      } else if (value < 1) {
        return 1;
      } else {
        return value;
      }
    }
    onPageIndexChange(index) {
      const lastIndex = this.getLastIndex(this.nzTotal, this.nzPageSize);
      const validIndex = this.validatePageIndex(index, lastIndex);
      if (validIndex !== this.nzPageIndex && !this.nzDisabled) {
        this.nzPageIndex = validIndex;
        this.nzPageIndexChange.emit(this.nzPageIndex);
      }
    }
    onPageSizeChange(size) {
      this.nzPageSize = size;
      this.nzPageSizeChange.emit(size);
      const lastIndex = this.getLastIndex(this.nzTotal, this.nzPageSize);
      if (this.nzPageIndex > lastIndex) {
        this.onPageIndexChange(lastIndex);
      }
    }
    onTotalChange(total) {
      const lastIndex = this.getLastIndex(total, this.nzPageSize);
      if (this.nzPageIndex > lastIndex) {
        Promise.resolve().then(() => {
          this.onPageIndexChange(lastIndex);
          this.cdr.markForCheck();
        });
      }
    }
    getLastIndex(total, pageSize) {
      return Math.ceil(total / pageSize);
    }
    ngOnInit() {
      this.i18n.localeChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.locale = this.i18n.getLocaleData("Pagination");
        this.cdr.markForCheck();
      });
      this.total$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((total) => {
        this.onTotalChange(total);
      });
      this.breakpointService.subscribe(gridResponsiveMap).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((bp) => {
        if (this.nzResponsive) {
          this.size = bp === NzBreakpointEnum.xs ? "small" : "default";
          this.cdr.markForCheck();
        }
      });
      this.directionality.change?.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((direction) => {
        this.dir = direction;
        this.cdr.detectChanges();
      });
      this.dir = this.directionality.value;
    }
    ngOnChanges(changes) {
      const {
        nzHideOnSinglePage,
        nzTotal,
        nzPageSize,
        nzSize
      } = changes;
      if (nzTotal) {
        this.total$.next(this.nzTotal);
      }
      if (nzHideOnSinglePage || nzTotal || nzPageSize) {
        this.showPagination = this.nzHideOnSinglePage && this.nzTotal > this.nzPageSize || this.nzTotal > 0 && !this.nzHideOnSinglePage;
      }
      if (nzSize) {
        this.size = nzSize.currentValue;
      }
    }
    static ɵfac = function NzPaginationComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || NzPaginationComponent2)();
    };
    static ɵcmp = ɵɵdefineComponent({
      type: NzPaginationComponent2,
      selectors: [["nz-pagination"]],
      hostAttrs: [1, "ant-pagination"],
      hostVars: 14,
      hostBindings: function NzPaginationComponent_HostBindings(rf, ctx) {
        if (rf & 2) {
          ɵɵclassProp("ant-pagination-simple", ctx.nzSimple)("ant-pagination-disabled", ctx.nzDisabled)("ant-pagination-mini", !ctx.nzSimple && ctx.size === "small")("ant-pagination-rtl", ctx.dir === "rtl")("ant-pagination-start", ctx.nzAlign() === "start")("ant-pagination-center", ctx.nzAlign() === "center")("ant-pagination-end", ctx.nzAlign() === "end");
        }
      },
      inputs: {
        nzShowTotal: "nzShowTotal",
        nzItemRender: "nzItemRender",
        nzSize: "nzSize",
        nzPageSizeOptions: "nzPageSizeOptions",
        nzShowSizeChanger: [2, "nzShowSizeChanger", "nzShowSizeChanger", booleanAttribute],
        nzShowQuickJumper: [2, "nzShowQuickJumper", "nzShowQuickJumper", booleanAttribute],
        nzSimple: [2, "nzSimple", "nzSimple", booleanAttribute],
        nzDisabled: [2, "nzDisabled", "nzDisabled", booleanAttribute],
        nzResponsive: [2, "nzResponsive", "nzResponsive", booleanAttribute],
        nzHideOnSinglePage: [2, "nzHideOnSinglePage", "nzHideOnSinglePage", booleanAttribute],
        nzTotal: [2, "nzTotal", "nzTotal", numberAttribute],
        nzPageIndex: [2, "nzPageIndex", "nzPageIndex", numberAttribute],
        nzPageSize: [2, "nzPageSize", "nzPageSize", numberAttribute],
        nzAlign: [1, "nzAlign"]
      },
      outputs: {
        nzPageSizeChange: "nzPageSizeChange",
        nzPageIndexChange: "nzPageIndexChange"
      },
      exportAs: ["nzPagination"],
      features: [ɵɵNgOnChangesFeature],
      decls: 5,
      vars: 18,
      consts: [["simplePagination", ""], ["defaultPagination", ""], [3, "pageIndexChange", "disabled", "itemRender", "locale", "pageSize", "total", "pageIndex"], [3, "pageIndexChange", "pageSizeChange", "nzSize", "itemRender", "showTotal", "disabled", "locale", "showSizeChanger", "showQuickJumper", "total", "pageIndex", "pageSize", "pageSizeOptions"], [3, "ngTemplateOutlet"]],
      template: function NzPaginationComponent_Template(rf, ctx) {
        if (rf & 1) {
          const _r1 = ɵɵgetCurrentView();
          ɵɵconditionalCreate(0, NzPaginationComponent_Conditional_0_Template, 2, 1);
          ɵɵelementStart(1, "nz-pagination-simple", 2, 0);
          ɵɵlistener("pageIndexChange", function NzPaginationComponent_Template_nz_pagination_simple_pageIndexChange_1_listener($event) {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onPageIndexChange($event));
          });
          ɵɵelementEnd();
          ɵɵelementStart(3, "nz-pagination-default", 3, 1);
          ɵɵlistener("pageIndexChange", function NzPaginationComponent_Template_nz_pagination_default_pageIndexChange_3_listener($event) {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onPageIndexChange($event));
          })("pageSizeChange", function NzPaginationComponent_Template_nz_pagination_default_pageSizeChange_3_listener($event) {
            ɵɵrestoreView(_r1);
            return ɵɵresetView(ctx.onPageSizeChange($event));
          });
          ɵɵelementEnd();
        }
        if (rf & 2) {
          ɵɵconditional(ctx.showPagination ? 0 : -1);
          ɵɵadvance();
          ɵɵproperty("disabled", ctx.nzDisabled)("itemRender", ctx.nzItemRender)("locale", ctx.locale)("pageSize", ctx.nzPageSize)("total", ctx.nzTotal)("pageIndex", ctx.nzPageIndex);
          ɵɵadvance(2);
          ɵɵproperty("nzSize", ctx.size)("itemRender", ctx.nzItemRender)("showTotal", ctx.nzShowTotal)("disabled", ctx.nzDisabled)("locale", ctx.locale)("showSizeChanger", ctx.nzShowSizeChanger)("showQuickJumper", ctx.nzShowQuickJumper)("total", ctx.nzTotal)("pageIndex", ctx.nzPageIndex)("pageSize", ctx.nzPageSize)("pageSizeOptions", ctx.nzPageSizeOptions);
        }
      },
      dependencies: [NgTemplateOutlet, NzPaginationSimpleComponent, NzPaginationDefaultComponent],
      encapsulation: 2,
      changeDetection: 0
    });
  };
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzPaginationComponent, [{
    type: Component,
    args: [{
      selector: "nz-pagination",
      exportAs: "nzPagination",
      encapsulation: ViewEncapsulation.None,
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    @if (showPagination) {
      @if (nzSimple) {
        <ng-template [ngTemplateOutlet]="simplePagination.template" />
      } @else {
        <ng-template [ngTemplateOutlet]="defaultPagination.template" />
      }
    }

    <nz-pagination-simple
      #simplePagination
      [disabled]="nzDisabled"
      [itemRender]="nzItemRender"
      [locale]="locale"
      [pageSize]="nzPageSize"
      [total]="nzTotal"
      [pageIndex]="nzPageIndex"
      (pageIndexChange)="onPageIndexChange($event)"
    />
    <nz-pagination-default
      #defaultPagination
      [nzSize]="size"
      [itemRender]="nzItemRender"
      [showTotal]="nzShowTotal"
      [disabled]="nzDisabled"
      [locale]="locale"
      [showSizeChanger]="nzShowSizeChanger"
      [showQuickJumper]="nzShowQuickJumper"
      [total]="nzTotal"
      [pageIndex]="nzPageIndex"
      [pageSize]="nzPageSize"
      [pageSizeOptions]="nzPageSizeOptions"
      (pageIndexChange)="onPageIndexChange($event)"
      (pageSizeChange)="onPageSizeChange($event)"
    />
  `,
      host: {
        class: "ant-pagination",
        "[class.ant-pagination-simple]": "nzSimple",
        "[class.ant-pagination-disabled]": "nzDisabled",
        "[class.ant-pagination-mini]": `!nzSimple && size === 'small'`,
        "[class.ant-pagination-rtl]": `dir === 'rtl'`,
        "[class.ant-pagination-start]": 'nzAlign() === "start"',
        "[class.ant-pagination-center]": 'nzAlign() === "center"',
        "[class.ant-pagination-end]": 'nzAlign() === "end"'
      },
      imports: [NgTemplateOutlet, NzPaginationSimpleComponent, NzPaginationDefaultComponent]
    }]
  }], null, {
    nzPageSizeChange: [{
      type: Output
    }],
    nzPageIndexChange: [{
      type: Output
    }],
    nzShowTotal: [{
      type: Input
    }],
    nzItemRender: [{
      type: Input
    }],
    nzSize: [{
      type: Input
    }],
    nzPageSizeOptions: [{
      type: Input
    }],
    nzShowSizeChanger: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzShowQuickJumper: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzSimple: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzDisabled: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzResponsive: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzHideOnSinglePage: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzTotal: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    nzPageIndex: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    nzPageSize: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    nzAlign: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "nzAlign",
        required: false
      }]
    }]
  });
})();
var NzPaginationModule = class _NzPaginationModule {
  static ɵfac = function NzPaginationModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzPaginationModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzPaginationModule,
    imports: [NzPaginationComponent, NzPaginationSimpleComponent, NzPaginationOptionsComponent, NzPaginationItemComponent, NzPaginationDefaultComponent],
    exports: [NzPaginationComponent]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [NzPaginationComponent, NzPaginationSimpleComponent, NzPaginationOptionsComponent, NzPaginationItemComponent, NzPaginationDefaultComponent]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzPaginationModule, [{
    type: NgModule,
    args: [{
      imports: [NzPaginationComponent, NzPaginationSimpleComponent, NzPaginationOptionsComponent, NzPaginationItemComponent, NzPaginationDefaultComponent],
      exports: [NzPaginationComponent]
    }]
  }], null, null);
})();
export {
  NzPaginationComponent,
  NzPaginationDefaultComponent,
  NzPaginationItemComponent,
  NzPaginationModule,
  NzPaginationOptionsComponent,
  NzPaginationSimpleComponent
};
//# sourceMappingURL=ng-zorro-antd_pagination.js.map
