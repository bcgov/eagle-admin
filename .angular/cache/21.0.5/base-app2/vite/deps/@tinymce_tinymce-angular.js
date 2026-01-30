import {
  FormsModule,
  NG_VALUE_ACCESSOR
} from "./chunk-UCCKLHI7.js";
import {
  CommonModule,
  isPlatformBrowser
} from "./chunk-CHRGCPVO.js";
import "./chunk-OM5OKXNY.js";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  NgModule,
  NgZone,
  Optional,
  Output,
  PLATFORM_ID,
  forwardRef,
  setClassMetadata,
  ɵɵInheritDefinitionFeature,
  ɵɵProvidersFeature,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject
} from "./chunk-3CH24XTA.js";
import {
  fromEvent
} from "./chunk-V37RSN4D.js";
import "./chunk-SR2LXFJL.js";
import {
  BehaviorSubject,
  Subject,
  filter,
  first,
  map,
  shareReplay,
  switchMap,
  takeUntil
} from "./chunk-VUVMRRXW.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-EIB7IA3J.js";

// node_modules/@tinymce/tinymce-angular/fesm2022/tinymce-tinymce-angular.mjs
var getTinymce = () => {
  const w = typeof window !== "undefined" ? window : void 0;
  return w && w.tinymce ? w.tinymce : null;
};
var Events = class _Events {
  onBeforePaste = new EventEmitter();
  onBlur = new EventEmitter();
  onClick = new EventEmitter();
  onCompositionEnd = new EventEmitter();
  onCompositionStart = new EventEmitter();
  onCompositionUpdate = new EventEmitter();
  onContextMenu = new EventEmitter();
  onCopy = new EventEmitter();
  onCut = new EventEmitter();
  onDblclick = new EventEmitter();
  onDrag = new EventEmitter();
  onDragDrop = new EventEmitter();
  onDragEnd = new EventEmitter();
  onDragGesture = new EventEmitter();
  onDragOver = new EventEmitter();
  onDrop = new EventEmitter();
  onFocus = new EventEmitter();
  onFocusIn = new EventEmitter();
  onFocusOut = new EventEmitter();
  onKeyDown = new EventEmitter();
  onKeyPress = new EventEmitter();
  onKeyUp = new EventEmitter();
  onMouseDown = new EventEmitter();
  onMouseEnter = new EventEmitter();
  onMouseLeave = new EventEmitter();
  onMouseMove = new EventEmitter();
  onMouseOut = new EventEmitter();
  onMouseOver = new EventEmitter();
  onMouseUp = new EventEmitter();
  onPaste = new EventEmitter();
  onSelectionChange = new EventEmitter();
  onActivate = new EventEmitter();
  onAddUndo = new EventEmitter();
  onBeforeAddUndo = new EventEmitter();
  onBeforeExecCommand = new EventEmitter();
  onBeforeGetContent = new EventEmitter();
  onBeforeRenderUI = new EventEmitter();
  onBeforeSetContent = new EventEmitter();
  onChange = new EventEmitter();
  onClearUndos = new EventEmitter();
  onDeactivate = new EventEmitter();
  onDirty = new EventEmitter();
  onExecCommand = new EventEmitter();
  onGetContent = new EventEmitter();
  onHide = new EventEmitter();
  onInit = new EventEmitter();
  onInput = new EventEmitter();
  onInitNgModel = new EventEmitter();
  onLoadContent = new EventEmitter();
  onNodeChange = new EventEmitter();
  onPostProcess = new EventEmitter();
  onPostRender = new EventEmitter();
  onPreInit = new EventEmitter();
  onPreProcess = new EventEmitter();
  onProgressState = new EventEmitter();
  onRedo = new EventEmitter();
  onRemove = new EventEmitter();
  onReset = new EventEmitter();
  onResizeEditor = new EventEmitter();
  onSaveContent = new EventEmitter();
  onSetAttrib = new EventEmitter();
  onObjectResizeStart = new EventEmitter();
  onObjectResized = new EventEmitter();
  onObjectSelected = new EventEmitter();
  onSetContent = new EventEmitter();
  onShow = new EventEmitter();
  onSubmit = new EventEmitter();
  onUndo = new EventEmitter();
  onVisualAid = new EventEmitter();
  static ɵfac = function Events_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _Events)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _Events,
    outputs: {
      onBeforePaste: "onBeforePaste",
      onBlur: "onBlur",
      onClick: "onClick",
      onCompositionEnd: "onCompositionEnd",
      onCompositionStart: "onCompositionStart",
      onCompositionUpdate: "onCompositionUpdate",
      onContextMenu: "onContextMenu",
      onCopy: "onCopy",
      onCut: "onCut",
      onDblclick: "onDblclick",
      onDrag: "onDrag",
      onDragDrop: "onDragDrop",
      onDragEnd: "onDragEnd",
      onDragGesture: "onDragGesture",
      onDragOver: "onDragOver",
      onDrop: "onDrop",
      onFocus: "onFocus",
      onFocusIn: "onFocusIn",
      onFocusOut: "onFocusOut",
      onKeyDown: "onKeyDown",
      onKeyPress: "onKeyPress",
      onKeyUp: "onKeyUp",
      onMouseDown: "onMouseDown",
      onMouseEnter: "onMouseEnter",
      onMouseLeave: "onMouseLeave",
      onMouseMove: "onMouseMove",
      onMouseOut: "onMouseOut",
      onMouseOver: "onMouseOver",
      onMouseUp: "onMouseUp",
      onPaste: "onPaste",
      onSelectionChange: "onSelectionChange",
      onActivate: "onActivate",
      onAddUndo: "onAddUndo",
      onBeforeAddUndo: "onBeforeAddUndo",
      onBeforeExecCommand: "onBeforeExecCommand",
      onBeforeGetContent: "onBeforeGetContent",
      onBeforeRenderUI: "onBeforeRenderUI",
      onBeforeSetContent: "onBeforeSetContent",
      onChange: "onChange",
      onClearUndos: "onClearUndos",
      onDeactivate: "onDeactivate",
      onDirty: "onDirty",
      onExecCommand: "onExecCommand",
      onGetContent: "onGetContent",
      onHide: "onHide",
      onInit: "onInit",
      onInput: "onInput",
      onInitNgModel: "onInitNgModel",
      onLoadContent: "onLoadContent",
      onNodeChange: "onNodeChange",
      onPostProcess: "onPostProcess",
      onPostRender: "onPostRender",
      onPreInit: "onPreInit",
      onPreProcess: "onPreProcess",
      onProgressState: "onProgressState",
      onRedo: "onRedo",
      onRemove: "onRemove",
      onReset: "onReset",
      onResizeEditor: "onResizeEditor",
      onSaveContent: "onSaveContent",
      onSetAttrib: "onSetAttrib",
      onObjectResizeStart: "onObjectResizeStart",
      onObjectResized: "onObjectResized",
      onObjectSelected: "onObjectSelected",
      onSetContent: "onSetContent",
      onShow: "onShow",
      onSubmit: "onSubmit",
      onUndo: "onUndo",
      onVisualAid: "onVisualAid"
    },
    standalone: false
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(Events, [{
    type: Directive
  }], null, {
    onBeforePaste: [{
      type: Output
    }],
    onBlur: [{
      type: Output
    }],
    onClick: [{
      type: Output
    }],
    onCompositionEnd: [{
      type: Output
    }],
    onCompositionStart: [{
      type: Output
    }],
    onCompositionUpdate: [{
      type: Output
    }],
    onContextMenu: [{
      type: Output
    }],
    onCopy: [{
      type: Output
    }],
    onCut: [{
      type: Output
    }],
    onDblclick: [{
      type: Output
    }],
    onDrag: [{
      type: Output
    }],
    onDragDrop: [{
      type: Output
    }],
    onDragEnd: [{
      type: Output
    }],
    onDragGesture: [{
      type: Output
    }],
    onDragOver: [{
      type: Output
    }],
    onDrop: [{
      type: Output
    }],
    onFocus: [{
      type: Output
    }],
    onFocusIn: [{
      type: Output
    }],
    onFocusOut: [{
      type: Output
    }],
    onKeyDown: [{
      type: Output
    }],
    onKeyPress: [{
      type: Output
    }],
    onKeyUp: [{
      type: Output
    }],
    onMouseDown: [{
      type: Output
    }],
    onMouseEnter: [{
      type: Output
    }],
    onMouseLeave: [{
      type: Output
    }],
    onMouseMove: [{
      type: Output
    }],
    onMouseOut: [{
      type: Output
    }],
    onMouseOver: [{
      type: Output
    }],
    onMouseUp: [{
      type: Output
    }],
    onPaste: [{
      type: Output
    }],
    onSelectionChange: [{
      type: Output
    }],
    onActivate: [{
      type: Output
    }],
    onAddUndo: [{
      type: Output
    }],
    onBeforeAddUndo: [{
      type: Output
    }],
    onBeforeExecCommand: [{
      type: Output
    }],
    onBeforeGetContent: [{
      type: Output
    }],
    onBeforeRenderUI: [{
      type: Output
    }],
    onBeforeSetContent: [{
      type: Output
    }],
    onChange: [{
      type: Output
    }],
    onClearUndos: [{
      type: Output
    }],
    onDeactivate: [{
      type: Output
    }],
    onDirty: [{
      type: Output
    }],
    onExecCommand: [{
      type: Output
    }],
    onGetContent: [{
      type: Output
    }],
    onHide: [{
      type: Output
    }],
    onInit: [{
      type: Output
    }],
    onInput: [{
      type: Output
    }],
    onInitNgModel: [{
      type: Output
    }],
    onLoadContent: [{
      type: Output
    }],
    onNodeChange: [{
      type: Output
    }],
    onPostProcess: [{
      type: Output
    }],
    onPostRender: [{
      type: Output
    }],
    onPreInit: [{
      type: Output
    }],
    onPreProcess: [{
      type: Output
    }],
    onProgressState: [{
      type: Output
    }],
    onRedo: [{
      type: Output
    }],
    onRemove: [{
      type: Output
    }],
    onReset: [{
      type: Output
    }],
    onResizeEditor: [{
      type: Output
    }],
    onSaveContent: [{
      type: Output
    }],
    onSetAttrib: [{
      type: Output
    }],
    onObjectResizeStart: [{
      type: Output
    }],
    onObjectResized: [{
      type: Output
    }],
    onObjectSelected: [{
      type: Output
    }],
    onSetContent: [{
      type: Output
    }],
    onShow: [{
      type: Output
    }],
    onSubmit: [{
      type: Output
    }],
    onUndo: [{
      type: Output
    }],
    onVisualAid: [{
      type: Output
    }]
  });
})();
var validEvents = ["onActivate", "onAddUndo", "onBeforeAddUndo", "onBeforeExecCommand", "onBeforeGetContent", "onBeforeRenderUI", "onBeforeSetContent", "onBeforePaste", "onBlur", "onChange", "onClearUndos", "onClick", "onCompositionEnd", "onCompositionStart", "onCompositionUpdate", "onContextMenu", "onCopy", "onCut", "onDblclick", "onDeactivate", "onDirty", "onDrag", "onDragDrop", "onDragEnd", "onDragGesture", "onDragOver", "onDrop", "onExecCommand", "onFocus", "onFocusIn", "onFocusOut", "onGetContent", "onHide", "onInit", "onInput", "onKeyDown", "onKeyPress", "onKeyUp", "onLoadContent", "onMouseDown", "onMouseEnter", "onMouseLeave", "onMouseMove", "onMouseOut", "onMouseOver", "onMouseUp", "onNodeChange", "onObjectResizeStart", "onObjectResized", "onObjectSelected", "onPaste", "onPostProcess", "onPostRender", "onPreProcess", "onProgressState", "onRedo", "onRemove", "onReset", "onResizeEditor", "onSaveContent", "onSelectionChange", "onSetAttrib", "onSetContent", "onShow", "onSubmit", "onUndo", "onVisualAid"];
var listenTinyMCEEvent = (editor, eventName, destroy$) => fromEvent(editor, eventName).pipe(takeUntil(destroy$));
var bindHandlers = (ctx, editor, destroy$) => {
  const allowedEvents = getValidEvents(ctx);
  allowedEvents.forEach((eventName) => {
    const eventEmitter = ctx[eventName];
    listenTinyMCEEvent(editor, eventName.substring(2), destroy$).subscribe((event) => {
      if (isObserved(eventEmitter)) {
        ctx.ngZone.run(() => eventEmitter.emit({
          event,
          editor
        }));
      }
    });
  });
};
var getValidEvents = (ctx) => {
  const ignoredEvents = parseStringProperty(ctx.ignoreEvents, []);
  const allowedEvents = parseStringProperty(ctx.allowedEvents, validEvents).filter((event) => validEvents.includes(event) && !ignoredEvents.includes(event));
  return allowedEvents;
};
var parseStringProperty = (property, defaultValue) => {
  if (typeof property === "string") {
    return property.split(",").map((value) => value.trim());
  }
  if (Array.isArray(property)) {
    return property;
  }
  return defaultValue;
};
var unique = 0;
var uuid = (prefix) => {
  const date = /* @__PURE__ */ new Date();
  const time = date.getTime();
  const random = Math.floor(Math.random() * 1e9);
  unique++;
  return prefix + "_" + random + unique + String(time);
};
var isTextarea = (element) => typeof element !== "undefined" && element.tagName.toLowerCase() === "textarea";
var normalizePluginArray = (plugins) => {
  if (typeof plugins === "undefined" || plugins === "") {
    return [];
  }
  return Array.isArray(plugins) ? plugins : plugins.split(" ");
};
var mergePlugins = (initPlugins, inputPlugins) => normalizePluginArray(initPlugins).concat(normalizePluginArray(inputPlugins));
var noop = () => {
};
var isNullOrUndefined = (value) => value === null || value === void 0;
var isObserved = (o) => (
  // RXJS is making the `observers` property internal in v8. So this is intended as a backwards compatible way of
  // checking if a subject has observers.
  o.observed || o.observers?.length > 0
);
var setMode = (editor, mode) => {
  if (typeof editor.mode?.set === "function") {
    editor.mode.set(mode);
  } else if ("setMode" in editor && typeof editor.setMode === "function") {
    editor.setMode(mode);
  }
};
var isDisabledOptionSupported = (editor) => editor.options && editor.options.isRegistered("disabled");
var firstEmission = () => (source) => source.pipe(first(), map(() => void 0));
var CreateScriptLoader = () => {
  const params$ = new BehaviorSubject(null);
  const loaded$ = params$.pipe(
    filter(Boolean),
    switchMap(([doc, url]) => {
      const scriptTag = doc.createElement("script");
      scriptTag.referrerPolicy = "origin";
      scriptTag.type = "application/javascript";
      scriptTag.src = url;
      doc.head.appendChild(scriptTag);
      return fromEvent(scriptTag, "load").pipe(firstEmission());
    }),
    // Caretaker note: `loaded$` is a multicast observable since it's piped with `shareReplay`,
    // so if there're multiple editor components simultaneously on the page, they'll subscribe to the internal
    // `ReplaySubject`. The script will be loaded only once, and `ReplaySubject` will cache the result.
    shareReplay({
      bufferSize: 1,
      refCount: true
    })
  );
  return {
    load: (...args) => {
      if (!params$.getValue()) {
        params$.next(args);
      }
      return loaded$;
    },
    reinitialize: () => {
      params$.next(null);
    }
  };
};
var ScriptLoader = CreateScriptLoader();
var TINYMCE_SCRIPT_SRC = new InjectionToken("TINYMCE_SCRIPT_SRC");
var EDITOR_COMPONENT_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => EditorComponent),
  multi: true
};
var EditorComponent = class _EditorComponent extends Events {
  cdRef;
  platformId;
  tinymceScriptSrc;
  cloudChannel = "8";
  apiKey = "no-api-key";
  licenseKey = "gpl";
  init;
  id = "";
  initialValue;
  outputFormat;
  inline;
  tagName;
  plugins;
  toolbar;
  modelEvents = "change input undo redo";
  allowedEvents;
  ignoreEvents;
  set readonly(val) {
    this._readonly = val;
    if (this._editor) {
      setMode(this._editor, val ? "readonly" : "design");
    }
  }
  get readonly() {
    return this._readonly;
  }
  set disabled(val) {
    this._disabled = val;
    if (this._editor) {
      if (isDisabledOptionSupported(this._editor)) {
        this._editor.options.set("disabled", val ?? false);
      } else {
        setMode(this._editor, val ? "readonly" : "design");
      }
    }
  }
  get disabled() {
    return this._disabled;
  }
  get editor() {
    return this._editor;
  }
  ngZone;
  _elementRef;
  _element;
  _disabled;
  _readonly;
  _editor;
  onTouchedCallback = noop;
  onChangeCallback;
  destroy$ = new Subject();
  constructor(elementRef, ngZone, cdRef, platformId, tinymceScriptSrc) {
    super();
    this.cdRef = cdRef;
    this.platformId = platformId;
    this.tinymceScriptSrc = tinymceScriptSrc;
    this._elementRef = elementRef;
    this.ngZone = ngZone;
  }
  writeValue(value) {
    if (this._editor && this._editor.initialized) {
      this._editor.setContent(isNullOrUndefined(value) ? "" : value);
    } else {
      this.initialValue = value === null ? void 0 : value;
    }
  }
  registerOnChange(fn) {
    this.onChangeCallback = fn;
  }
  registerOnTouched(fn) {
    this.onTouchedCallback = fn;
  }
  setDisabledState(isDisabled) {
    this.disabled = isDisabled;
  }
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.id = this.id || uuid("tiny-angular");
      this.inline = this.inline !== void 0 ? this.inline !== false : !!this.init?.inline;
      this.createElement();
      if (getTinymce() !== null) {
        this.initialise();
      } else if (this._element && this._element.ownerDocument) {
        ScriptLoader.load(this._element.ownerDocument, this.getScriptSrc()).pipe(takeUntil(this.destroy$)).subscribe(this.initialise);
      }
    }
  }
  ngOnDestroy() {
    this.destroy$.next();
    if (getTinymce() !== null) {
      getTinymce().remove(this._editor);
    }
  }
  createElement() {
    const tagName = typeof this.tagName === "string" ? this.tagName : "div";
    this._element = document.createElement(this.inline ? tagName : "textarea");
    if (this._element) {
      const existingElement = document.getElementById(this.id);
      if (existingElement && existingElement !== this._elementRef.nativeElement) {
        console.warn(`TinyMCE-Angular: an element with id [${this.id}] already exists. Editors with duplicate Id will not be able to mount`);
      }
      this._element.id = this.id;
      if (isTextarea(this._element)) {
        this._element.style.visibility = "hidden";
      }
      this._elementRef.nativeElement.appendChild(this._element);
    }
  }
  initialise = () => {
    const finalInit = __spreadProps(__spreadValues({}, this.init), {
      selector: void 0,
      target: this._element,
      inline: this.inline,
      disabled: this.disabled,
      readonly: this.readonly,
      license_key: this.licenseKey,
      plugins: mergePlugins(this.init && this.init.plugins, this.plugins),
      toolbar: this.toolbar || this.init && this.init.toolbar,
      setup: (editor) => {
        this._editor = editor;
        listenTinyMCEEvent(editor, "init", this.destroy$).subscribe(() => {
          this.initEditor(editor);
        });
        bindHandlers(this, editor, this.destroy$);
        if (this.init && typeof this.init.setup === "function") {
          this.init.setup(editor);
        }
        if (this.disabled === true) {
          if (isDisabledOptionSupported(editor)) {
            this._editor.options.set("disabled", this.disabled);
          } else {
            this._editor.mode.set("readonly");
          }
        }
      }
    });
    if (isTextarea(this._element)) {
      this._element.style.visibility = "";
    }
    this.ngZone.runOutsideAngular(() => {
      getTinymce().init(finalInit);
    });
  };
  getScriptSrc() {
    return isNullOrUndefined(this.tinymceScriptSrc) ? `https://cdn.tiny.cloud/1/${this.apiKey}/tinymce/${this.cloudChannel}/tinymce.min.js` : this.tinymceScriptSrc;
  }
  initEditor(editor) {
    listenTinyMCEEvent(editor, "blur", this.destroy$).subscribe(() => {
      this.cdRef.markForCheck();
      this.ngZone.run(() => this.onTouchedCallback());
    });
    listenTinyMCEEvent(editor, this.modelEvents, this.destroy$).subscribe(() => {
      this.cdRef.markForCheck();
      this.ngZone.run(() => this.emitOnChange(editor));
    });
    if (typeof this.initialValue === "string") {
      this.ngZone.run(() => {
        editor.setContent(this.initialValue);
        if (editor.getContent() !== this.initialValue) {
          this.emitOnChange(editor);
        }
        if (this.onInitNgModel !== void 0) {
          this.onInitNgModel.emit(editor);
        }
      });
    }
  }
  emitOnChange(editor) {
    if (this.onChangeCallback) {
      this.onChangeCallback(editor.getContent({
        format: this.outputFormat
      }));
    }
  }
  static ɵfac = function EditorComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _EditorComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(NgZone), ɵɵdirectiveInject(ChangeDetectorRef), ɵɵdirectiveInject(PLATFORM_ID), ɵɵdirectiveInject(TINYMCE_SCRIPT_SRC, 8));
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _EditorComponent,
    selectors: [["editor"]],
    inputs: {
      cloudChannel: "cloudChannel",
      apiKey: "apiKey",
      licenseKey: "licenseKey",
      init: "init",
      id: "id",
      initialValue: "initialValue",
      outputFormat: "outputFormat",
      inline: "inline",
      tagName: "tagName",
      plugins: "plugins",
      toolbar: "toolbar",
      modelEvents: "modelEvents",
      allowedEvents: "allowedEvents",
      ignoreEvents: "ignoreEvents",
      readonly: "readonly",
      disabled: "disabled"
    },
    features: [ɵɵProvidersFeature([EDITOR_COMPONENT_VALUE_ACCESSOR]), ɵɵInheritDefinitionFeature],
    decls: 0,
    vars: 0,
    template: function EditorComponent_Template(rf, ctx) {
    },
    dependencies: [CommonModule, FormsModule],
    styles: ["[_nghost-%COMP%]{display:block}"],
    changeDetection: 0
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(EditorComponent, [{
    type: Component,
    args: [{
      selector: "editor",
      template: "",
      providers: [EDITOR_COMPONENT_VALUE_ACCESSOR],
      standalone: true,
      imports: [CommonModule, FormsModule],
      changeDetection: ChangeDetectionStrategy.OnPush,
      styles: [":host{display:block}\n"]
    }]
  }], () => [{
    type: ElementRef
  }, {
    type: NgZone
  }, {
    type: ChangeDetectorRef
  }, {
    type: Object,
    decorators: [{
      type: Inject,
      args: [PLATFORM_ID]
    }]
  }, {
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [TINYMCE_SCRIPT_SRC]
    }]
  }], {
    cloudChannel: [{
      type: Input
    }],
    apiKey: [{
      type: Input
    }],
    licenseKey: [{
      type: Input
    }],
    init: [{
      type: Input
    }],
    id: [{
      type: Input
    }],
    initialValue: [{
      type: Input
    }],
    outputFormat: [{
      type: Input
    }],
    inline: [{
      type: Input
    }],
    tagName: [{
      type: Input
    }],
    plugins: [{
      type: Input
    }],
    toolbar: [{
      type: Input
    }],
    modelEvents: [{
      type: Input
    }],
    allowedEvents: [{
      type: Input
    }],
    ignoreEvents: [{
      type: Input
    }],
    readonly: [{
      type: Input
    }],
    disabled: [{
      type: Input
    }]
  });
})();
var EditorModule = class _EditorModule {
  static ɵfac = function EditorModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _EditorModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _EditorModule,
    imports: [EditorComponent],
    exports: [EditorComponent]
  });
  static ɵinj = ɵɵdefineInjector({
    imports: [EditorComponent]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(EditorModule, [{
    type: NgModule,
    args: [{
      imports: [EditorComponent],
      exports: [EditorComponent]
    }]
  }], null, null);
})();
export {
  EditorComponent,
  EditorModule,
  TINYMCE_SCRIPT_SRC
};
//# sourceMappingURL=@tinymce_tinymce-angular.js.map
