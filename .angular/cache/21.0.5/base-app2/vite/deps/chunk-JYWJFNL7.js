import {
  _defineProperty,
  canUseDom,
  isTemplateRef,
  updateCSS,
  warn,
  wrapIntoObservable
} from "./chunk-QE4RO34Y.js";
import {
  DomSanitizer
} from "./chunk-OIV3TWMU.js";
import {
  takeUntilDestroyed,
  toSignal
} from "./chunk-SVMEVFX5.js";
import {
  Directionality
} from "./chunk-L6WQNK65.js";
import {
  Platform
} from "./chunk-RSR3AMJM.js";
import {
  HttpBackend,
  HttpClient
} from "./chunk-A6CTEFQY.js";
import {
  NgTemplateOutlet,
  isPlatformBrowser
} from "./chunk-CHRGCPVO.js";
import {
  CSP_NONCE,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  DOCUMENT,
  DestroyRef,
  Directive,
  ElementRef,
  Inject,
  Injectable,
  InjectionToken,
  Input,
  NgModule,
  NgZone,
  Optional,
  PLATFORM_ID,
  PendingTasks,
  Renderer2,
  RendererFactory2,
  SecurityContext,
  TemplateRef,
  ViewContainerRef,
  afterNextRender,
  assertInInjectionContext,
  booleanAttribute,
  computed,
  inject,
  input,
  isDevMode,
  makeEnvironmentProviders,
  numberAttribute,
  setClassMetadata,
  signal,
  ɵɵInheritDefinitionFeature,
  ɵɵNgOnChangesFeature,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵattribute,
  ɵɵclassMap,
  ɵɵclassProp,
  ɵɵconditional,
  ɵɵconditionalCreate,
  ɵɵcontentQuery,
  ɵɵdefineComponent,
  ɵɵdefineDirective,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵelementContainer,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵinject,
  ɵɵloadQuery,
  ɵɵnextContext,
  ɵɵprojection,
  ɵɵprojectionDef,
  ɵɵproperty,
  ɵɵpureFunction1,
  ɵɵqueryRefresh,
  ɵɵrepeater,
  ɵɵrepeaterCreate,
  ɵɵrepeaterTrackByIdentity,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate
} from "./chunk-3CH24XTA.js";
import {
  animationFrameScheduler,
  asapScheduler
} from "./chunk-V37RSN4D.js";
import {
  Observable,
  Subject,
  __esDecorate,
  __runInitializers,
  catchError,
  debounceTime,
  filter,
  finalize,
  map,
  of,
  share,
  take,
  tap
} from "./chunk-VUVMRRXW.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-EIB7IA3J.js";

// node_modules/ng-zorro-antd/node_modules/@ctrl/tinycolor/dist/module/util.js
function bound01(n, max) {
  if (isOnePointZero(n)) {
    n = "100%";
  }
  var isPercent = isPercentage(n);
  n = max === 360 ? n : Math.min(max, Math.max(0, parseFloat(n)));
  if (isPercent) {
    n = parseInt(String(n * max), 10) / 100;
  }
  if (Math.abs(n - max) < 1e-6) {
    return 1;
  }
  if (max === 360) {
    n = (n < 0 ? n % max + max : n % max) / parseFloat(String(max));
  } else {
    n = n % max / parseFloat(String(max));
  }
  return n;
}
function clamp01(val) {
  return Math.min(1, Math.max(0, val));
}
function isOnePointZero(n) {
  return typeof n === "string" && n.indexOf(".") !== -1 && parseFloat(n) === 1;
}
function isPercentage(n) {
  return typeof n === "string" && n.indexOf("%") !== -1;
}
function boundAlpha(a) {
  a = parseFloat(a);
  if (isNaN(a) || a < 0 || a > 1) {
    a = 1;
  }
  return a;
}
function convertToPercentage(n) {
  if (n <= 1) {
    return "".concat(Number(n) * 100, "%");
  }
  return n;
}
function pad2(c) {
  return c.length === 1 ? "0" + c : String(c);
}

// node_modules/ng-zorro-antd/node_modules/@ctrl/tinycolor/dist/module/conversion.js
function rgbToRgb(r, g, b) {
  return {
    r: bound01(r, 255) * 255,
    g: bound01(g, 255) * 255,
    b: bound01(b, 255) * 255
  };
}
function rgbToHsl(r, g, b) {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h = 0;
  var s = 0;
  var l = (max + min) / 2;
  if (max === min) {
    s = 0;
    h = 0;
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return { h, s, l };
}
function hue2rgb(p, q, t) {
  if (t < 0) {
    t += 1;
  }
  if (t > 1) {
    t -= 1;
  }
  if (t < 1 / 6) {
    return p + (q - p) * (6 * t);
  }
  if (t < 1 / 2) {
    return q;
  }
  if (t < 2 / 3) {
    return p + (q - p) * (2 / 3 - t) * 6;
  }
  return p;
}
function hslToRgb(h, s, l) {
  var r;
  var g;
  var b;
  h = bound01(h, 360);
  s = bound01(s, 100);
  l = bound01(l, 100);
  if (s === 0) {
    g = l;
    b = l;
    r = l;
  } else {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}
function rgbToHsv(r, g, b) {
  r = bound01(r, 255);
  g = bound01(g, 255);
  b = bound01(b, 255);
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h = 0;
  var v = max;
  var d = max - min;
  var s = max === 0 ? 0 : d / max;
  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        break;
    }
    h /= 6;
  }
  return { h, s, v };
}
function hsvToRgb(h, s, v) {
  h = bound01(h, 360) * 6;
  s = bound01(s, 100);
  v = bound01(v, 100);
  var i = Math.floor(h);
  var f = h - i;
  var p = v * (1 - s);
  var q = v * (1 - f * s);
  var t = v * (1 - (1 - f) * s);
  var mod = i % 6;
  var r = [v, q, p, p, t, v][mod];
  var g = [t, v, v, q, p, p][mod];
  var b = [p, p, t, v, v, q][mod];
  return { r: r * 255, g: g * 255, b: b * 255 };
}
function rgbToHex(r, g, b, allow3Char) {
  var hex = [
    pad2(Math.round(r).toString(16)),
    pad2(Math.round(g).toString(16)),
    pad2(Math.round(b).toString(16))
  ];
  if (allow3Char && hex[0].startsWith(hex[0].charAt(1)) && hex[1].startsWith(hex[1].charAt(1)) && hex[2].startsWith(hex[2].charAt(1))) {
    return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);
  }
  return hex.join("");
}
function rgbaToHex(r, g, b, a, allow4Char) {
  var hex = [
    pad2(Math.round(r).toString(16)),
    pad2(Math.round(g).toString(16)),
    pad2(Math.round(b).toString(16)),
    pad2(convertDecimalToHex(a))
  ];
  if (allow4Char && hex[0].startsWith(hex[0].charAt(1)) && hex[1].startsWith(hex[1].charAt(1)) && hex[2].startsWith(hex[2].charAt(1)) && hex[3].startsWith(hex[3].charAt(1))) {
    return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
  }
  return hex.join("");
}
function convertDecimalToHex(d) {
  return Math.round(parseFloat(d) * 255).toString(16);
}
function convertHexToDecimal(h) {
  return parseIntFromHex(h) / 255;
}
function parseIntFromHex(val) {
  return parseInt(val, 16);
}
function numberInputToObject(color) {
  return {
    r: color >> 16,
    g: (color & 65280) >> 8,
    b: color & 255
  };
}

// node_modules/ng-zorro-antd/node_modules/@ctrl/tinycolor/dist/module/css-color-names.js
var names = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgreen: "#006400",
  darkgrey: "#a9a9a9",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  goldenrod: "#daa520",
  gold: "#ffd700",
  gray: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  grey: "#808080",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavenderblush: "#fff0f5",
  lavender: "#e6e6fa",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgreen: "#90ee90",
  lightgrey: "#d3d3d3",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370db",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#db7093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  rebeccapurple: "#663399",
  red: "#ff0000",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32"
};

// node_modules/ng-zorro-antd/node_modules/@ctrl/tinycolor/dist/module/format-input.js
function inputToRGB(color) {
  var rgb = { r: 0, g: 0, b: 0 };
  var a = 1;
  var s = null;
  var v = null;
  var l = null;
  var ok = false;
  var format = false;
  if (typeof color === "string") {
    color = stringInputToObject(color);
  }
  if (typeof color === "object") {
    if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b)) {
      rgb = rgbToRgb(color.r, color.g, color.b);
      ok = true;
      format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
    } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v)) {
      s = convertToPercentage(color.s);
      v = convertToPercentage(color.v);
      rgb = hsvToRgb(color.h, s, v);
      ok = true;
      format = "hsv";
    } else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l)) {
      s = convertToPercentage(color.s);
      l = convertToPercentage(color.l);
      rgb = hslToRgb(color.h, s, l);
      ok = true;
      format = "hsl";
    }
    if (Object.prototype.hasOwnProperty.call(color, "a")) {
      a = color.a;
    }
  }
  a = boundAlpha(a);
  return {
    ok,
    format: color.format || format,
    r: Math.min(255, Math.max(rgb.r, 0)),
    g: Math.min(255, Math.max(rgb.g, 0)),
    b: Math.min(255, Math.max(rgb.b, 0)),
    a
  };
}
var CSS_INTEGER = "[-\\+]?\\d+%?";
var CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?";
var CSS_UNIT = "(?:".concat(CSS_NUMBER, ")|(?:").concat(CSS_INTEGER, ")");
var PERMISSIVE_MATCH3 = "[\\s|\\(]+(".concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")\\s*\\)?");
var PERMISSIVE_MATCH4 = "[\\s|\\(]+(".concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")[,|\\s]+(").concat(CSS_UNIT, ")\\s*\\)?");
var matchers = {
  CSS_UNIT: new RegExp(CSS_UNIT),
  rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
  rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
  hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
  hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
  hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
  hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
  hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
  hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
  hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
  hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
};
function stringInputToObject(color) {
  color = color.trim().toLowerCase();
  if (color.length === 0) {
    return false;
  }
  var named = false;
  if (names[color]) {
    color = names[color];
    named = true;
  } else if (color === "transparent") {
    return { r: 0, g: 0, b: 0, a: 0, format: "name" };
  }
  var match = matchers.rgb.exec(color);
  if (match) {
    return { r: match[1], g: match[2], b: match[3] };
  }
  match = matchers.rgba.exec(color);
  if (match) {
    return { r: match[1], g: match[2], b: match[3], a: match[4] };
  }
  match = matchers.hsl.exec(color);
  if (match) {
    return { h: match[1], s: match[2], l: match[3] };
  }
  match = matchers.hsla.exec(color);
  if (match) {
    return { h: match[1], s: match[2], l: match[3], a: match[4] };
  }
  match = matchers.hsv.exec(color);
  if (match) {
    return { h: match[1], s: match[2], v: match[3] };
  }
  match = matchers.hsva.exec(color);
  if (match) {
    return { h: match[1], s: match[2], v: match[3], a: match[4] };
  }
  match = matchers.hex8.exec(color);
  if (match) {
    return {
      r: parseIntFromHex(match[1]),
      g: parseIntFromHex(match[2]),
      b: parseIntFromHex(match[3]),
      a: convertHexToDecimal(match[4]),
      format: named ? "name" : "hex8"
    };
  }
  match = matchers.hex6.exec(color);
  if (match) {
    return {
      r: parseIntFromHex(match[1]),
      g: parseIntFromHex(match[2]),
      b: parseIntFromHex(match[3]),
      format: named ? "name" : "hex"
    };
  }
  match = matchers.hex4.exec(color);
  if (match) {
    return {
      r: parseIntFromHex(match[1] + match[1]),
      g: parseIntFromHex(match[2] + match[2]),
      b: parseIntFromHex(match[3] + match[3]),
      a: convertHexToDecimal(match[4] + match[4]),
      format: named ? "name" : "hex8"
    };
  }
  match = matchers.hex3.exec(color);
  if (match) {
    return {
      r: parseIntFromHex(match[1] + match[1]),
      g: parseIntFromHex(match[2] + match[2]),
      b: parseIntFromHex(match[3] + match[3]),
      format: named ? "name" : "hex"
    };
  }
  return false;
}
function isValidCSSUnit(color) {
  return Boolean(matchers.CSS_UNIT.exec(String(color)));
}

// node_modules/ng-zorro-antd/node_modules/@ctrl/tinycolor/dist/module/index.js
var TinyColor = (
  /** @class */
  (function() {
    function TinyColor2(color, opts) {
      if (color === void 0) {
        color = "";
      }
      if (opts === void 0) {
        opts = {};
      }
      var _a;
      if (color instanceof TinyColor2) {
        return color;
      }
      if (typeof color === "number") {
        color = numberInputToObject(color);
      }
      this.originalInput = color;
      var rgb = inputToRGB(color);
      this.originalInput = color;
      this.r = rgb.r;
      this.g = rgb.g;
      this.b = rgb.b;
      this.a = rgb.a;
      this.roundA = Math.round(100 * this.a) / 100;
      this.format = (_a = opts.format) !== null && _a !== void 0 ? _a : rgb.format;
      this.gradientType = opts.gradientType;
      if (this.r < 1) {
        this.r = Math.round(this.r);
      }
      if (this.g < 1) {
        this.g = Math.round(this.g);
      }
      if (this.b < 1) {
        this.b = Math.round(this.b);
      }
      this.isValid = rgb.ok;
    }
    TinyColor2.prototype.isDark = function() {
      return this.getBrightness() < 128;
    };
    TinyColor2.prototype.isLight = function() {
      return !this.isDark();
    };
    TinyColor2.prototype.getBrightness = function() {
      var rgb = this.toRgb();
      return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1e3;
    };
    TinyColor2.prototype.getLuminance = function() {
      var rgb = this.toRgb();
      var R;
      var G;
      var B;
      var RsRGB = rgb.r / 255;
      var GsRGB = rgb.g / 255;
      var BsRGB = rgb.b / 255;
      if (RsRGB <= 0.03928) {
        R = RsRGB / 12.92;
      } else {
        R = Math.pow((RsRGB + 0.055) / 1.055, 2.4);
      }
      if (GsRGB <= 0.03928) {
        G = GsRGB / 12.92;
      } else {
        G = Math.pow((GsRGB + 0.055) / 1.055, 2.4);
      }
      if (BsRGB <= 0.03928) {
        B = BsRGB / 12.92;
      } else {
        B = Math.pow((BsRGB + 0.055) / 1.055, 2.4);
      }
      return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };
    TinyColor2.prototype.getAlpha = function() {
      return this.a;
    };
    TinyColor2.prototype.setAlpha = function(alpha) {
      this.a = boundAlpha(alpha);
      this.roundA = Math.round(100 * this.a) / 100;
      return this;
    };
    TinyColor2.prototype.isMonochrome = function() {
      var s = this.toHsl().s;
      return s === 0;
    };
    TinyColor2.prototype.toHsv = function() {
      var hsv = rgbToHsv(this.r, this.g, this.b);
      return { h: hsv.h * 360, s: hsv.s, v: hsv.v, a: this.a };
    };
    TinyColor2.prototype.toHsvString = function() {
      var hsv = rgbToHsv(this.r, this.g, this.b);
      var h = Math.round(hsv.h * 360);
      var s = Math.round(hsv.s * 100);
      var v = Math.round(hsv.v * 100);
      return this.a === 1 ? "hsv(".concat(h, ", ").concat(s, "%, ").concat(v, "%)") : "hsva(".concat(h, ", ").concat(s, "%, ").concat(v, "%, ").concat(this.roundA, ")");
    };
    TinyColor2.prototype.toHsl = function() {
      var hsl = rgbToHsl(this.r, this.g, this.b);
      return { h: hsl.h * 360, s: hsl.s, l: hsl.l, a: this.a };
    };
    TinyColor2.prototype.toHslString = function() {
      var hsl = rgbToHsl(this.r, this.g, this.b);
      var h = Math.round(hsl.h * 360);
      var s = Math.round(hsl.s * 100);
      var l = Math.round(hsl.l * 100);
      return this.a === 1 ? "hsl(".concat(h, ", ").concat(s, "%, ").concat(l, "%)") : "hsla(".concat(h, ", ").concat(s, "%, ").concat(l, "%, ").concat(this.roundA, ")");
    };
    TinyColor2.prototype.toHex = function(allow3Char) {
      if (allow3Char === void 0) {
        allow3Char = false;
      }
      return rgbToHex(this.r, this.g, this.b, allow3Char);
    };
    TinyColor2.prototype.toHexString = function(allow3Char) {
      if (allow3Char === void 0) {
        allow3Char = false;
      }
      return "#" + this.toHex(allow3Char);
    };
    TinyColor2.prototype.toHex8 = function(allow4Char) {
      if (allow4Char === void 0) {
        allow4Char = false;
      }
      return rgbaToHex(this.r, this.g, this.b, this.a, allow4Char);
    };
    TinyColor2.prototype.toHex8String = function(allow4Char) {
      if (allow4Char === void 0) {
        allow4Char = false;
      }
      return "#" + this.toHex8(allow4Char);
    };
    TinyColor2.prototype.toHexShortString = function(allowShortChar) {
      if (allowShortChar === void 0) {
        allowShortChar = false;
      }
      return this.a === 1 ? this.toHexString(allowShortChar) : this.toHex8String(allowShortChar);
    };
    TinyColor2.prototype.toRgb = function() {
      return {
        r: Math.round(this.r),
        g: Math.round(this.g),
        b: Math.round(this.b),
        a: this.a
      };
    };
    TinyColor2.prototype.toRgbString = function() {
      var r = Math.round(this.r);
      var g = Math.round(this.g);
      var b = Math.round(this.b);
      return this.a === 1 ? "rgb(".concat(r, ", ").concat(g, ", ").concat(b, ")") : "rgba(".concat(r, ", ").concat(g, ", ").concat(b, ", ").concat(this.roundA, ")");
    };
    TinyColor2.prototype.toPercentageRgb = function() {
      var fmt = function(x) {
        return "".concat(Math.round(bound01(x, 255) * 100), "%");
      };
      return {
        r: fmt(this.r),
        g: fmt(this.g),
        b: fmt(this.b),
        a: this.a
      };
    };
    TinyColor2.prototype.toPercentageRgbString = function() {
      var rnd = function(x) {
        return Math.round(bound01(x, 255) * 100);
      };
      return this.a === 1 ? "rgb(".concat(rnd(this.r), "%, ").concat(rnd(this.g), "%, ").concat(rnd(this.b), "%)") : "rgba(".concat(rnd(this.r), "%, ").concat(rnd(this.g), "%, ").concat(rnd(this.b), "%, ").concat(this.roundA, ")");
    };
    TinyColor2.prototype.toName = function() {
      if (this.a === 0) {
        return "transparent";
      }
      if (this.a < 1) {
        return false;
      }
      var hex = "#" + rgbToHex(this.r, this.g, this.b, false);
      for (var _i = 0, _a = Object.entries(names); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (hex === value) {
          return key;
        }
      }
      return false;
    };
    TinyColor2.prototype.toString = function(format) {
      var formatSet = Boolean(format);
      format = format !== null && format !== void 0 ? format : this.format;
      var formattedString = false;
      var hasAlpha = this.a < 1 && this.a >= 0;
      var needsAlphaFormat = !formatSet && hasAlpha && (format.startsWith("hex") || format === "name");
      if (needsAlphaFormat) {
        if (format === "name" && this.a === 0) {
          return this.toName();
        }
        return this.toRgbString();
      }
      if (format === "rgb") {
        formattedString = this.toRgbString();
      }
      if (format === "prgb") {
        formattedString = this.toPercentageRgbString();
      }
      if (format === "hex" || format === "hex6") {
        formattedString = this.toHexString();
      }
      if (format === "hex3") {
        formattedString = this.toHexString(true);
      }
      if (format === "hex4") {
        formattedString = this.toHex8String(true);
      }
      if (format === "hex8") {
        formattedString = this.toHex8String();
      }
      if (format === "name") {
        formattedString = this.toName();
      }
      if (format === "hsl") {
        formattedString = this.toHslString();
      }
      if (format === "hsv") {
        formattedString = this.toHsvString();
      }
      return formattedString || this.toHexString();
    };
    TinyColor2.prototype.toNumber = function() {
      return (Math.round(this.r) << 16) + (Math.round(this.g) << 8) + Math.round(this.b);
    };
    TinyColor2.prototype.clone = function() {
      return new TinyColor2(this.toString());
    };
    TinyColor2.prototype.lighten = function(amount) {
      if (amount === void 0) {
        amount = 10;
      }
      var hsl = this.toHsl();
      hsl.l += amount / 100;
      hsl.l = clamp01(hsl.l);
      return new TinyColor2(hsl);
    };
    TinyColor2.prototype.brighten = function(amount) {
      if (amount === void 0) {
        amount = 10;
      }
      var rgb = this.toRgb();
      rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * -(amount / 100))));
      rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * -(amount / 100))));
      rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * -(amount / 100))));
      return new TinyColor2(rgb);
    };
    TinyColor2.prototype.darken = function(amount) {
      if (amount === void 0) {
        amount = 10;
      }
      var hsl = this.toHsl();
      hsl.l -= amount / 100;
      hsl.l = clamp01(hsl.l);
      return new TinyColor2(hsl);
    };
    TinyColor2.prototype.tint = function(amount) {
      if (amount === void 0) {
        amount = 10;
      }
      return this.mix("white", amount);
    };
    TinyColor2.prototype.shade = function(amount) {
      if (amount === void 0) {
        amount = 10;
      }
      return this.mix("black", amount);
    };
    TinyColor2.prototype.desaturate = function(amount) {
      if (amount === void 0) {
        amount = 10;
      }
      var hsl = this.toHsl();
      hsl.s -= amount / 100;
      hsl.s = clamp01(hsl.s);
      return new TinyColor2(hsl);
    };
    TinyColor2.prototype.saturate = function(amount) {
      if (amount === void 0) {
        amount = 10;
      }
      var hsl = this.toHsl();
      hsl.s += amount / 100;
      hsl.s = clamp01(hsl.s);
      return new TinyColor2(hsl);
    };
    TinyColor2.prototype.greyscale = function() {
      return this.desaturate(100);
    };
    TinyColor2.prototype.spin = function(amount) {
      var hsl = this.toHsl();
      var hue = (hsl.h + amount) % 360;
      hsl.h = hue < 0 ? 360 + hue : hue;
      return new TinyColor2(hsl);
    };
    TinyColor2.prototype.mix = function(color, amount) {
      if (amount === void 0) {
        amount = 50;
      }
      var rgb1 = this.toRgb();
      var rgb2 = new TinyColor2(color).toRgb();
      var p = amount / 100;
      var rgba = {
        r: (rgb2.r - rgb1.r) * p + rgb1.r,
        g: (rgb2.g - rgb1.g) * p + rgb1.g,
        b: (rgb2.b - rgb1.b) * p + rgb1.b,
        a: (rgb2.a - rgb1.a) * p + rgb1.a
      };
      return new TinyColor2(rgba);
    };
    TinyColor2.prototype.analogous = function(results, slices) {
      if (results === void 0) {
        results = 6;
      }
      if (slices === void 0) {
        slices = 30;
      }
      var hsl = this.toHsl();
      var part = 360 / slices;
      var ret = [this];
      for (hsl.h = (hsl.h - (part * results >> 1) + 720) % 360; --results; ) {
        hsl.h = (hsl.h + part) % 360;
        ret.push(new TinyColor2(hsl));
      }
      return ret;
    };
    TinyColor2.prototype.complement = function() {
      var hsl = this.toHsl();
      hsl.h = (hsl.h + 180) % 360;
      return new TinyColor2(hsl);
    };
    TinyColor2.prototype.monochromatic = function(results) {
      if (results === void 0) {
        results = 6;
      }
      var hsv = this.toHsv();
      var h = hsv.h;
      var s = hsv.s;
      var v = hsv.v;
      var res = [];
      var modification = 1 / results;
      while (results--) {
        res.push(new TinyColor2({ h, s, v }));
        v = (v + modification) % 1;
      }
      return res;
    };
    TinyColor2.prototype.splitcomplement = function() {
      var hsl = this.toHsl();
      var h = hsl.h;
      return [
        this,
        new TinyColor2({ h: (h + 72) % 360, s: hsl.s, l: hsl.l }),
        new TinyColor2({ h: (h + 216) % 360, s: hsl.s, l: hsl.l })
      ];
    };
    TinyColor2.prototype.onBackground = function(background) {
      var fg = this.toRgb();
      var bg = new TinyColor2(background).toRgb();
      var alpha = fg.a + bg.a * (1 - fg.a);
      return new TinyColor2({
        r: (fg.r * fg.a + bg.r * bg.a * (1 - fg.a)) / alpha,
        g: (fg.g * fg.a + bg.g * bg.a * (1 - fg.a)) / alpha,
        b: (fg.b * fg.a + bg.b * bg.a * (1 - fg.a)) / alpha,
        a: alpha
      });
    };
    TinyColor2.prototype.triad = function() {
      return this.polyad(3);
    };
    TinyColor2.prototype.tetrad = function() {
      return this.polyad(4);
    };
    TinyColor2.prototype.polyad = function(n) {
      var hsl = this.toHsl();
      var h = hsl.h;
      var result = [this];
      var increment = 360 / n;
      for (var i = 1; i < n; i++) {
        result.push(new TinyColor2({ h: (h + i * increment) % 360, s: hsl.s, l: hsl.l }));
      }
      return result;
    };
    TinyColor2.prototype.equals = function(color) {
      return this.toRgbString() === new TinyColor2(color).toRgbString();
    };
    return TinyColor2;
  })()
);

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-color.mjs
var hueStep = 2;
var saturationStep = 0.16;
var saturationStep2 = 0.05;
var brightnessStep1 = 0.05;
var brightnessStep2 = 0.15;
var lightColorCount = 5;
var darkColorCount = 4;
var darkColorMap = [
  { index: 7, opacity: 0.15 },
  { index: 6, opacity: 0.25 },
  { index: 5, opacity: 0.3 },
  { index: 5, opacity: 0.45 },
  { index: 5, opacity: 0.65 },
  { index: 5, opacity: 0.85 },
  { index: 4, opacity: 0.9 },
  { index: 3, opacity: 0.95 },
  { index: 2, opacity: 0.97 },
  { index: 1, opacity: 0.98 }
];
function toHsv({ r, g, b }) {
  const hsv = rgbToHsv(r, g, b);
  return { h: hsv.h * 360, s: hsv.s, v: hsv.v };
}
function toHex({ r, g, b }) {
  return `#${rgbToHex(r, g, b, false)}`;
}
function mix(rgb1, rgb2, amount) {
  const p = amount / 100;
  const rgb = {
    r: (rgb2.r - rgb1.r) * p + rgb1.r,
    g: (rgb2.g - rgb1.g) * p + rgb1.g,
    b: (rgb2.b - rgb1.b) * p + rgb1.b
  };
  return rgb;
}
function getHue(hsv, i, light) {
  let hue;
  if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
    hue = light ? Math.round(hsv.h) - hueStep * i : Math.round(hsv.h) + hueStep * i;
  } else {
    hue = light ? Math.round(hsv.h) + hueStep * i : Math.round(hsv.h) - hueStep * i;
  }
  if (hue < 0) {
    hue += 360;
  } else if (hue >= 360) {
    hue -= 360;
  }
  return hue;
}
function getSaturation(hsv, i, light) {
  if (hsv.h === 0 && hsv.s === 0) {
    return hsv.s;
  }
  let saturation;
  if (light) {
    saturation = hsv.s - saturationStep * i;
  } else if (i === darkColorCount) {
    saturation = hsv.s + saturationStep;
  } else {
    saturation = hsv.s + saturationStep2 * i;
  }
  if (saturation > 1) {
    saturation = 1;
  }
  if (light && i === lightColorCount && saturation > 0.1) {
    saturation = 0.1;
  }
  if (saturation < 0.06) {
    saturation = 0.06;
  }
  return Number(saturation.toFixed(2));
}
function getValue(hsv, i, light) {
  let value;
  if (light) {
    value = hsv.v + brightnessStep1 * i;
  } else {
    value = hsv.v - brightnessStep2 * i;
  }
  if (value > 1) {
    value = 1;
  }
  return Number(value.toFixed(2));
}
function generate(color, opts = {}) {
  const patterns = [];
  const pColor = inputToRGB(color);
  for (let i = lightColorCount; i > 0; i -= 1) {
    const hsv = toHsv(pColor);
    const colorString = toHex(inputToRGB({
      h: getHue(hsv, i, true),
      s: getSaturation(hsv, i, true),
      v: getValue(hsv, i, true)
    }));
    patterns.push(colorString);
  }
  patterns.push(toHex(pColor));
  for (let i = 1; i <= darkColorCount; i += 1) {
    const hsv = toHsv(pColor);
    const colorString = toHex(inputToRGB({
      h: getHue(hsv, i),
      s: getSaturation(hsv, i),
      v: getValue(hsv, i)
    }));
    patterns.push(colorString);
  }
  if (opts.theme === "dark") {
    return darkColorMap.map(({ index, opacity }) => {
      const darkColorString = toHex(mix(inputToRGB(opts.backgroundColor || "#141414"), inputToRGB(patterns[index]), opacity * 100));
      return darkColorString;
    });
  }
  return patterns;
}

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-config.mjs
var NZ_CONFIG = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "nz-config" : "");
var dynamicStyleMark = `-ant-${Date.now()}-${Math.random()}`;
function getStyle(globalPrefixCls, theme) {
  const variables = {};
  const formatColor = (color, updater) => {
    let clone = color.clone();
    clone = updater?.(clone) || clone;
    return clone.toRgbString();
  };
  const fillColor = (colorVal, type) => {
    const baseColor = new TinyColor(colorVal);
    const colorPalettes = generate(baseColor.toRgbString());
    variables[`${type}-color`] = formatColor(baseColor);
    variables[`${type}-color-disabled`] = colorPalettes[1];
    variables[`${type}-color-hover`] = colorPalettes[4];
    variables[`${type}-color-active`] = colorPalettes[7];
    variables[`${type}-color-outline`] = baseColor.clone().setAlpha(0.2).toRgbString();
    variables[`${type}-color-deprecated-bg`] = colorPalettes[1];
    variables[`${type}-color-deprecated-border`] = colorPalettes[3];
  };
  if (theme.primaryColor) {
    fillColor(theme.primaryColor, "primary");
    const primaryColor = new TinyColor(theme.primaryColor);
    const primaryColors = generate(primaryColor.toRgbString());
    primaryColors.forEach((color, index) => {
      variables[`primary-${index + 1}`] = color;
    });
    variables["primary-color-deprecated-l-35"] = formatColor(primaryColor, (c) => c.lighten(35));
    variables["primary-color-deprecated-l-20"] = formatColor(primaryColor, (c) => c.lighten(20));
    variables["primary-color-deprecated-t-20"] = formatColor(primaryColor, (c) => c.tint(20));
    variables["primary-color-deprecated-t-50"] = formatColor(primaryColor, (c) => c.tint(50));
    variables["primary-color-deprecated-f-12"] = formatColor(primaryColor, (c) => c.setAlpha(c.getAlpha() * 0.12));
    const primaryActiveColor = new TinyColor(primaryColors[0]);
    variables["primary-color-active-deprecated-f-30"] = formatColor(primaryActiveColor, (c) => c.setAlpha(c.getAlpha() * 0.3));
    variables["primary-color-active-deprecated-d-02"] = formatColor(primaryActiveColor, (c) => c.darken(2));
  }
  if (theme.successColor) {
    fillColor(theme.successColor, "success");
  }
  if (theme.warningColor) {
    fillColor(theme.warningColor, "warning");
  }
  if (theme.errorColor) {
    fillColor(theme.errorColor, "error");
  }
  if (theme.infoColor) {
    fillColor(theme.infoColor, "info");
  }
  const cssList = Object.keys(variables).map((key) => `--${globalPrefixCls}-${key}: ${variables[key]};`);
  return `
  :root {
    ${cssList.join("\n")}
  }
  `.trim();
}
function registerTheme(globalPrefixCls, theme, cspNonce) {
  const style = getStyle(globalPrefixCls, theme);
  if (canUseDom()) {
    updateCSS(style, `${dynamicStyleMark}-dynamic-theme`, {
      cspNonce
    });
  } else {
    warn(`NzConfigService: SSR do not support dynamic theme with css variables.`);
  }
}
function isDefined(value) {
  return value !== void 0;
}
var defaultPrefixCls = "ant";
var NzConfigService = class _NzConfigService {
  configUpdated$ = new Subject();
  /**
   * Sharing config signals for all components, used for {@link withConfigFactory}
   * @internal
   * @todo use nested signal to refactor the whole config service
   */
  _configMap = /* @__PURE__ */ new Map();
  /** Global config holding property. */
  config = inject(NZ_CONFIG, {
    optional: true
  }) || {};
  cspNonce = inject(CSP_NONCE, {
    optional: true
  });
  constructor() {
    if (this.config.theme) {
      registerTheme(this.getConfig().prefixCls?.prefixCls || defaultPrefixCls, this.config.theme, this.cspNonce);
    }
  }
  _getConfigValue(componentName) {
    let configValue = this._configMap.get(componentName);
    if (configValue) {
      return configValue;
    }
    configValue = signal(this.config[componentName]);
    this._configMap.set(componentName, configValue);
    return configValue;
  }
  getConfig() {
    return this.config;
  }
  getConfigForComponent(componentName) {
    return this.config[componentName];
  }
  getConfigChangeEventForComponent(componentName) {
    return this.configUpdated$.pipe(filter((n) => n === componentName), map(() => void 0));
  }
  set(componentName, value) {
    this.config[componentName] = __spreadValues(__spreadValues({}, this.config[componentName]), value);
    this._configMap.get(componentName)?.set(this.config[componentName]);
    if (componentName === "theme" && this.config.theme) {
      registerTheme(this.getConfig().prefixCls?.prefixCls || defaultPrefixCls, this.config.theme, this.cspNonce);
    }
    this.configUpdated$.next(componentName);
  }
  static ɵfac = function NzConfigService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzConfigService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzConfigService,
    factory: _NzConfigService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzConfigService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
function onConfigChangeEventForComponent(componentName, callback) {
  if (typeof ngDevMode !== "undefined" && ngDevMode) {
    assertInInjectionContext(onConfigChangeEventForComponent);
  }
  const destroyRef = inject(DestroyRef);
  const nzConfigService = inject(NzConfigService);
  let subscription = null;
  const ref = afterNextRender(() => {
    subscription = nzConfigService.getConfigChangeEventForComponent(componentName).pipe(takeUntilDestroyed(destroyRef)).subscribe(callback);
  });
  return () => {
    ref.destroy();
    subscription?.unsubscribe();
  };
}
function WithConfig() {
  return function(_value, context) {
    context.addInitializer(function() {
      const nzConfigService = inject(NzConfigService);
      const originalValue = this[context.name];
      let value;
      let assignedByUser = false;
      Object.defineProperty(this, context.name, {
        get: () => {
          const configValue = nzConfigService.getConfigForComponent(this["_nzModuleName"])?.[context.name];
          if (assignedByUser) {
            return value;
          }
          if (isDefined(configValue)) {
            return configValue;
          }
          return originalValue;
        },
        set: (newValue) => {
          assignedByUser = isDefined(newValue);
          value = newValue;
        },
        enumerable: true,
        configurable: true
      });
    });
  };
}

// node_modules/@ant-design/fast-color/es/FastColor.js
var round = Math.round;
function splitColorStr(str, parseNum) {
  const match = str.replace(/^[^(]*\((.*)/, "$1").replace(/\).*/, "").match(/\d*\.?\d+%?/g) || [];
  const numList = match.map((item) => parseFloat(item));
  for (let i = 0; i < 3; i += 1) {
    numList[i] = parseNum(numList[i] || 0, match[i] || "", i);
  }
  if (match[3]) {
    numList[3] = match[3].includes("%") ? numList[3] / 100 : numList[3];
  } else {
    numList[3] = 1;
  }
  return numList;
}
var parseHSVorHSL = (num, _, index) => index === 0 ? num : num / 100;
function limitRange(value, max) {
  const mergedMax = max || 255;
  if (value > mergedMax) {
    return mergedMax;
  }
  if (value < 0) {
    return 0;
  }
  return value;
}
var FastColor = class _FastColor {
  constructor(input2) {
    _defineProperty(this, "isValid", true);
    _defineProperty(this, "r", 0);
    _defineProperty(this, "g", 0);
    _defineProperty(this, "b", 0);
    _defineProperty(this, "a", 1);
    _defineProperty(this, "_h", void 0);
    _defineProperty(this, "_s", void 0);
    _defineProperty(this, "_l", void 0);
    _defineProperty(this, "_v", void 0);
    _defineProperty(this, "_max", void 0);
    _defineProperty(this, "_min", void 0);
    _defineProperty(this, "_brightness", void 0);
    function matchFormat(str) {
      return str[0] in input2 && str[1] in input2 && str[2] in input2;
    }
    if (!input2) {
    } else if (typeof input2 === "string") {
      let matchPrefix = function(prefix) {
        return trimStr.startsWith(prefix);
      };
      const trimStr = input2.trim();
      if (/^#?[A-F\d]{3,8}$/i.test(trimStr)) {
        this.fromHexString(trimStr);
      } else if (matchPrefix("rgb")) {
        this.fromRgbString(trimStr);
      } else if (matchPrefix("hsl")) {
        this.fromHslString(trimStr);
      } else if (matchPrefix("hsv") || matchPrefix("hsb")) {
        this.fromHsvString(trimStr);
      }
    } else if (input2 instanceof _FastColor) {
      this.r = input2.r;
      this.g = input2.g;
      this.b = input2.b;
      this.a = input2.a;
      this._h = input2._h;
      this._s = input2._s;
      this._l = input2._l;
      this._v = input2._v;
    } else if (matchFormat("rgb")) {
      this.r = limitRange(input2.r);
      this.g = limitRange(input2.g);
      this.b = limitRange(input2.b);
      this.a = typeof input2.a === "number" ? limitRange(input2.a, 1) : 1;
    } else if (matchFormat("hsl")) {
      this.fromHsl(input2);
    } else if (matchFormat("hsv")) {
      this.fromHsv(input2);
    } else {
      throw new Error("@ant-design/fast-color: unsupported input " + JSON.stringify(input2));
    }
  }
  // ======================= Setter =======================
  setR(value) {
    return this._sc("r", value);
  }
  setG(value) {
    return this._sc("g", value);
  }
  setB(value) {
    return this._sc("b", value);
  }
  setA(value) {
    return this._sc("a", value, 1);
  }
  setHue(value) {
    const hsv = this.toHsv();
    hsv.h = value;
    return this._c(hsv);
  }
  // ======================= Getter =======================
  /**
   * Returns the perceived luminance of a color, from 0-1.
   * @see http://www.w3.org/TR/2008/REC-WCAG20-20081211/#relativeluminancedef
   */
  getLuminance() {
    function adjustGamma(raw) {
      const val = raw / 255;
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
    }
    const R = adjustGamma(this.r);
    const G = adjustGamma(this.g);
    const B = adjustGamma(this.b);
    return 0.2126 * R + 0.7152 * G + 0.0722 * B;
  }
  getHue() {
    if (typeof this._h === "undefined") {
      const delta = this.getMax() - this.getMin();
      if (delta === 0) {
        this._h = 0;
      } else {
        this._h = round(60 * (this.r === this.getMax() ? (this.g - this.b) / delta + (this.g < this.b ? 6 : 0) : this.g === this.getMax() ? (this.b - this.r) / delta + 2 : (this.r - this.g) / delta + 4));
      }
    }
    return this._h;
  }
  getSaturation() {
    if (typeof this._s === "undefined") {
      const delta = this.getMax() - this.getMin();
      if (delta === 0) {
        this._s = 0;
      } else {
        this._s = delta / this.getMax();
      }
    }
    return this._s;
  }
  getLightness() {
    if (typeof this._l === "undefined") {
      this._l = (this.getMax() + this.getMin()) / 510;
    }
    return this._l;
  }
  getValue() {
    if (typeof this._v === "undefined") {
      this._v = this.getMax() / 255;
    }
    return this._v;
  }
  /**
   * Returns the perceived brightness of the color, from 0-255.
   * Note: this is not the b of HSB
   * @see http://www.w3.org/TR/AERT#color-contrast
   */
  getBrightness() {
    if (typeof this._brightness === "undefined") {
      this._brightness = (this.r * 299 + this.g * 587 + this.b * 114) / 1e3;
    }
    return this._brightness;
  }
  // ======================== Func ========================
  darken(amount = 10) {
    const h = this.getHue();
    const s = this.getSaturation();
    let l = this.getLightness() - amount / 100;
    if (l < 0) {
      l = 0;
    }
    return this._c({
      h,
      s,
      l,
      a: this.a
    });
  }
  lighten(amount = 10) {
    const h = this.getHue();
    const s = this.getSaturation();
    let l = this.getLightness() + amount / 100;
    if (l > 1) {
      l = 1;
    }
    return this._c({
      h,
      s,
      l,
      a: this.a
    });
  }
  /**
   * Mix the current color a given amount with another color, from 0 to 100.
   * 0 means no mixing (return current color).
   */
  mix(input2, amount = 50) {
    const color = this._c(input2);
    const p = amount / 100;
    const calc = (key) => (color[key] - this[key]) * p + this[key];
    const rgba = {
      r: round(calc("r")),
      g: round(calc("g")),
      b: round(calc("b")),
      a: round(calc("a") * 100) / 100
    };
    return this._c(rgba);
  }
  /**
   * Mix the color with pure white, from 0 to 100.
   * Providing 0 will do nothing, providing 100 will always return white.
   */
  tint(amount = 10) {
    return this.mix({
      r: 255,
      g: 255,
      b: 255,
      a: 1
    }, amount);
  }
  /**
   * Mix the color with pure black, from 0 to 100.
   * Providing 0 will do nothing, providing 100 will always return black.
   */
  shade(amount = 10) {
    return this.mix({
      r: 0,
      g: 0,
      b: 0,
      a: 1
    }, amount);
  }
  onBackground(background) {
    const bg = this._c(background);
    const alpha = this.a + bg.a * (1 - this.a);
    const calc = (key) => {
      return round((this[key] * this.a + bg[key] * bg.a * (1 - this.a)) / alpha);
    };
    return this._c({
      r: calc("r"),
      g: calc("g"),
      b: calc("b"),
      a: alpha
    });
  }
  // ======================= Status =======================
  isDark() {
    return this.getBrightness() < 128;
  }
  isLight() {
    return this.getBrightness() >= 128;
  }
  // ======================== MISC ========================
  equals(other) {
    return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
  }
  clone() {
    return this._c(this);
  }
  // ======================= Format =======================
  toHexString() {
    let hex = "#";
    const rHex = (this.r || 0).toString(16);
    hex += rHex.length === 2 ? rHex : "0" + rHex;
    const gHex = (this.g || 0).toString(16);
    hex += gHex.length === 2 ? gHex : "0" + gHex;
    const bHex = (this.b || 0).toString(16);
    hex += bHex.length === 2 ? bHex : "0" + bHex;
    if (typeof this.a === "number" && this.a >= 0 && this.a < 1) {
      const aHex = round(this.a * 255).toString(16);
      hex += aHex.length === 2 ? aHex : "0" + aHex;
    }
    return hex;
  }
  /** CSS support color pattern */
  toHsl() {
    return {
      h: this.getHue(),
      s: this.getSaturation(),
      l: this.getLightness(),
      a: this.a
    };
  }
  /** CSS support color pattern */
  toHslString() {
    const h = this.getHue();
    const s = round(this.getSaturation() * 100);
    const l = round(this.getLightness() * 100);
    return this.a !== 1 ? `hsla(${h},${s}%,${l}%,${this.a})` : `hsl(${h},${s}%,${l}%)`;
  }
  /** Same as toHsb */
  toHsv() {
    return {
      h: this.getHue(),
      s: this.getSaturation(),
      v: this.getValue(),
      a: this.a
    };
  }
  toRgb() {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a
    };
  }
  toRgbString() {
    return this.a !== 1 ? `rgba(${this.r},${this.g},${this.b},${this.a})` : `rgb(${this.r},${this.g},${this.b})`;
  }
  toString() {
    return this.toRgbString();
  }
  // ====================== Privates ======================
  /** Return a new FastColor object with one channel changed */
  _sc(rgb, value, max) {
    const clone = this.clone();
    clone[rgb] = limitRange(value, max);
    return clone;
  }
  _c(input2) {
    return new this.constructor(input2);
  }
  getMax() {
    if (typeof this._max === "undefined") {
      this._max = Math.max(this.r, this.g, this.b);
    }
    return this._max;
  }
  getMin() {
    if (typeof this._min === "undefined") {
      this._min = Math.min(this.r, this.g, this.b);
    }
    return this._min;
  }
  fromHexString(trimStr) {
    const withoutPrefix = trimStr.replace("#", "");
    function connectNum(index1, index2) {
      return parseInt(withoutPrefix[index1] + withoutPrefix[index2 || index1], 16);
    }
    if (withoutPrefix.length < 6) {
      this.r = connectNum(0);
      this.g = connectNum(1);
      this.b = connectNum(2);
      this.a = withoutPrefix[3] ? connectNum(3) / 255 : 1;
    } else {
      this.r = connectNum(0, 1);
      this.g = connectNum(2, 3);
      this.b = connectNum(4, 5);
      this.a = withoutPrefix[6] ? connectNum(6, 7) / 255 : 1;
    }
  }
  fromHsl({
    h,
    s,
    l,
    a
  }) {
    this._h = h % 360;
    this._s = s;
    this._l = l;
    this.a = typeof a === "number" ? a : 1;
    if (s <= 0) {
      const rgb = round(l * 255);
      this.r = rgb;
      this.g = rgb;
      this.b = rgb;
    }
    let r = 0, g = 0, b = 0;
    const huePrime = h / 60;
    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const secondComponent = chroma * (1 - Math.abs(huePrime % 2 - 1));
    if (huePrime >= 0 && huePrime < 1) {
      r = chroma;
      g = secondComponent;
    } else if (huePrime >= 1 && huePrime < 2) {
      r = secondComponent;
      g = chroma;
    } else if (huePrime >= 2 && huePrime < 3) {
      g = chroma;
      b = secondComponent;
    } else if (huePrime >= 3 && huePrime < 4) {
      g = secondComponent;
      b = chroma;
    } else if (huePrime >= 4 && huePrime < 5) {
      r = secondComponent;
      b = chroma;
    } else if (huePrime >= 5 && huePrime < 6) {
      r = chroma;
      b = secondComponent;
    }
    const lightnessModification = l - chroma / 2;
    this.r = round((r + lightnessModification) * 255);
    this.g = round((g + lightnessModification) * 255);
    this.b = round((b + lightnessModification) * 255);
  }
  fromHsv({
    h,
    s,
    v,
    a
  }) {
    this._h = h % 360;
    this._s = s;
    this._v = v;
    this.a = typeof a === "number" ? a : 1;
    const vv = round(v * 255);
    this.r = vv;
    this.g = vv;
    this.b = vv;
    if (s <= 0) {
      return;
    }
    const hh = h / 60;
    const i = Math.floor(hh);
    const ff = hh - i;
    const p = round(v * (1 - s) * 255);
    const q = round(v * (1 - s * ff) * 255);
    const t = round(v * (1 - s * (1 - ff)) * 255);
    switch (i) {
      case 0:
        this.g = t;
        this.b = p;
        break;
      case 1:
        this.r = q;
        this.b = p;
        break;
      case 2:
        this.r = p;
        this.b = t;
        break;
      case 3:
        this.r = p;
        this.g = q;
        break;
      case 4:
        this.r = t;
        this.g = p;
        break;
      case 5:
      default:
        this.g = p;
        this.b = q;
        break;
    }
  }
  fromHsvString(trimStr) {
    const cells = splitColorStr(trimStr, parseHSVorHSL);
    this.fromHsv({
      h: cells[0],
      s: cells[1],
      v: cells[2],
      a: cells[3]
    });
  }
  fromHslString(trimStr) {
    const cells = splitColorStr(trimStr, parseHSVorHSL);
    this.fromHsl({
      h: cells[0],
      s: cells[1],
      l: cells[2],
      a: cells[3]
    });
  }
  fromRgbString(trimStr) {
    const cells = splitColorStr(trimStr, (num, txt) => (
      // Convert percentage to number. e.g. 50% -> 128
      txt.includes("%") ? round(num / 100 * 255) : num
    ));
    this.r = cells[0];
    this.g = cells[1];
    this.b = cells[2];
    this.a = cells[3];
  }
};

// node_modules/@ant-design/colors/es/generate.js
var hueStep2 = 2;
var saturationStep3 = 0.16;
var saturationStep22 = 0.05;
var brightnessStep12 = 0.05;
var brightnessStep22 = 0.15;
var lightColorCount2 = 5;
var darkColorCount2 = 4;
var darkColorMap2 = [{
  index: 7,
  amount: 15
}, {
  index: 6,
  amount: 25
}, {
  index: 5,
  amount: 30
}, {
  index: 5,
  amount: 45
}, {
  index: 5,
  amount: 65
}, {
  index: 5,
  amount: 85
}, {
  index: 4,
  amount: 90
}, {
  index: 3,
  amount: 95
}, {
  index: 2,
  amount: 97
}, {
  index: 1,
  amount: 98
}];
function getHue2(hsv, i, light) {
  var hue;
  if (Math.round(hsv.h) >= 60 && Math.round(hsv.h) <= 240) {
    hue = light ? Math.round(hsv.h) - hueStep2 * i : Math.round(hsv.h) + hueStep2 * i;
  } else {
    hue = light ? Math.round(hsv.h) + hueStep2 * i : Math.round(hsv.h) - hueStep2 * i;
  }
  if (hue < 0) {
    hue += 360;
  } else if (hue >= 360) {
    hue -= 360;
  }
  return hue;
}
function getSaturation2(hsv, i, light) {
  if (hsv.h === 0 && hsv.s === 0) {
    return hsv.s;
  }
  var saturation;
  if (light) {
    saturation = hsv.s - saturationStep3 * i;
  } else if (i === darkColorCount2) {
    saturation = hsv.s + saturationStep3;
  } else {
    saturation = hsv.s + saturationStep22 * i;
  }
  if (saturation > 1) {
    saturation = 1;
  }
  if (light && i === lightColorCount2 && saturation > 0.1) {
    saturation = 0.1;
  }
  if (saturation < 0.06) {
    saturation = 0.06;
  }
  return Math.round(saturation * 100) / 100;
}
function getValue2(hsv, i, light) {
  var value;
  if (light) {
    value = hsv.v + brightnessStep12 * i;
  } else {
    value = hsv.v - brightnessStep22 * i;
  }
  value = Math.max(0, Math.min(1, value));
  return Math.round(value * 100) / 100;
}
function generate2(color) {
  var opts = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  var patterns = [];
  var pColor = new FastColor(color);
  var hsv = pColor.toHsv();
  for (var i = lightColorCount2; i > 0; i -= 1) {
    var c = new FastColor({
      h: getHue2(hsv, i, true),
      s: getSaturation2(hsv, i, true),
      v: getValue2(hsv, i, true)
    });
    patterns.push(c);
  }
  patterns.push(pColor);
  for (var _i = 1; _i <= darkColorCount2; _i += 1) {
    var _c = new FastColor({
      h: getHue2(hsv, _i),
      s: getSaturation2(hsv, _i),
      v: getValue2(hsv, _i)
    });
    patterns.push(_c);
  }
  if (opts.theme === "dark") {
    return darkColorMap2.map(function(_ref) {
      var index = _ref.index, amount = _ref.amount;
      return new FastColor(opts.backgroundColor || "#141414").mix(patterns[index], amount).toHexString();
    });
  }
  return patterns.map(function(c2) {
    return c2.toHexString();
  });
}

// node_modules/@ant-design/colors/es/presets.js
var red = ["#fff1f0", "#ffccc7", "#ffa39e", "#ff7875", "#ff4d4f", "#f5222d", "#cf1322", "#a8071a", "#820014", "#5c0011"];
red.primary = red[5];
var volcano = ["#fff2e8", "#ffd8bf", "#ffbb96", "#ff9c6e", "#ff7a45", "#fa541c", "#d4380d", "#ad2102", "#871400", "#610b00"];
volcano.primary = volcano[5];
var orange = ["#fff7e6", "#ffe7ba", "#ffd591", "#ffc069", "#ffa940", "#fa8c16", "#d46b08", "#ad4e00", "#873800", "#612500"];
orange.primary = orange[5];
var gold = ["#fffbe6", "#fff1b8", "#ffe58f", "#ffd666", "#ffc53d", "#faad14", "#d48806", "#ad6800", "#874d00", "#613400"];
gold.primary = gold[5];
var yellow = ["#feffe6", "#ffffb8", "#fffb8f", "#fff566", "#ffec3d", "#fadb14", "#d4b106", "#ad8b00", "#876800", "#614700"];
yellow.primary = yellow[5];
var lime = ["#fcffe6", "#f4ffb8", "#eaff8f", "#d3f261", "#bae637", "#a0d911", "#7cb305", "#5b8c00", "#3f6600", "#254000"];
lime.primary = lime[5];
var green = ["#f6ffed", "#d9f7be", "#b7eb8f", "#95de64", "#73d13d", "#52c41a", "#389e0d", "#237804", "#135200", "#092b00"];
green.primary = green[5];
var cyan = ["#e6fffb", "#b5f5ec", "#87e8de", "#5cdbd3", "#36cfc9", "#13c2c2", "#08979c", "#006d75", "#00474f", "#002329"];
cyan.primary = cyan[5];
var blue = ["#e6f4ff", "#bae0ff", "#91caff", "#69b1ff", "#4096ff", "#1677ff", "#0958d9", "#003eb3", "#002c8c", "#001d66"];
blue.primary = blue[5];
var geekblue = ["#f0f5ff", "#d6e4ff", "#adc6ff", "#85a5ff", "#597ef7", "#2f54eb", "#1d39c4", "#10239e", "#061178", "#030852"];
geekblue.primary = geekblue[5];
var purple = ["#f9f0ff", "#efdbff", "#d3adf7", "#b37feb", "#9254de", "#722ed1", "#531dab", "#391085", "#22075e", "#120338"];
purple.primary = purple[5];
var magenta = ["#fff0f6", "#ffd6e7", "#ffadd2", "#ff85c0", "#f759ab", "#eb2f96", "#c41d7f", "#9e1068", "#780650", "#520339"];
magenta.primary = magenta[5];
var grey = ["#a6a6a6", "#999999", "#8c8c8c", "#808080", "#737373", "#666666", "#404040", "#1a1a1a", "#000000", "#000000"];
grey.primary = grey[5];
var redDark = ["#2a1215", "#431418", "#58181c", "#791a1f", "#a61d24", "#d32029", "#e84749", "#f37370", "#f89f9a", "#fac8c3"];
redDark.primary = redDark[5];
var volcanoDark = ["#2b1611", "#441d12", "#592716", "#7c3118", "#aa3e19", "#d84a1b", "#e87040", "#f3956a", "#f8b692", "#fad4bc"];
volcanoDark.primary = volcanoDark[5];
var orangeDark = ["#2b1d11", "#442a11", "#593815", "#7c4a15", "#aa6215", "#d87a16", "#e89a3c", "#f3b765", "#f8cf8d", "#fae3b7"];
orangeDark.primary = orangeDark[5];
var goldDark = ["#2b2111", "#443111", "#594214", "#7c5914", "#aa7714", "#d89614", "#e8b339", "#f3cc62", "#f8df8b", "#faedb5"];
goldDark.primary = goldDark[5];
var yellowDark = ["#2b2611", "#443b11", "#595014", "#7c6e14", "#aa9514", "#d8bd14", "#e8d639", "#f3ea62", "#f8f48b", "#fafab5"];
yellowDark.primary = yellowDark[5];
var limeDark = ["#1f2611", "#2e3c10", "#3e4f13", "#536d13", "#6f9412", "#8bbb11", "#a9d134", "#c9e75d", "#e4f88b", "#f0fab5"];
limeDark.primary = limeDark[5];
var greenDark = ["#162312", "#1d3712", "#274916", "#306317", "#3c8618", "#49aa19", "#6abe39", "#8fd460", "#b2e58b", "#d5f2bb"];
greenDark.primary = greenDark[5];
var cyanDark = ["#112123", "#113536", "#144848", "#146262", "#138585", "#13a8a8", "#33bcb7", "#58d1c9", "#84e2d8", "#b2f1e8"];
cyanDark.primary = cyanDark[5];
var blueDark = ["#111a2c", "#112545", "#15325b", "#15417e", "#1554ad", "#1668dc", "#3c89e8", "#65a9f3", "#8dc5f8", "#b7dcfa"];
blueDark.primary = blueDark[5];
var geekblueDark = ["#131629", "#161d40", "#1c2755", "#203175", "#263ea0", "#2b4acb", "#5273e0", "#7f9ef3", "#a8c1f8", "#d2e0fa"];
geekblueDark.primary = geekblueDark[5];
var purpleDark = ["#1a1325", "#24163a", "#301c4d", "#3e2069", "#51258f", "#642ab5", "#854eca", "#ab7ae0", "#cda8f0", "#ebd7fa"];
purpleDark.primary = purpleDark[5];
var magentaDark = ["#291321", "#40162f", "#551c3b", "#75204f", "#a02669", "#cb2b83", "#e0529c", "#f37fb7", "#f8a8cc", "#fad2e3"];
magentaDark.primary = magentaDark[5];
var greyDark = ["#151515", "#1f1f1f", "#2d2d2d", "#393939", "#494949", "#5a5a5a", "#6a6a6a", "#7b7b7b", "#888888", "#969696"];
greyDark.primary = greyDark[5];

// node_modules/@ant-design/icons-angular/fesm2022/ant-design-icons-angular.mjs
var ANT_ICON_ANGULAR_CONSOLE_PREFIX = "[@ant-design/icons-angular]:";
function error(message) {
  console.error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX} ${message}.`);
}
function warn2(message) {
  if (isDevMode()) {
    console.warn(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX} ${message}.`);
  }
}
function getSecondaryColor(primaryColor) {
  return generate2(primaryColor)[0];
}
function withSuffix(name2, theme) {
  switch (theme) {
    case "fill":
      return `${name2}-fill`;
    case "outline":
      return `${name2}-o`;
    case "twotone":
      return `${name2}-twotone`;
    case void 0:
      return name2;
    default:
      throw new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}Theme "${theme}" is not a recognized theme!`);
  }
}
function withSuffixAndColor(name2, theme, pri, sec) {
  return `${withSuffix(name2, theme)}-${pri}-${sec}`;
}
function mapAbbrToTheme(abbr) {
  return abbr === "o" ? "outline" : abbr;
}
function alreadyHasAThemeSuffix(name2) {
  return name2.endsWith("-fill") || name2.endsWith("-o") || name2.endsWith("-twotone");
}
function isIconDefinition(target) {
  return typeof target === "object" && typeof target.name === "string" && (typeof target.theme === "string" || target.theme === void 0) && typeof target.icon === "string";
}
function getIconDefinitionFromAbbr(str) {
  const arr = str.split("-");
  const theme = mapAbbrToTheme(arr.splice(arr.length - 1, 1)[0]);
  const name2 = arr.join("-");
  return {
    name: name2,
    theme,
    icon: ""
  };
}
function cloneSVG(svg) {
  return svg.cloneNode(true);
}
function replaceFillColor(raw) {
  return raw.replace(/['"]#333['"]/g, '"primaryColor"').replace(/['"]#E6E6E6['"]/g, '"secondaryColor"').replace(/['"]#D9D9D9['"]/g, '"secondaryColor"').replace(/['"]#D8D8D8['"]/g, '"secondaryColor"');
}
function getNameAndNamespace(type) {
  const split = type.split(":");
  switch (split.length) {
    case 1:
      return [type, ""];
    case 2:
      return [split[1], split[0]];
    default:
      throw new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}The icon type ${type} is not valid!`);
  }
}
function hasNamespace(type) {
  return getNameAndNamespace(type)[1] !== "";
}
function NameSpaceIsNotSpecifyError() {
  return new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}Type should have a namespace. Try "namespace:${name}".`);
}
function IconNotFoundError(icon) {
  return new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}the icon ${icon} does not exist or is not registered.`);
}
function HttpModuleNotImport() {
  error(`you need to import "HttpClientModule" to use dynamic importing.`);
  return null;
}
function UrlNotSafeError(url) {
  return new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}The url "${url}" is unsafe.`);
}
function SVGTagNotFoundError() {
  return new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}<svg> tag not found.`);
}
function DynamicLoadingTimeoutError() {
  return new Error(`${ANT_ICON_ANGULAR_CONSOLE_PREFIX}Importing timeout error.`);
}
var JSONP_HANDLER_NAME = "__ant_icon_load";
var ANT_ICONS = new InjectionToken("ant_icons");
var IconService = class _IconService {
  _antIcons;
  defaultTheme = "outline";
  set twoToneColor({
    primaryColor,
    secondaryColor
  }) {
    this._twoToneColorPalette.primaryColor = primaryColor;
    this._twoToneColorPalette.secondaryColor = secondaryColor || getSecondaryColor(primaryColor);
  }
  get twoToneColor() {
    return __spreadValues({}, this._twoToneColorPalette);
  }
  _renderer;
  _http;
  /**
   * Disable dynamic loading (support static loading only).
   */
  get _disableDynamicLoading() {
    return false;
  }
  /**
   * All icon definitions would be registered here.
   */
  _svgDefinitions = /* @__PURE__ */ new Map();
  /**
   * Cache all rendered icons. Icons are identified by name, theme,
   * and for twotone icons, primary color and secondary color.
   */
  _svgRenderedDefinitions = /* @__PURE__ */ new Map();
  _inProgressFetches = /* @__PURE__ */ new Map();
  /**
   * Url prefix for fetching inline SVG by dynamic importing.
   */
  _assetsUrlRoot = "";
  _twoToneColorPalette = {
    primaryColor: "#333333",
    secondaryColor: "#E6E6E6"
  };
  /** A flag indicates whether jsonp loading is enabled. */
  _enableJsonpLoading = false;
  _jsonpIconLoad$ = new Subject();
  _rendererFactory = inject(RendererFactory2);
  _handler = inject(HttpBackend, {
    optional: true
  });
  _document = inject(DOCUMENT);
  sanitizer = inject(DomSanitizer);
  constructor(_antIcons) {
    this._antIcons = _antIcons;
    this._renderer = this._rendererFactory.createRenderer(null, null);
    if (this._handler) {
      this._http = new HttpClient(this._handler);
    }
    if (this._antIcons) {
      this.addIcon(...this._antIcons);
    }
  }
  /**
   * Call this method to switch to jsonp like loading.
   */
  useJsonpLoading() {
    if (!this._enableJsonpLoading) {
      this._enableJsonpLoading = true;
      window[JSONP_HANDLER_NAME] = (icon) => {
        this._jsonpIconLoad$.next(icon);
      };
    } else {
      warn2("You are already using jsonp loading.");
    }
  }
  /**
   * Change the prefix of the inline svg resources, so they could be deployed elsewhere, like CDN.
   * @param prefix
   */
  changeAssetsSource(prefix) {
    this._assetsUrlRoot = prefix.endsWith("/") ? prefix : prefix + "/";
  }
  /**
   * Add icons provided by ant design.
   * @param icons
   */
  addIcon(...icons) {
    icons.forEach((icon) => {
      this._svgDefinitions.set(withSuffix(icon.name, icon.theme), icon);
    });
  }
  /**
   * Register an icon. Namespace is required.
   * @param type
   * @param literal
   */
  addIconLiteral(type, literal) {
    const [_, namespace] = getNameAndNamespace(type);
    if (!namespace) {
      throw NameSpaceIsNotSpecifyError();
    }
    this.addIcon({
      name: type,
      icon: literal
    });
  }
  /**
   * Remove all cache.
   */
  clear() {
    this._svgDefinitions.clear();
    this._svgRenderedDefinitions.clear();
  }
  /**
   * Get a rendered `SVGElement`.
   * @param icon
   * @param twoToneColor
   */
  getRenderedContent(icon, twoToneColor) {
    const definition = isIconDefinition(icon) ? icon : this._svgDefinitions.get(icon) || null;
    if (!definition && this._disableDynamicLoading) {
      throw IconNotFoundError(icon);
    }
    const $iconDefinition = definition ? of(definition) : this._loadIconDynamically(icon);
    return $iconDefinition.pipe(map((i) => {
      if (!i) {
        throw IconNotFoundError(icon);
      }
      return this._loadSVGFromCacheOrCreateNew(i, twoToneColor);
    }));
  }
  getCachedIcons() {
    return this._svgDefinitions;
  }
  /**
   * Get raw svg and assemble a `IconDefinition` object.
   * @param type
   */
  _loadIconDynamically(type) {
    if (!this._http && !this._enableJsonpLoading) {
      return of(HttpModuleNotImport());
    }
    let inProgress = this._inProgressFetches.get(type);
    if (!inProgress) {
      const [name2, namespace] = getNameAndNamespace(type);
      const icon = namespace ? {
        name: type,
        icon: ""
      } : getIconDefinitionFromAbbr(name2);
      const suffix = this._enableJsonpLoading ? ".js" : ".svg";
      const url = (namespace ? `${this._assetsUrlRoot}assets/${namespace}/${name2}` : `${this._assetsUrlRoot}assets/${icon.theme}/${icon.name}`) + suffix;
      const safeUrl = this.sanitizer.sanitize(SecurityContext.URL, url);
      if (!safeUrl) {
        throw UrlNotSafeError(url);
      }
      const source = !this._enableJsonpLoading ? this._http.get(safeUrl, {
        responseType: "text"
      }).pipe(map((literal) => __spreadProps(__spreadValues({}, icon), {
        icon: literal
      }))) : this._loadIconDynamicallyWithJsonp(icon, safeUrl);
      inProgress = source.pipe(tap((definition) => this.addIcon(definition)), finalize(() => this._inProgressFetches.delete(type)), catchError(() => of(null)), share());
      this._inProgressFetches.set(type, inProgress);
    }
    return inProgress;
  }
  _loadIconDynamicallyWithJsonp(icon, url) {
    return new Observable((subscriber) => {
      const loader = this._document.createElement("script");
      const timer = setTimeout(() => {
        clean();
        subscriber.error(DynamicLoadingTimeoutError());
      }, 6e3);
      loader.src = url;
      function clean() {
        loader.parentNode.removeChild(loader);
        clearTimeout(timer);
      }
      this._document.body.appendChild(loader);
      this._jsonpIconLoad$.pipe(filter((i) => i.name === icon.name && i.theme === icon.theme), take(1)).subscribe((i) => {
        subscriber.next(i);
        clean();
      });
    });
  }
  /**
   * Render a new `SVGElement` for a given `IconDefinition`, or make a copy from cache.
   * @param icon
   * @param twoToneColor
   */
  _loadSVGFromCacheOrCreateNew(icon, twoToneColor) {
    let svg;
    const pri = twoToneColor || this._twoToneColorPalette.primaryColor;
    const sec = getSecondaryColor(pri) || this._twoToneColorPalette.secondaryColor;
    const key = icon.theme === "twotone" ? withSuffixAndColor(icon.name, icon.theme, pri, sec) : icon.theme === void 0 ? icon.name : withSuffix(icon.name, icon.theme);
    const cached = this._svgRenderedDefinitions.get(key);
    if (cached) {
      svg = cached.icon;
    } else {
      svg = this._setSVGAttribute(this._colorizeSVGIcon(
        // Icons provided by ant design should be refined to remove preset colors.
        this._createSVGElementFromString(hasNamespace(icon.name) ? icon.icon : replaceFillColor(icon.icon)),
        icon.theme === "twotone",
        pri,
        sec
      ));
      this._svgRenderedDefinitions.set(key, __spreadProps(__spreadValues({}, icon), {
        icon: svg
      }));
    }
    return cloneSVG(svg);
  }
  _createSVGElementFromString(str) {
    const div = this._document.createElement("div");
    div.innerHTML = str;
    const svg = div.querySelector("svg");
    if (!svg) {
      throw SVGTagNotFoundError;
    }
    return svg;
  }
  _setSVGAttribute(svg) {
    this._renderer.setAttribute(svg, "width", "1em");
    this._renderer.setAttribute(svg, "height", "1em");
    return svg;
  }
  _colorizeSVGIcon(svg, twotone, pri, sec) {
    if (twotone) {
      const children = svg.childNodes;
      const length = children.length;
      for (let i = 0; i < length; i++) {
        const child = children[i];
        if (child.getAttribute("fill") === "secondaryColor") {
          this._renderer.setAttribute(child, "fill", sec);
        } else {
          this._renderer.setAttribute(child, "fill", pri);
        }
      }
    }
    this._renderer.setAttribute(svg, "fill", "currentColor");
    return svg;
  }
  static ɵfac = function IconService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _IconService)(ɵɵinject(ANT_ICONS, 8));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _IconService,
    factory: _IconService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(IconService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [{
    type: void 0,
    decorators: [{
      type: Optional
    }, {
      type: Inject,
      args: [ANT_ICONS]
    }]
  }], null);
})();
function checkMeta(prev, after) {
  return prev.type === after.type && prev.theme === after.theme && prev.twoToneColor === after.twoToneColor;
}
var IconDirective = class _IconDirective {
  _iconService;
  type;
  theme;
  twoToneColor;
  _elementRef = inject(ElementRef);
  _renderer = inject(Renderer2);
  constructor(_iconService) {
    this._iconService = _iconService;
  }
  ngOnChanges(changes) {
    if (changes.type || changes.theme || changes.twoToneColor) {
      this._changeIcon();
    }
  }
  /**
   * Render a new icon in the current element. Remove the icon when `type` is falsy.
   */
  _changeIcon() {
    return new Promise((resolve) => {
      if (!this.type) {
        this._clearSVGElement();
        resolve(null);
        return;
      }
      const beforeMeta = this._getSelfRenderMeta();
      this._iconService.getRenderedContent(this._parseIconType(this.type, this.theme), this.twoToneColor).subscribe((svg) => {
        const afterMeta = this._getSelfRenderMeta();
        if (checkMeta(beforeMeta, afterMeta)) {
          this._setSVGElement(svg);
          resolve(svg);
        } else {
          resolve(null);
        }
      });
    });
  }
  _getSelfRenderMeta() {
    return {
      type: this.type,
      theme: this.theme,
      twoToneColor: this.twoToneColor
    };
  }
  /**
   * Parse a icon to the standard form, an `IconDefinition` or a string like 'account-book-fill` (with a theme suffixed).
   * If namespace is specified, ignore theme because it meaningless for users' icons.
   *
   * @param type
   * @param theme
   */
  _parseIconType(type, theme) {
    if (isIconDefinition(type)) {
      return type;
    } else {
      const [name2, namespace] = getNameAndNamespace(type);
      if (namespace) {
        return type;
      }
      if (alreadyHasAThemeSuffix(name2)) {
        if (theme) {
          warn2(`'type' ${name2} already gets a theme inside so 'theme' ${theme} would be ignored`);
        }
        return name2;
      } else {
        return withSuffix(name2, theme || this._iconService.defaultTheme);
      }
    }
  }
  _setSVGElement(svg) {
    this._clearSVGElement();
    this._renderer.appendChild(this._elementRef.nativeElement, svg);
  }
  _clearSVGElement() {
    const el = this._elementRef.nativeElement;
    const children = el.childNodes;
    const length = children.length;
    for (let i = length - 1; i >= 0; i--) {
      const child = children[i];
      if (child.tagName?.toLowerCase() === "svg") {
        this._renderer.removeChild(el, child);
      }
    }
  }
  static ɵfac = function IconDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _IconDirective)(ɵɵdirectiveInject(IconService));
  };
  static ɵdir = ɵɵdefineDirective({
    type: _IconDirective,
    selectors: [["", "antIcon", ""]],
    inputs: {
      type: "type",
      theme: "theme",
      twoToneColor: "twoToneColor"
    },
    features: [ɵɵNgOnChangesFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(IconDirective, [{
    type: Directive,
    args: [{
      selector: "[antIcon]"
    }]
  }], () => [{
    type: IconService
  }], {
    type: [{
      type: Input
    }],
    theme: [{
      type: Input
    }],
    twoToneColor: [{
      type: Input
    }]
  });
})();

// node_modules/@ant-design/icons-angular/fesm2022/ant-design-icons-angular-icons.mjs
var BarsOutline = {
  name: "bars",
  theme: "outline",
  icon: '<svg viewBox="0 0 1024 1024" focusable="false"><path d="M912 192H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zm0 284H328c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h584c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8zM104 228a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0zm0 284a56 56 0 10112 0 56 56 0 10-112 0z" /></svg>'
};
var CalendarOutline = {
  name: "calendar",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M880 184H712v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H384v-64c0-4.4-3.6-8-8-8h-56c-4.4 0-8 3.6-8 8v64H144c-17.7 0-32 14.3-32 32v664c0 17.7 14.3 32 32 32h736c17.7 0 32-14.3 32-32V216c0-17.7-14.3-32-32-32zm-40 656H184V460h656v380zM184 392V256h128v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h256v48c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8v-48h128v136H184z" /></svg>'
};
var CaretDownFill = {
  name: "caret-down",
  theme: "fill",
  icon: '<svg viewBox="0 0 1024 1024" focusable="false"><path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z" /></svg>'
};
var CaretUpFill = {
  name: "caret-up",
  theme: "fill",
  icon: '<svg viewBox="0 0 1024 1024" focusable="false"><path d="M858.9 689L530.5 308.2c-9.4-10.9-27.5-10.9-37 0L165.1 689c-12.2 14.2-1.2 35 18.5 35h656.8c19.7 0 30.7-20.8 18.5-35z" /></svg>'
};
var CheckCircleFill = {
  name: "check-circle",
  theme: "fill",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm193.5 301.7l-210.6 292a31.8 31.8 0 01-51.7 0L318.5 484.9c-3.8-5.3 0-12.7 6.5-12.7h46.9c10.2 0 19.9 4.9 25.9 13.3l71.2 98.8 157.2-218c6-8.3 15.6-13.3 25.9-13.3H699c6.5 0 10.3 7.4 6.5 12.7z" /></svg>'
};
var CaretDownOutline = {
  name: "caret-down",
  theme: "outline",
  icon: '<svg viewBox="0 0 1024 1024" focusable="false"><path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z" /></svg>'
};
var CheckCircleOutline = {
  name: "check-circle",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M699 353h-46.9c-10.2 0-19.9 4.9-25.9 13.3L469 584.3l-71.2-98.8c-6-8.3-15.6-13.3-25.9-13.3H325c-6.5 0-10.3 7.4-6.5 12.7l124.6 172.8a31.8 31.8 0 0051.7 0l210.6-292c3.9-5.3.1-12.7-6.4-12.7z" /><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" /></svg>'
};
var CheckOutline = {
  name: "check",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 00-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z" /></svg>'
};
var CaretUpOutline = {
  name: "caret-up",
  theme: "outline",
  icon: '<svg viewBox="0 0 1024 1024" focusable="false"><path d="M858.9 689L530.5 308.2c-9.4-10.9-27.5-10.9-37 0L165.1 689c-12.2 14.2-1.2 35 18.5 35h656.8c19.7 0 30.7-20.8 18.5-35z" /></svg>'
};
var CloseCircleOutline = {
  name: "close-circle",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm0 76c-205.4 0-372 166.6-372 372s166.6 372 372 372 372-166.6 372-372-166.6-372-372-372zm128.01 198.83c.03 0 .05.01.09.06l45.02 45.01a.2.2 0 01.05.09.12.12 0 010 .07c0 .02-.01.04-.05.08L557.25 512l127.87 127.86a.27.27 0 01.05.06v.02a.12.12 0 010 .07c0 .03-.01.05-.05.09l-45.02 45.02a.2.2 0 01-.09.05.12.12 0 01-.07 0c-.02 0-.04-.01-.08-.05L512 557.25 384.14 685.12c-.04.04-.06.05-.08.05a.12.12 0 01-.07 0c-.03 0-.05-.01-.09-.05l-45.02-45.02a.2.2 0 01-.05-.09.12.12 0 010-.07c0-.02.01-.04.06-.08L466.75 512 338.88 384.14a.27.27 0 01-.05-.06l-.01-.02a.12.12 0 010-.07c0-.03.01-.05.05-.09l45.02-45.02a.2.2 0 01.09-.05.12.12 0 01.07 0c.02 0 .04.01.08.06L512 466.75l127.86-127.86c.04-.05.06-.06.08-.06a.12.12 0 01.07 0z" /></svg>'
};
var ClockCircleOutline = {
  name: "clock-circle",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" /><path d="M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.6-3.7 1.8-8.7-1.8-11.2z" /></svg>'
};
var CloseCircleFill = {
  name: "close-circle",
  theme: "fill",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M512 64c247.4 0 448 200.6 448 448S759.4 960 512 960 64 759.4 64 512 264.6 64 512 64zm127.98 274.82h-.04l-.08.06L512 466.75 384.14 338.88c-.04-.05-.06-.06-.08-.06a.12.12 0 00-.07 0c-.03 0-.05.01-.09.05l-45.02 45.02a.2.2 0 00-.05.09.12.12 0 000 .07v.02a.27.27 0 00.06.06L466.75 512 338.88 639.86c-.05.04-.06.06-.06.08a.12.12 0 000 .07c0 .03.01.05.05.09l45.02 45.02a.2.2 0 00.09.05.12.12 0 00.07 0c.02 0 .04-.01.08-.05L512 557.25l127.86 127.87c.04.04.06.05.08.05a.12.12 0 00.07 0c.03 0 .05-.01.09-.05l45.02-45.02a.2.2 0 00.05-.09.12.12 0 000-.07v-.02a.27.27 0 00-.05-.06L557.25 512l127.87-127.86c.04-.04.05-.06.05-.08a.12.12 0 000-.07c0-.03-.01-.05-.05-.09l-45.02-45.02a.2.2 0 00-.09-.05.12.12 0 00-.07 0z" /></svg>'
};
var CloseOutline = {
  name: "close",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M799.86 166.31c.02 0 .04.02.08.06l57.69 57.7c.04.03.05.05.06.08a.12.12 0 010 .06c0 .03-.02.05-.06.09L569.93 512l287.7 287.7c.04.04.05.06.06.09a.12.12 0 010 .07c0 .02-.02.04-.06.08l-57.7 57.69c-.03.04-.05.05-.07.06a.12.12 0 01-.07 0c-.03 0-.05-.02-.09-.06L512 569.93l-287.7 287.7c-.04.04-.06.05-.09.06a.12.12 0 01-.07 0c-.02 0-.04-.02-.08-.06l-57.69-57.7c-.04-.03-.05-.05-.06-.07a.12.12 0 010-.07c0-.03.02-.05.06-.09L454.07 512l-287.7-287.7c-.04-.04-.05-.06-.06-.09a.12.12 0 010-.07c0-.02.02-.04.06-.08l57.7-57.69c.03-.04.05-.05.07-.06a.12.12 0 01.07 0c.03 0 .05.02.09.06L512 454.07l287.7-287.7c.04-.04.06-.05.09-.06a.12.12 0 01.07 0z" /></svg>'
};
var DeleteOutline = {
  name: "delete",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z" /></svg>'
};
var CopyOutline = {
  name: "copy",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M832 64H296c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h496v688c0 4.4 3.6 8 8 8h56c4.4 0 8-3.6 8-8V96c0-17.7-14.3-32-32-32zM704 192H192c-17.7 0-32 14.3-32 32v530.7c0 8.5 3.4 16.6 9.4 22.6l173.3 173.3c2.2 2.2 4.7 4 7.4 5.5v1.9h4.2c3.5 1.3 7.2 2 11 2H704c17.7 0 32-14.3 32-32V224c0-17.7-14.3-32-32-32zM350 856.2L263.9 770H350v86.2zM664 888H414V746c0-22.1-17.9-40-40-40H232V264h432v624z" /></svg>'
};
var DoubleLeftOutline = {
  name: "double-left",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M272.9 512l265.4-339.1c4.1-5.2.4-12.9-6.3-12.9h-77.3c-4.9 0-9.6 2.3-12.6 6.1L186.8 492.3a31.99 31.99 0 000 39.5l255.3 326.1c3 3.9 7.7 6.1 12.6 6.1H532c6.7 0 10.4-7.7 6.3-12.9L272.9 512zm304 0l265.4-339.1c4.1-5.2.4-12.9-6.3-12.9h-77.3c-4.9 0-9.6 2.3-12.6 6.1L490.8 492.3a31.99 31.99 0 000 39.5l255.3 326.1c3 3.9 7.7 6.1 12.6 6.1H836c6.7 0 10.4-7.7 6.3-12.9L576.9 512z" /></svg>'
};
var EditOutline = {
  name: "edit",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 000-14.1L694.9 114.9c-1.9-1.9-4.4-2.9-7.1-2.9s-5.2 1-7.1 2.9L256.8 538.8c-1.5 1.5-2.4 3.3-2.8 5.3l-29.5 168.2a33.5 33.5 0 009.4 29.8c6.6 6.4 14.9 9.9 23.8 9.9zm67.4-174.4L687.8 215l73.3 73.3-362.7 362.6-88.9 15.7 15.6-89zM880 836H144c-17.7 0-32 14.3-32 32v36c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-36c0-17.7-14.3-32-32-32z" /></svg>'
};
var DoubleRightOutline = {
  name: "double-right",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M533.2 492.3L277.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H188c-6.7 0-10.4 7.7-6.3 12.9L447.1 512 181.7 851.1A7.98 7.98 0 00188 864h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.1c9.1-11.7 9.1-27.9 0-39.5zm304 0L581.9 166.1c-3-3.9-7.7-6.1-12.6-6.1H492c-6.7 0-10.4 7.7-6.3 12.9L751.1 512 485.7 851.1A7.98 7.98 0 00492 864h77.3c4.9 0 9.6-2.3 12.6-6.1l255.3-326.1c9.1-11.7 9.1-27.9 0-39.5z" /></svg>'
};
var DownOutline = {
  name: "down",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M884 256h-75c-5.1 0-9.9 2.5-12.9 6.6L512 654.2 227.9 262.6c-3-4.1-7.8-6.6-12.9-6.6h-75c-6.5 0-10.3 7.4-6.5 12.7l352.6 486.1c12.8 17.6 39 17.6 51.7 0l352.6-486.1c3.9-5.3.1-12.7-6.4-12.7z" /></svg>'
};
var ExclamationCircleFill = {
  name: "exclamation-circle",
  theme: "fill",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm-32 232c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V296zm32 440a48.01 48.01 0 010-96 48.01 48.01 0 010 96z" /></svg>'
};
var EllipsisOutline = {
  name: "ellipsis",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M176 511a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0zm280 0a56 56 0 10112 0 56 56 0 10-112 0z" /></svg>'
};
var ExclamationCircleOutline = {
  name: "exclamation-circle",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" /><path d="M464 688a48 48 0 1096 0 48 48 0 10-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z" /></svg>'
};
var EyeOutline = {
  name: "eye",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M942.2 486.2C847.4 286.5 704.1 186 512 186c-192.2 0-335.4 100.5-430.2 300.3a60.3 60.3 0 000 51.5C176.6 737.5 319.9 838 512 838c192.2 0 335.4-100.5 430.2-300.3 7.7-16.2 7.7-35 0-51.5zM512 766c-161.3 0-279.4-81.8-362.7-254C232.6 339.8 350.7 258 512 258c161.3 0 279.4 81.8 362.7 254C791.5 684.2 673.4 766 512 766zm-4-430c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176zm0 288c-61.9 0-112-50.1-112-112s50.1-112 112-112 112 50.1 112 112-50.1 112-112 112z" /></svg>'
};
var FileFill = {
  name: "file",
  theme: "fill",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M854.6 288.7c6 6 9.4 14.1 9.4 22.6V928c0 17.7-14.3 32-32 32H192c-17.7 0-32-14.3-32-32V96c0-17.7 14.3-32 32-32h424.7c8.5 0 16.7 3.4 22.7 9.4l215.2 215.3zM790.2 326L602 137.8V326h188.2z" /></svg>'
};
var EyeInvisibleOutline = {
  name: "eye-invisible",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M942.2 486.2Q889.47 375.11 816.7 305l-50.88 50.88C807.31 395.53 843.45 447.4 874.7 512 791.5 684.2 673.4 766 512 766q-72.67 0-133.87-22.38L323 798.75Q408 838 512 838q288.3 0 430.2-300.3a60.29 60.29 0 000-51.5zm-63.57-320.64L836 122.88a8 8 0 00-11.32 0L715.31 232.2Q624.86 186 512 186q-288.3 0-430.2 300.3a60.3 60.3 0 000 51.5q56.69 119.4 136.5 191.41L112.48 835a8 8 0 000 11.31L155.17 889a8 8 0 0011.31 0l712.15-712.12a8 8 0 000-11.32zM149.3 512C232.6 339.8 350.7 258 512 258c54.54 0 104.13 9.36 149.12 28.39l-70.3 70.3a176 176 0 00-238.13 238.13l-83.42 83.42C223.1 637.49 183.3 582.28 149.3 512zm246.7 0a112.11 112.11 0 01146.2-106.69L401.31 546.2A112 112 0 01396 512z" /><path d="M508 624c-3.46 0-6.87-.16-10.25-.47l-52.82 52.82a176.09 176.09 0 00227.42-227.42l-52.82 52.82c.31 3.38.47 6.79.47 10.25a111.94 111.94 0 01-112 112z" /></svg>'
};
var FileOutline = {
  name: "file",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M854.6 288.6L639.4 73.4c-6-6-14.1-9.4-22.6-9.4H192c-17.7 0-32 14.3-32 32v832c0 17.7 14.3 32 32 32h640c17.7 0 32-14.3 32-32V311.3c0-8.5-3.4-16.7-9.4-22.7zM790.2 326H602V137.8L790.2 326zm1.8 562H232V136h302v216a42 42 0 0042 42h216v494z" /></svg>'
};
var FilterFill = {
  name: "filter",
  theme: "fill",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M349 838c0 17.7 14.2 32 31.8 32h262.4c17.6 0 31.8-14.3 31.8-32V642H349v196zm531.1-684H143.9c-24.5 0-39.8 26.7-27.5 48l221.3 376h348.8l221.3-376c12.1-21.3-3.2-48-27.7-48z" /></svg>'
};
var InfoCircleOutline = {
  name: "info-circle",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" /><path d="M464 336a48 48 0 1096 0 48 48 0 10-96 0zm72 112h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V456c0-4.4-3.6-8-8-8z" /></svg>'
};
var InfoCircleFill = {
  name: "info-circle",
  theme: "fill",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48.01 48.01 0 010-96 48.01 48.01 0 010 96z" /></svg>'
};
var LeftOutline = {
  name: "left",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M724 218.3V141c0-6.7-7.7-10.4-12.9-6.3L260.3 486.8a31.86 31.86 0 000 50.3l450.8 352.1c5.3 4.1 12.9.4 12.9-6.3v-77.3c0-4.9-2.3-9.6-6.1-12.6l-360-281 360-281.1c3.8-3 6.1-7.7 6.1-12.6z" /></svg>'
};
var LoadingOutline = {
  name: "loading",
  theme: "outline",
  icon: '<svg viewBox="0 0 1024 1024" focusable="false"><path d="M988 548c-19.9 0-36-16.1-36-36 0-59.4-11.6-117-34.6-171.3a440.45 440.45 0 00-94.3-139.9 437.71 437.71 0 00-139.9-94.3C629 83.6 571.4 72 512 72c-19.9 0-36-16.1-36-36s16.1-36 36-36c69.1 0 136.2 13.5 199.3 40.3C772.3 66 827 103 874 150c47 47 83.9 101.8 109.7 162.7 26.7 63.1 40.2 130.2 40.2 199.3.1 19.9-16 36-35.9 36z" /></svg>'
};
var PaperClipOutline = {
  name: "paper-clip",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M779.3 196.6c-94.2-94.2-247.6-94.2-341.7 0l-261 260.8c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0012.7 0l261-260.8c32.4-32.4 75.5-50.2 121.3-50.2s88.9 17.8 121.2 50.2c32.4 32.4 50.2 75.5 50.2 121.2 0 45.8-17.8 88.8-50.2 121.2l-266 265.9-43.1 43.1c-40.3 40.3-105.8 40.3-146.1 0-19.5-19.5-30.2-45.4-30.2-73s10.7-53.5 30.2-73l263.9-263.8c6.7-6.6 15.5-10.3 24.9-10.3h.1c9.4 0 18.1 3.7 24.7 10.3 6.7 6.7 10.3 15.5 10.3 24.9 0 9.3-3.7 18.1-10.3 24.7L372.4 653c-1.7 1.7-2.6 4-2.6 6.4s.9 4.7 2.6 6.4l36.9 36.9a9 9 0 0012.7 0l215.6-215.6c19.9-19.9 30.8-46.3 30.8-74.4s-11-54.6-30.8-74.4c-41.1-41.1-107.9-41-149 0L463 364 224.8 602.1A172.22 172.22 0 00174 724.8c0 46.3 18.1 89.8 50.8 122.5 33.9 33.8 78.3 50.7 122.7 50.7 44.4 0 88.8-16.9 122.6-50.7l309.2-309C824.8 492.7 850 432 850 367.5c.1-64.6-25.1-125.3-70.7-170.9z" /></svg>'
};
var QuestionCircleOutline = {
  name: "question-circle",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z" /><path d="M623.6 316.7C593.6 290.4 554 276 512 276s-81.6 14.5-111.6 40.7C369.2 344 352 380.7 352 420v7.6c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V420c0-44.1 43.1-80 96-80s96 35.9 96 80c0 31.1-22 59.6-56.1 72.7-21.2 8.1-39.2 22.3-52.1 40.9-13.1 19-19.9 41.8-19.9 64.9V620c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-22.7a48.3 48.3 0 0130.9-44.8c59-22.7 97.1-74.7 97.1-132.5.1-39.3-17.1-76-48.3-103.3zM472 732a40 40 0 1080 0 40 40 0 10-80 0z" /></svg>'
};
var RightOutline = {
  name: "right",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M765.7 486.8L314.9 134.7A7.97 7.97 0 00302 141v77.3c0 4.9 2.3 9.6 6.1 12.6l360 281.1-360 281.1c-3.9 3-6.1 7.7-6.1 12.6V883c0 6.7 7.7 10.4 12.9 6.3l450.8-352.1a31.96 31.96 0 000-50.4z" /></svg>'
};
var RotateRightOutline = {
  name: "rotate-right",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M480.5 251.2c13-1.6 25.9-2.4 38.8-2.5v63.9c0 6.5 7.5 10.1 12.6 6.1L660 217.6c4-3.2 4-9.2 0-12.3l-128-101c-5.1-4-12.6-.4-12.6 6.1l-.2 64c-118.6.5-235.8 53.4-314.6 154.2A399.75 399.75 0 00123.5 631h74.9c-.9-5.3-1.7-10.7-2.4-16.1-5.1-42.1-2.1-84.1 8.9-124.8 11.4-42.2 31-81.1 58.1-115.8 27.2-34.7 60.3-63.2 98.4-84.3 37-20.6 76.9-33.6 119.1-38.8z" /><path d="M880 418H352c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H396V494h440v326z" /></svg>'
};
var SearchOutline = {
  name: "search",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M909.6 854.5L649.9 594.8C690.2 542.7 712 479 712 412c0-80.2-31.3-155.4-87.9-212.1-56.6-56.7-132-87.9-212.1-87.9s-155.5 31.3-212.1 87.9C143.2 256.5 112 331.8 112 412c0 80.1 31.3 155.5 87.9 212.1C256.5 680.8 331.8 712 412 712c67 0 130.6-21.8 182.7-62l259.7 259.6a8.2 8.2 0 0011.6 0l43.6-43.5a8.2 8.2 0 000-11.6zM570.4 570.4C528 612.7 471.8 636 412 636s-116-23.3-158.4-65.6C211.3 528 188 471.8 188 412s23.3-116.1 65.6-158.4C296 211.3 352.2 188 412 188s116.1 23.2 158.4 65.6S636 352.2 636 412s-23.3 116.1-65.6 158.4z" /></svg>'
};
var RotateLeftOutline = {
  name: "rotate-left",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M672 418H144c-17.7 0-32 14.3-32 32v414c0 17.7 14.3 32 32 32h528c17.7 0 32-14.3 32-32V450c0-17.7-14.3-32-32-32zm-44 402H188V494h440v326z" /><path d="M819.3 328.5c-78.8-100.7-196-153.6-314.6-154.2l-.2-64c0-6.5-7.6-10.1-12.6-6.1l-128 101c-4 3.1-3.9 9.1 0 12.3L492 318.6c5.1 4 12.7.4 12.6-6.1v-63.9c12.9.1 25.9.9 38.8 2.5 42.1 5.2 82.1 18.2 119 38.7 38.1 21.2 71.2 49.7 98.4 84.3 27.1 34.7 46.7 73.7 58.1 115.8a325.95 325.95 0 016.5 140.9h74.9c14.8-103.6-11.3-213-81-302.3z" /></svg>'
};
var StarFill = {
  name: "star",
  theme: "fill",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M908.1 353.1l-253.9-36.9L540.7 86.1c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L369.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 00.6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0046.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z" /></svg>'
};
var SwapRightOutline = {
  name: "swap-right",
  theme: "outline",
  icon: '<svg viewBox="0 0 1024 1024" focusable="false"><path d="M873.1 596.2l-164-208A32 32 0 00684 376h-64.8c-6.7 0-10.4 7.7-6.3 13l144.3 183H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h695.9c26.8 0 41.7-30.8 25.2-51.8z" /></svg>'
};
var SwapOutline = {
  name: "swap",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M847.9 592H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h605.2L612.9 851c-4.1 5.2-.4 13 6.3 13h72.5c4.9 0 9.5-2.2 12.6-6.1l168.8-214.1c16.5-21 1.6-51.8-25.2-51.8zM872 356H266.8l144.3-183c4.1-5.2.4-13-6.3-13h-72.5c-4.9 0-9.5 2.2-12.6 6.1L150.9 380.2c-16.5 21-1.6 51.8 25.1 51.8h696c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8z" /></svg>'
};
var UpOutline = {
  name: "up",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M890.5 755.3L537.9 269.2c-12.8-17.6-39-17.6-51.7 0L133.5 755.3A8 8 0 00140 768h75c5.1 0 9.9-2.5 12.9-6.6L512 369.8l284.1 391.6c3 4.1 7.8 6.6 12.9 6.6h75c6.5 0 10.3-7.4 6.5-12.7z" /></svg>'
};
var UploadOutline = {
  name: "upload",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M400 317.7h73.9V656c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V317.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 163a8 8 0 00-12.6 0l-112 141.7c-4.1 5.3-.4 13 6.3 13zM878 626h-60c-4.4 0-8 3.6-8 8v154H214V634c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v198c0 17.7 14.3 32 32 32h684c17.7 0 32-14.3 32-32V634c0-4.4-3.6-8-8-8z" /></svg>'
};
var VerticalAlignTopOutline = {
  name: "vertical-align-top",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M859.9 168H164.1c-4.5 0-8.1 3.6-8.1 8v60c0 4.4 3.6 8 8.1 8h695.8c4.5 0 8.1-3.6 8.1-8v-60c0-4.4-3.6-8-8.1-8zM518.3 355a8 8 0 00-12.6 0l-112 141.7a7.98 7.98 0 006.3 12.9h73.9V848c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V509.7H624c6.7 0 10.4-7.7 6.3-12.9L518.3 355z" /></svg>'
};
var ZoomOutOutline = {
  name: "zoom-out",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M637 443H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h312c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm284 424L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z" /></svg>'
};
var ZoomInOutline = {
  name: "zoom-in",
  theme: "outline",
  icon: '<svg viewBox="64 64 896 896" focusable="false"><path d="M637 443H519V309c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v134H325c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h118v134c0 4.4 3.6 8 8 8h60c4.4 0 8-3.6 8-8V519h118c4.4 0 8-3.6 8-8v-60c0-4.4-3.6-8-8-8zm284 424L775 721c122.1-148.9 113.6-369.5-26-509-148-148.1-388.4-148.1-537 0-148.1 148.6-148.1 389 0 537 139.5 139.6 360.1 148.1 509 26l146 146c3.2 2.8 8.3 2.8 11 0l43-43c2.8-2.7 2.8-7.8 0-11zM696 696c-118.8 118.7-311.2 118.7-430 0-118.7-118.8-118.7-311.2 0-430 118.8-118.7 311.2-118.7 430 0 118.7 118.8 118.7 311.2 0 430z" /></svg>'
};

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-icon.mjs
var NZ_ICONS_USED_BY_ZORRO = [BarsOutline, CalendarOutline, CaretUpFill, CaretUpOutline, CaretDownFill, CaretDownOutline, CheckCircleFill, CheckCircleOutline, CheckOutline, ClockCircleOutline, CloseCircleOutline, CloseCircleFill, CloseOutline, CopyOutline, DeleteOutline, DoubleLeftOutline, DoubleRightOutline, DownOutline, EditOutline, EllipsisOutline, ExclamationCircleFill, ExclamationCircleOutline, EyeOutline, EyeInvisibleOutline, FileFill, FileOutline, FilterFill, InfoCircleFill, InfoCircleOutline, LeftOutline, LoadingOutline, PaperClipOutline, QuestionCircleOutline, RightOutline, RotateRightOutline, RotateLeftOutline, StarFill, SearchOutline, StarFill, UploadOutline, VerticalAlignTopOutline, UpOutline, SwapOutline, SwapRightOutline, ZoomInOutline, ZoomOutOutline];
var NZ_ICONS = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "nz-icons" : "");
var NZ_ICON_DEFAULT_TWOTONE_COLOR = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "nz-icon-default-twotone-color" : "");
var DEFAULT_TWOTONE_COLOR = "#1890ff";
var NzIconService = class _NzIconService extends IconService {
  nzConfigService = inject(NzConfigService);
  platform = inject(Platform);
  configUpdated$ = new Subject();
  get _disableDynamicLoading() {
    return !this.platform.isBrowser;
  }
  iconfontCache = /* @__PURE__ */ new Set();
  normalizeSvgElement(svg) {
    if (!svg.getAttribute("viewBox")) {
      this._renderer.setAttribute(svg, "viewBox", "0 0 1024 1024");
    }
    if (!svg.getAttribute("width") || !svg.getAttribute("height")) {
      this._renderer.setAttribute(svg, "width", "1em");
      this._renderer.setAttribute(svg, "height", "1em");
    }
    if (!svg.getAttribute("fill")) {
      this._renderer.setAttribute(svg, "fill", "currentColor");
    }
  }
  fetchFromIconfont(opt) {
    const {
      scriptUrl
    } = opt;
    if (this._document && !this.iconfontCache.has(scriptUrl)) {
      const script = this._renderer.createElement("script");
      this._renderer.setAttribute(script, "src", scriptUrl);
      this._renderer.setAttribute(script, "data-namespace", scriptUrl.replace(/^(https?|http):/g, ""));
      this._renderer.appendChild(this._document.body, script);
      this.iconfontCache.add(scriptUrl);
    }
  }
  createIconfontIcon(type) {
    return this._createSVGElementFromString(`<svg><use xlink:href="${type}"></svg>`);
  }
  constructor() {
    super([...NZ_ICONS_USED_BY_ZORRO, ...inject(NZ_ICONS, {
      optional: true
    }) || []]);
    this.onConfigChange();
    this.configDefaultTwotoneColor();
    this.configDefaultTheme();
  }
  onConfigChange() {
    onConfigChangeEventForComponent("icon", () => {
      this.configDefaultTwotoneColor();
      this.configDefaultTheme();
      this.configUpdated$.next();
    });
  }
  configDefaultTheme() {
    const iconConfig = this.getConfig();
    this.defaultTheme = iconConfig.nzTheme || "outline";
  }
  configDefaultTwotoneColor() {
    const iconConfig = this.getConfig();
    const defaultTwotoneColor = iconConfig.nzTwotoneColor || DEFAULT_TWOTONE_COLOR;
    let primaryColor = DEFAULT_TWOTONE_COLOR;
    if (defaultTwotoneColor) {
      if (defaultTwotoneColor.startsWith("#")) {
        primaryColor = defaultTwotoneColor;
      } else {
        warn("Twotone color must be a hex color!");
      }
    }
    this.twoToneColor = {
      primaryColor
    };
  }
  getConfig() {
    return this.nzConfigService.getConfigForComponent("icon") || {};
  }
  static ɵfac = function NzIconService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzIconService)();
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzIconService,
    factory: _NzIconService.ɵfac,
    providedIn: "root"
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzIconService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], () => [], null);
})();
var NZ_ICONS_PATCH = new InjectionToken("nz_icons_patch");
var NzIconPatchService = class _NzIconPatchService {
  rootIconService;
  patched = false;
  extraIcons = inject(NZ_ICONS_PATCH, {
    self: true
  });
  constructor(rootIconService) {
    this.rootIconService = rootIconService;
  }
  doPatch() {
    if (this.patched) {
      return;
    }
    this.extraIcons.forEach((iconDefinition) => this.rootIconService.addIcon(iconDefinition));
    this.patched = true;
  }
  static ɵfac = function NzIconPatchService_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzIconPatchService)(ɵɵinject(NzIconService));
  };
  static ɵprov = ɵɵdefineInjectable({
    token: _NzIconPatchService,
    factory: _NzIconPatchService.ɵfac
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzIconPatchService, [{
    type: Injectable
  }], () => [{
    type: NzIconService
  }], null);
})();
var NzIconDirective = class _NzIconDirective extends IconDirective {
  iconService;
  ngZone = inject(NgZone);
  changeDetectorRef = inject(ChangeDetectorRef);
  renderer = inject(Renderer2);
  destroyRef = inject(DestroyRef);
  pendingTasks = inject(PendingTasks);
  isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  nzSpin = false;
  nzRotate = 0;
  set nzType(value) {
    this.type = value;
  }
  set nzTheme(value) {
    this.theme = value;
  }
  set nzTwotoneColor(value) {
    this.twoToneColor = value;
  }
  set nzIconfont(value) {
    this.iconfont = value;
  }
  hostClass;
  el;
  iconfont;
  constructor(iconService) {
    super(iconService);
    this.iconService = iconService;
    inject(NzIconPatchService, {
      optional: true
    })?.doPatch();
    this.el = this._elementRef.nativeElement;
  }
  ngOnChanges(changes) {
    const {
      nzType,
      nzTwotoneColor,
      nzTheme,
      nzRotate,
      nzSpin
    } = changes;
    if (nzType || nzTwotoneColor || nzTheme || nzSpin) {
      this.ngZone.runOutsideAngular(() => this.changeIcon2());
    } else if (nzRotate) {
      this.handleRotate(this.el.firstChild);
    } else {
      this._setSVGElement(this.iconService.createIconfontIcon(`#${this.iconfont}`));
    }
  }
  /**
   * If custom content is provided, try to normalize SVG elements.
   */
  ngAfterContentChecked() {
    if (!this.type) {
      const children = this.el.children;
      let length = children.length;
      if (!this.type && children.length) {
        while (length--) {
          const child = children[length];
          if (child.tagName.toLowerCase() === "svg") {
            this.iconService.normalizeSvgElement(child);
          }
        }
      }
    }
  }
  /**
   * Replacement of `changeIcon` for more modifications.
   */
  changeIcon2() {
    const removeTask = this.pendingTasks.add();
    const svgOrRemove$ = wrapIntoObservable(this._changeIcon()).pipe(
      // We need to individually debounce the icon rendering on each animation
      // frame to prevent frame drops when many icons are being rendered on the
      // page, such as in a `@for` loop.
      debounceTime(0, this.isBrowser ? animationFrameScheduler : asapScheduler),
      takeUntilDestroyed(this.destroyRef),
      finalize(removeTask)
    );
    svgOrRemove$.subscribe({
      next: (svgOrRemove) => {
        this.ngZone.run(() => {
          this.changeDetectorRef.detectChanges();
          if (svgOrRemove) {
            this.setSVGData(svgOrRemove);
            this.handleRotate(svgOrRemove);
          }
        });
      },
      error: warn
    });
  }
  handleRotate(svg) {
    if (this.nzRotate) {
      this.renderer.setAttribute(svg, "style", `transform: rotate(${this.nzRotate}deg)`);
    } else {
      this.renderer.removeAttribute(svg, "style");
    }
  }
  setSVGData(svg) {
    this.renderer.setAttribute(svg, "data-icon", this.type);
    this.renderer.setAttribute(svg, "aria-hidden", "true");
  }
  static ɵfac = function NzIconDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzIconDirective)(ɵɵdirectiveInject(NzIconService));
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzIconDirective,
    selectors: [["nz-icon"], ["", "nz-icon", ""]],
    hostAttrs: ["role", "img", 1, "anticon"],
    hostVars: 5,
    hostBindings: function NzIconDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵattribute("aria-label", ctx.type);
        ɵɵclassMap("anticon-" + ctx.type);
        ɵɵclassProp("anticon-spin", ctx.nzSpin || ctx.type === "loading");
      }
    },
    inputs: {
      nzSpin: [2, "nzSpin", "nzSpin", booleanAttribute],
      nzRotate: [2, "nzRotate", "nzRotate", numberAttribute],
      nzType: "nzType",
      nzTheme: "nzTheme",
      nzTwotoneColor: "nzTwotoneColor",
      nzIconfont: "nzIconfont"
    },
    exportAs: ["nzIcon"],
    features: [ɵɵInheritDefinitionFeature, ɵɵNgOnChangesFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzIconDirective, [{
    type: Directive,
    args: [{
      selector: "nz-icon,[nz-icon]",
      exportAs: "nzIcon",
      host: {
        class: "anticon",
        "[class]": `'anticon-' + type`,
        "[class.anticon-spin]": `nzSpin || type === 'loading'`,
        role: "img",
        "[attr.aria-label]": "type"
      }
    }]
  }], () => [{
    type: NzIconService
  }], {
    nzSpin: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzRotate: [{
      type: Input,
      args: [{
        transform: numberAttribute
      }]
    }],
    nzType: [{
      type: Input
    }],
    nzTheme: [{
      type: Input
    }],
    nzTwotoneColor: [{
      type: Input
    }],
    nzIconfont: [{
      type: Input
    }]
  });
})();
var provideNzIcons = (icons) => {
  return makeEnvironmentProviders([{
    provide: NZ_ICONS,
    useValue: icons
  }]);
};
var provideNzIconsPatch = (icons) => {
  return [NzIconPatchService, {
    provide: NZ_ICONS_PATCH,
    useValue: icons
  }];
};
var NzIconModule = class _NzIconModule {
  static forRoot(icons) {
    return {
      ngModule: _NzIconModule,
      providers: [provideNzIcons(icons)]
    };
  }
  static forChild(icons) {
    return {
      ngModule: _NzIconModule,
      providers: [provideNzIconsPatch(icons)]
    };
  }
  static ɵfac = function NzIconModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzIconModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzIconModule,
    imports: [NzIconDirective],
    exports: [NzIconDirective]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzIconModule, [{
    type: NgModule,
    args: [{
      imports: [NzIconDirective],
      exports: [NzIconDirective]
    }]
  }], null, null);
})();

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-core-outlet.mjs
var NzStringTemplateOutletDirective = class _NzStringTemplateOutletDirective {
  viewContainer = inject(ViewContainerRef);
  templateRef = inject(TemplateRef);
  embeddedViewRef = null;
  context = new NzStringTemplateOutletContext();
  nzStringTemplateOutletContext = null;
  nzStringTemplateOutlet = null;
  static ngTemplateContextGuard(_dir, _ctx) {
    return true;
  }
  recreateView() {
    this.viewContainer.clear();
    if (isTemplateRef(this.nzStringTemplateOutlet)) {
      this.embeddedViewRef = this.viewContainer.createEmbeddedView(this.nzStringTemplateOutlet, this.nzStringTemplateOutletContext);
    } else {
      this.embeddedViewRef = this.viewContainer.createEmbeddedView(this.templateRef, this.context);
    }
  }
  updateContext() {
    const newCtx = isTemplateRef(this.nzStringTemplateOutlet) ? this.nzStringTemplateOutletContext : this.context;
    const oldCtx = this.embeddedViewRef.context;
    if (newCtx) {
      for (const propName of Object.keys(newCtx)) {
        oldCtx[propName] = newCtx[propName];
      }
    }
  }
  ngOnChanges(changes) {
    const {
      nzStringTemplateOutletContext,
      nzStringTemplateOutlet
    } = changes;
    const shouldRecreateView = () => {
      let shouldOutletRecreate = false;
      if (nzStringTemplateOutlet) {
        shouldOutletRecreate = nzStringTemplateOutlet.firstChange || isTemplateRef(nzStringTemplateOutlet.previousValue) || isTemplateRef(nzStringTemplateOutlet.currentValue);
      }
      const hasContextShapeChanged = (ctxChange) => {
        const prevCtxKeys = Object.keys(ctxChange.previousValue || {});
        const currCtxKeys = Object.keys(ctxChange.currentValue || {});
        if (prevCtxKeys.length === currCtxKeys.length) {
          for (const propName of currCtxKeys) {
            if (prevCtxKeys.indexOf(propName) === -1) {
              return true;
            }
          }
          return false;
        } else {
          return true;
        }
      };
      const shouldContextRecreate = nzStringTemplateOutletContext && hasContextShapeChanged(nzStringTemplateOutletContext);
      return shouldContextRecreate || shouldOutletRecreate;
    };
    if (nzStringTemplateOutlet) {
      this.context.$implicit = nzStringTemplateOutlet.currentValue;
    }
    const recreateView = shouldRecreateView();
    if (recreateView) {
      this.recreateView();
    } else {
      this.updateContext();
    }
  }
  static ɵfac = function NzStringTemplateOutletDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzStringTemplateOutletDirective)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzStringTemplateOutletDirective,
    selectors: [["", "nzStringTemplateOutlet", ""]],
    inputs: {
      nzStringTemplateOutletContext: "nzStringTemplateOutletContext",
      nzStringTemplateOutlet: "nzStringTemplateOutlet"
    },
    exportAs: ["nzStringTemplateOutlet"],
    features: [ɵɵNgOnChangesFeature]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzStringTemplateOutletDirective, [{
    type: Directive,
    args: [{
      selector: "[nzStringTemplateOutlet]",
      exportAs: "nzStringTemplateOutlet"
    }]
  }], null, {
    nzStringTemplateOutletContext: [{
      type: Input
    }],
    nzStringTemplateOutlet: [{
      type: Input
    }]
  });
})();
var NzStringTemplateOutletContext = class {
  $implicit;
};
var NzOutletModule = class _NzOutletModule {
  static ɵfac = function NzOutletModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzOutletModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzOutletModule,
    imports: [NzStringTemplateOutletDirective],
    exports: [NzStringTemplateOutletDirective]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzOutletModule, [{
    type: NgModule,
    args: [{
      imports: [NzStringTemplateOutletDirective],
      exports: [NzStringTemplateOutletDirective]
    }]
  }], null, null);
})();

// node_modules/ng-zorro-antd/fesm2022/ng-zorro-antd-space.mjs
var _c0 = ["*"];
var _c1 = (a0) => ({
  $implicit: a0
});
function NzSpaceComponent_For_2_Conditional_2_ng_template_1_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵtext(0);
  }
  if (rf & 2) {
    const ctx_r0 = ɵɵnextContext(3);
    ɵɵtextInterpolate(ctx_r0.nzSplit);
  }
}
function NzSpaceComponent_For_2_Conditional_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "span", 2);
    ɵɵtemplate(1, NzSpaceComponent_For_2_Conditional_2_ng_template_1_Template, 1, 1, "ng-template", 3);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    const ɵ$index_2_r2 = ɵɵnextContext().$index;
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("nzStringTemplateOutlet", ctx_r0.nzSplit)("nzStringTemplateOutletContext", ɵɵpureFunction1(2, _c1, ɵ$index_2_r2));
  }
}
function NzSpaceComponent_For_2_Template(rf, ctx) {
  if (rf & 1) {
    ɵɵelementStart(0, "div", 0);
    ɵɵelementContainer(1, 1);
    ɵɵelementEnd();
    ɵɵconditionalCreate(2, NzSpaceComponent_For_2_Conditional_2_Template, 2, 4, "span", 2);
  }
  if (rf & 2) {
    const item_r3 = ctx.$implicit;
    const ɵ$index_2_r2 = ctx.$index;
    const ɵ$count_2_r4 = ctx.$count;
    const ctx_r0 = ɵɵnextContext();
    ɵɵadvance();
    ɵɵproperty("ngTemplateOutlet", item_r3);
    ɵɵadvance();
    ɵɵconditional(ctx_r0.nzSplit && !(ɵ$index_2_r2 === ɵ$count_2_r4 - 1) ? 2 : -1);
  }
}
var NZ_SPACE_COMPACT_SIZE = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "nz-space-compact-size" : "");
var NZ_SPACE_COMPACT_ITEMS = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "nz-space-compact-items" : "");
var NZ_SPACE_COMPACT_ITEM_TYPE = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "nz-space-compact-item-type" : "");
var NzSpaceCompactComponent = class _NzSpaceCompactComponent {
  nzBlock = input(false, ...ngDevMode ? [{
    debugName: "nzBlock",
    transform: booleanAttribute
  }] : [{
    transform: booleanAttribute
  }]);
  nzDirection = input("horizontal", ...ngDevMode ? [{
    debugName: "nzDirection"
  }] : []);
  nzSize = input("default", ...ngDevMode ? [{
    debugName: "nzSize"
  }] : []);
  elementRef = inject(ElementRef);
  static ɵfac = function NzSpaceCompactComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSpaceCompactComponent)();
  };
  static ɵcmp = ɵɵdefineComponent({
    type: _NzSpaceCompactComponent,
    selectors: [["nz-space-compact"]],
    hostAttrs: [1, "ant-space-compact"],
    hostVars: 4,
    hostBindings: function NzSpaceCompactComponent_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassProp("ant-space-compact-block", ctx.nzBlock())("ant-space-compact-vertical", ctx.nzDirection() === "vertical");
      }
    },
    inputs: {
      nzBlock: [1, "nzBlock"],
      nzDirection: [1, "nzDirection"],
      nzSize: [1, "nzSize"]
    },
    exportAs: ["nzSpaceCompact"],
    features: [ɵɵProvidersFeature([{
      provide: NZ_SPACE_COMPACT_SIZE,
      useFactory: () => inject(_NzSpaceCompactComponent).nzSize
    }, {
      provide: NZ_SPACE_COMPACT_ITEMS,
      useFactory: () => signal([])
    }])],
    ngContentSelectors: _c0,
    decls: 1,
    vars: 0,
    template: function NzSpaceCompactComponent_Template(rf, ctx) {
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
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSpaceCompactComponent, [{
    type: Component,
    args: [{
      selector: "nz-space-compact",
      exportAs: "nzSpaceCompact",
      template: `<ng-content></ng-content>`,
      host: {
        class: "ant-space-compact",
        "[class.ant-space-compact-block]": `nzBlock()`,
        "[class.ant-space-compact-vertical]": `nzDirection() === 'vertical'`
      },
      providers: [{
        provide: NZ_SPACE_COMPACT_SIZE,
        useFactory: () => inject(NzSpaceCompactComponent).nzSize
      }, {
        provide: NZ_SPACE_COMPACT_ITEMS,
        useFactory: () => signal([])
      }],
      changeDetection: ChangeDetectionStrategy.OnPush
    }]
  }], null, {
    nzBlock: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "nzBlock",
        required: false
      }]
    }],
    nzDirection: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "nzDirection",
        required: false
      }]
    }],
    nzSize: [{
      type: Input,
      args: [{
        isSignal: true,
        alias: "nzSize",
        required: false
      }]
    }]
  });
})();
var NzSpaceCompactItemDirective = class _NzSpaceCompactItemDirective {
  /**
   * Ancestor component injected from the parent.
   * Note that it is not necessarily the direct parent component.
   */
  spaceCompactCmp = inject(NzSpaceCompactComponent, {
    host: true,
    optional: true
  });
  items = inject(NZ_SPACE_COMPACT_ITEMS, {
    host: true,
    optional: true
  });
  type = inject(NZ_SPACE_COMPACT_ITEM_TYPE);
  elementRef = inject(ElementRef);
  directionality = inject(Directionality);
  dir = toSignal(this.directionality.change, {
    initialValue: this.directionality.value
  });
  get parentElement() {
    return this.elementRef.nativeElement?.parentElement;
  }
  class = computed(() => {
    if (!this.spaceCompactCmp || !this.items) return null;
    if (this.parentElement !== this.spaceCompactCmp.elementRef.nativeElement) return null;
    const items = this.items();
    const direction = this.spaceCompactCmp.nzDirection();
    const classes = [compactItemClassOf(this.type, direction, this.dir() === "rtl")];
    const index = items.indexOf(this);
    const firstIndex = items.findIndex((element) => element);
    if (index === firstIndex) {
      classes.push(compactFirstItemClassOf(this.type, direction));
    }
    if (index === items.length - 1) {
      classes.push(compactLastItemClassOf(this.type, direction));
    }
    return classes;
  }, ...ngDevMode ? [{
    debugName: "class"
  }] : []);
  constructor() {
    if (!this.spaceCompactCmp || !this.items) return;
    afterNextRender(() => {
      if (this.parentElement === this.spaceCompactCmp.elementRef.nativeElement) {
        const index = Array.from(this.parentElement.children).indexOf(this.elementRef.nativeElement);
        this.items.update((value) => {
          const newValue = value.slice();
          newValue.splice(index, 0, this);
          return newValue;
        });
      }
    });
    inject(DestroyRef).onDestroy(() => {
      this.items?.update((value) => value.filter((o) => o !== this));
    });
  }
  static ɵfac = function NzSpaceCompactItemDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSpaceCompactItemDirective)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzSpaceCompactItemDirective,
    hostVars: 2,
    hostBindings: function NzSpaceCompactItemDirective_HostBindings(rf, ctx) {
      if (rf & 2) {
        ɵɵclassMap(ctx.class());
      }
    },
    exportAs: ["nzSpaceCompactItem"]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSpaceCompactItemDirective, [{
    type: Directive,
    args: [{
      exportAs: "nzSpaceCompactItem",
      host: {
        "[class]": "class()"
      }
    }]
  }], () => [], null);
})();
function generateCompactClass(type, direction, position) {
  const directionPrefix = direction === "vertical" ? "vertical-" : "";
  return `ant-${type}-compact-${directionPrefix}${position}`;
}
function compactItemClassOf(type, direction, rtl) {
  const rtlSuffix = rtl ? "-rtl" : "";
  return `${generateCompactClass(type, direction, "item")}${rtlSuffix}`;
}
function compactFirstItemClassOf(type, direction) {
  return generateCompactClass(type, direction, "first-item");
}
function compactLastItemClassOf(type, direction) {
  return generateCompactClass(type, direction, "last-item");
}
var NzSpaceItemDirective = class _NzSpaceItemDirective {
  static ɵfac = function NzSpaceItemDirective_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSpaceItemDirective)();
  };
  static ɵdir = ɵɵdefineDirective({
    type: _NzSpaceItemDirective,
    selectors: [["", "nzSpaceItem", ""]]
  });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSpaceItemDirective, [{
    type: Directive,
    args: [{
      selector: "[nzSpaceItem]"
    }]
  }], null, null);
})();
var NZ_CONFIG_MODULE_NAME = "space";
var SPACE_SIZE = {
  small: 8,
  middle: 16,
  large: 24
};
var NzSpaceComponent = (() => {
  let _nzSize_decorators;
  let _nzSize_initializers = [];
  let _nzSize_extraInitializers = [];
  return class NzSpaceComponent2 {
    static {
      const _metadata = typeof Symbol === "function" && Symbol.metadata ? /* @__PURE__ */ Object.create(null) : void 0;
      _nzSize_decorators = [WithConfig()];
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
      if (_metadata) Object.defineProperty(this, Symbol.metadata, {
        enumerable: true,
        configurable: true,
        writable: true,
        value: _metadata
      });
    }
    _nzModuleName = NZ_CONFIG_MODULE_NAME;
    nzConfigService = inject(NzConfigService);
    cdr = inject(ChangeDetectorRef);
    destroyRef = inject(DestroyRef);
    nzDirection = "horizontal";
    nzAlign;
    nzSplit = null;
    nzWrap = false;
    nzSize = __runInitializers(this, _nzSize_initializers, "small");
    items = __runInitializers(this, _nzSize_extraInitializers);
    mergedAlign;
    horizontalSize;
    verticalSize;
    constructor() {
      this.updateSpaceSize();
    }
    ngOnChanges(changes) {
      const {
        nzSize
      } = changes;
      if (nzSize) {
        this.updateSpaceSize();
      }
      this.mergedAlign = this.nzAlign === void 0 && this.nzDirection === "horizontal" ? "center" : this.nzAlign;
    }
    ngAfterContentInit() {
      this.items.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.cdr.markForCheck();
      });
    }
    updateSpaceSize() {
      const {
        horizontalSize,
        verticalSize
      } = normalizeSpaceSize(this.nzSize);
      this.horizontalSize = horizontalSize;
      this.verticalSize = verticalSize;
    }
    static ɵfac = function NzSpaceComponent_Factory(__ngFactoryType__) {
      return new (__ngFactoryType__ || NzSpaceComponent2)();
    };
    static ɵcmp = ɵɵdefineComponent({
      type: NzSpaceComponent2,
      selectors: [["nz-space"], ["", "nz-space", ""]],
      contentQueries: function NzSpaceComponent_ContentQueries(rf, ctx, dirIndex) {
        if (rf & 1) {
          ɵɵcontentQuery(dirIndex, NzSpaceItemDirective, 4, TemplateRef);
        }
        if (rf & 2) {
          let _t;
          ɵɵqueryRefresh(_t = ɵɵloadQuery()) && (ctx.items = _t);
        }
      },
      hostAttrs: [1, "ant-space"],
      hostVars: 18,
      hostBindings: function NzSpaceComponent_HostBindings(rf, ctx) {
        if (rf & 2) {
          ɵɵstyleProp("flex-wrap", ctx.nzWrap ? "wrap" : null)("column-gap", ctx.horizontalSize, "px")("row-gap", ctx.verticalSize, "px");
          ɵɵclassProp("ant-space-horizontal", ctx.nzDirection === "horizontal")("ant-space-vertical", ctx.nzDirection === "vertical")("ant-space-align-start", ctx.mergedAlign === "start")("ant-space-align-end", ctx.mergedAlign === "end")("ant-space-align-center", ctx.mergedAlign === "center")("ant-space-align-baseline", ctx.mergedAlign === "baseline");
        }
      },
      inputs: {
        nzDirection: "nzDirection",
        nzAlign: "nzAlign",
        nzSplit: "nzSplit",
        nzWrap: [2, "nzWrap", "nzWrap", booleanAttribute],
        nzSize: "nzSize"
      },
      exportAs: ["nzSpace"],
      features: [ɵɵNgOnChangesFeature],
      ngContentSelectors: _c0,
      decls: 3,
      vars: 0,
      consts: [[1, "ant-space-item"], [3, "ngTemplateOutlet"], [1, "ant-space-split"], [3, "nzStringTemplateOutlet", "nzStringTemplateOutletContext"]],
      template: function NzSpaceComponent_Template(rf, ctx) {
        if (rf & 1) {
          ɵɵprojectionDef();
          ɵɵprojection(0);
          ɵɵrepeaterCreate(1, NzSpaceComponent_For_2_Template, 3, 2, null, null, ɵɵrepeaterTrackByIdentity);
        }
        if (rf & 2) {
          ɵɵadvance();
          ɵɵrepeater(ctx.items);
        }
      },
      dependencies: [NgTemplateOutlet, NzStringTemplateOutletDirective],
      encapsulation: 2,
      changeDetection: 0
    });
  };
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSpaceComponent, [{
    type: Component,
    args: [{
      selector: "nz-space, [nz-space]",
      exportAs: "nzSpace",
      changeDetection: ChangeDetectionStrategy.OnPush,
      template: `
    <ng-content></ng-content>
    @for (item of items; track item; let last = $last; let index = $index) {
      <div class="ant-space-item">
        <ng-container [ngTemplateOutlet]="item"></ng-container>
      </div>
      @if (nzSplit && !last) {
        <span class="ant-space-split">
          <ng-template [nzStringTemplateOutlet]="nzSplit" [nzStringTemplateOutletContext]="{ $implicit: index }">{{
            nzSplit
          }}</ng-template>
        </span>
      }
    }
  `,
      host: {
        class: "ant-space",
        "[class.ant-space-horizontal]": 'nzDirection === "horizontal"',
        "[class.ant-space-vertical]": 'nzDirection === "vertical"',
        "[class.ant-space-align-start]": 'mergedAlign === "start"',
        "[class.ant-space-align-end]": 'mergedAlign === "end"',
        "[class.ant-space-align-center]": 'mergedAlign === "center"',
        "[class.ant-space-align-baseline]": 'mergedAlign === "baseline"',
        "[style.flex-wrap]": 'nzWrap ? "wrap" : null',
        "[style.column-gap.px]": "horizontalSize",
        "[style.row-gap.px]": "verticalSize"
      },
      imports: [NgTemplateOutlet, NzStringTemplateOutletDirective]
    }]
  }], () => [], {
    nzDirection: [{
      type: Input
    }],
    nzAlign: [{
      type: Input
    }],
    nzSplit: [{
      type: Input
    }],
    nzWrap: [{
      type: Input,
      args: [{
        transform: booleanAttribute
      }]
    }],
    nzSize: [{
      type: Input
    }],
    items: [{
      type: ContentChildren,
      args: [NzSpaceItemDirective, {
        read: TemplateRef
      }]
    }]
  });
})();
function normalizeSpaceSize(size) {
  const [horizontalSize, verticalSize] = (Array.isArray(size) ? size : [size, size]).map((s) => typeof s === "number" ? s : SPACE_SIZE[s]);
  return {
    horizontalSize,
    verticalSize
  };
}
var NzSpaceModule = class _NzSpaceModule {
  static ɵfac = function NzSpaceModule_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _NzSpaceModule)();
  };
  static ɵmod = ɵɵdefineNgModule({
    type: _NzSpaceModule,
    imports: [NzSpaceComponent, NzSpaceItemDirective, NzSpaceCompactComponent],
    exports: [NzSpaceComponent, NzSpaceItemDirective, NzSpaceCompactComponent]
  });
  static ɵinj = ɵɵdefineInjector({});
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NzSpaceModule, [{
    type: NgModule,
    args: [{
      imports: [NzSpaceComponent, NzSpaceItemDirective, NzSpaceCompactComponent],
      exports: [NzSpaceComponent, NzSpaceItemDirective, NzSpaceCompactComponent]
    }]
  }], null, null);
})();

export {
  NzConfigService,
  onConfigChangeEventForComponent,
  WithConfig,
  NzIconDirective,
  NzIconModule,
  NzStringTemplateOutletDirective,
  NzOutletModule,
  NZ_SPACE_COMPACT_SIZE,
  NZ_SPACE_COMPACT_ITEM_TYPE,
  NzSpaceCompactItemDirective
};
//# sourceMappingURL=chunk-JYWJFNL7.js.map
