import "./chunk-EIB7IA3J.js";

// node_modules/dlv/dist/dlv.es.js
function dlv_es_default(t3, e2, l3, n4, r4) {
  for (e2 = e2.split ? e2.split(".") : e2, n4 = 0; n4 < e2.length; n4++) t3 = t3 ? t3[e2[n4]] : r4;
  return t3 === r4 ? l3 : t3;
}

// node_modules/@analytics/type-utils/dist/analytics-util-types.module.js
var n = "function";
var t = "string";
var e = "undefined";
var r = "boolean";
var o = "object";
var u = "array";
var c = "number";
var i = "symbol";
var a = "null";
var m = "any";
var v = "*";
var O = "__";
var S = "form";
var j = "input";
var A = "button";
var E = "select";
var P = typeof process !== e ? process : {};
var x = P.env && P.env.NODE_ENV || "";
var $ = typeof document !== e;
var T = $ && "localhost" === window.location.hostname;
var _ = null != P.versions && null != P.versions.node;
var k = typeof Deno !== e && typeof Deno.core !== e;
var B = typeof self === o && self.constructor && "DedicatedWorkerGlobalScope" === self.constructor.name;
var G = $ && "nodejs" === window.name || typeof navigator !== e && typeof navigator.userAgent !== e && (navigator.userAgent.includes("Node.js") || navigator.userAgent.includes("jsdom"));
function M(n4, t3) {
  return t3.charAt(0)[n4]() + t3.slice(1);
}
var U = M.bind(null, "toUpperCase");
var H = M.bind(null, "toLowerCase");
function J(n4) {
  return Y(n4) ? U(a) : typeof n4 === o ? yn(n4) : Object.prototype.toString.call(n4).slice(8, -1);
}
function R(n4, t3) {
  void 0 === t3 && (t3 = true);
  var e2 = J(n4);
  return t3 ? H(e2) : e2;
}
function V(n4, t3) {
  return typeof t3 === n4;
}
var W = V.bind(null, n);
var q = V.bind(null, t);
var I = V.bind(null, e);
var Q = V.bind(null, r);
var X = V.bind(null, i);
function Y(n4) {
  return null === n4;
}
function nn(n4) {
  return R(n4) === c && !isNaN(n4);
}
function rn(n4) {
  return R(n4) === u;
}
function on(n4) {
  if (!un(n4)) return false;
  for (var t3 = n4; null !== Object.getPrototypeOf(t3); ) t3 = Object.getPrototypeOf(t3);
  return Object.getPrototypeOf(n4) === t3;
}
function un(n4) {
  return n4 && (typeof n4 === o || null !== n4);
}
function yn(n4) {
  return W(n4.constructor) ? n4.constructor.name : null;
}
function hn(n4) {
  return n4 instanceof Error || q(n4.message) && n4.constructor && nn(n4.constructor.stackTraceLimit);
}
function Sn(n4, t3) {
  if ("object" != typeof t3 || Y(t3)) return false;
  if (t3 instanceof n4) return true;
  var e2 = R(new n4(""));
  if (hn(t3)) for (; t3; ) {
    if (R(t3) === e2) return true;
    t3 = Object.getPrototypeOf(t3);
  }
  return false;
}
var jn = Sn.bind(null, TypeError);
var An = Sn.bind(null, SyntaxError);
function $n(n4, t3) {
  var e2 = n4 instanceof Element || n4 instanceof HTMLDocument;
  return e2 && t3 ? Tn(n4, t3) : e2;
}
function Tn(n4, t3) {
  return void 0 === t3 && (t3 = ""), n4 && n4.nodeName === t3.toUpperCase();
}
function _n(n4) {
  var t3 = [].slice.call(arguments, 1);
  return function() {
    return n4.apply(void 0, [].slice.call(arguments).concat(t3));
  };
}
var kn = _n($n, S);
var Bn = _n($n, A);
var Gn = _n($n, j);
var Mn = _n($n, E);

// node_modules/analytics-utils/dist/analytics-utils.module.js
function n2(e2) {
  try {
    return decodeURIComponent(e2.replace(/\+/g, " "));
  } catch (e3) {
    return null;
  }
}
function o2() {
  if ($) {
    var r4 = navigator, t3 = r4.languages;
    return r4.userLanguage || (t3 && t3.length ? t3[0] : r4.language);
  }
}
function a2() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e2) {
  }
}
function s(r4) {
  return (function(e2) {
    for (var r5, t3 = /* @__PURE__ */ Object.create(null), o4 = /([^&=]+)=?([^&]*)/g; r5 = o4.exec(e2); ) {
      var a6 = n2(r5[1]), i6 = n2(r5[2]);
      if (a6) if ("[]" === a6.substring(a6.length - 2)) {
        var u4 = t3[a6 = a6.substring(0, a6.length - 2)] || (t3[a6] = []);
        t3[a6] = Array.isArray(u4) ? u4 : [], t3[a6].push(i6);
      } else t3[a6] = "" === i6 || i6;
    }
    for (var c4 in t3) {
      var l3 = c4.split("[");
      l3.length > 1 && (m2(t3, l3.map(function(e3) {
        return e3.replace(/[?[\]\\ ]/g, "");
      }), t3[c4]), delete t3[c4]);
    }
    return t3;
  })((function(r5) {
    if (r5) {
      var t3 = r5.match(/\?(.*)/);
      return t3 && t3[1] ? t3[1].split("#")[0] : "";
    }
    return $ && window.location.search.substring(1);
  })(r4));
}
function m2(e2, r4, t3) {
  for (var n4 = r4.length - 1, o4 = 0; o4 < n4; ++o4) {
    var a6 = r4[o4];
    if ("__proto__" === a6 || "constructor" === a6) break;
    a6 in e2 || (e2[a6] = {}), e2 = e2[a6];
  }
  e2[r4[n4]] = t3;
}
function b() {
  for (var e2 = "", r4 = 0, t3 = 4294967295 * Math.random() | 0; r4++ < 36; ) {
    var n4 = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"[r4 - 1], o4 = 15 & t3;
    e2 += "-" == n4 || "4" == n4 ? n4 : ("x" == n4 ? o4 : 3 & o4 | 8).toString(16), t3 = r4 % 8 == 0 ? 4294967295 * Math.random() | 0 : t3 >> 4;
  }
  return e2;
}

// node_modules/@analytics/global-storage-utils/dist/analytics-util-global-storage.module.js
var n3 = "global";
var o3 = O + n3 + O;
var l = typeof self === o && self.self === self && self || typeof global === o && global[n3] === global && global || void 0;
function f(t3) {
  return l[o3][t3];
}
function a3(t3, e2) {
  return l[o3][t3] = e2;
}
function i2(t3) {
  delete l[o3][t3];
}
function u2(t3, e2, r4) {
  var n4;
  try {
    if (s2(t3)) {
      var o4 = window[t3];
      n4 = o4[e2].bind(o4);
    }
  } catch (t4) {
  }
  return n4 || r4;
}
l[o3] || (l[o3] = {});
var c2 = {};
function s2(t3) {
  if (typeof c2[t3] !== e) return c2[t3];
  try {
    var e2 = window[t3];
    e2.setItem(e, e), e2.removeItem(e);
  } catch (e3) {
    return c2[t3] = false;
  }
  return c2[t3] = true;
}

// node_modules/@analytics/core/dist/client/core.module.js
function h() {
  return h = Object.assign ? Object.assign.bind() : function(e2) {
    for (var n4 = 1; n4 < arguments.length; n4++) {
      var t3 = arguments[n4];
      for (var r4 in t3) ({}).hasOwnProperty.call(t3, r4) && (e2[r4] = t3[r4]);
    }
    return e2;
  }, h.apply(null, arguments);
}
var y = "function";
var b2 = "undefined";
var I2 = "reducer";
var w = "@@redux/";
var E2 = w + "INIT";
var P2 = w + Math.random().toString(36);
var S2 = (function() {
  return typeof Symbol === y && Symbol.observable || "@@observable";
})();
var N = " != " + y;
function O2(e2, n4, t3) {
  var r4;
  if (typeof n4 === y && typeof t3 === b2 && (t3 = n4, n4 = void 0), typeof t3 !== b2) {
    if (typeof t3 !== y) throw new Error("enhancer" + N);
    return t3(O2)(e2, n4);
  }
  if (typeof e2 !== y) throw new Error(I2 + N);
  var i6 = e2, a6 = n4, o4 = [], u4 = o4, c4 = false;
  function s4() {
    u4 === o4 && (u4 = o4.slice());
  }
  function f2() {
    return a6;
  }
  function d3(e3) {
    if (typeof e3 !== y) throw new Error("Listener" + N);
    var n5 = true;
    return s4(), u4.push(e3), function() {
      if (n5) {
        n5 = false, s4();
        var t4 = u4.indexOf(e3);
        u4.splice(t4, 1);
      }
    };
  }
  function p(e3) {
    if (!on(e3)) throw new Error("Act != obj");
    if (typeof e3.type === b2) throw new Error("ActType " + b2);
    if (c4) throw new Error("Dispatch in " + I2);
    try {
      c4 = true, a6 = i6(a6, e3);
    } finally {
      c4 = false;
    }
    for (var n5 = o4 = u4, t4 = 0; t4 < n5.length; t4++) (0, n5[t4])();
    return e3;
  }
  return p({ type: E2 }), (r4 = { dispatch: p, subscribe: d3, getState: f2, replaceReducer: function(e3) {
    if (typeof e3 !== y) throw new Error("next " + I2 + N);
    i6 = e3, p({ type: E2 });
  } })[S2] = function() {
    var e3, n5 = d3;
    return (e3 = { subscribe: function(e4) {
      if ("object" != typeof e4) throw new TypeError("Observer != obj");
      function t4() {
        e4.next && e4.next(f2());
      }
      return t4(), { unsubscribe: n5(t4) };
    } })[S2] = function() {
      return this;
    }, e3;
  }, r4;
}
function A2(e2, n4) {
  var t3 = n4 && n4.type;
  return "action " + (t3 && t3.toString() || "?") + I2 + " " + e2 + " returns " + b2;
}
function _2() {
  var e2 = [].slice.call(arguments);
  return 0 === e2.length ? function(e3) {
    return e3;
  } : 1 === e2.length ? e2[0] : e2.reduce(function(e3, n4) {
    return function() {
      return e3(n4.apply(void 0, [].slice.call(arguments)));
    };
  });
}
function k2() {
  var e2 = arguments;
  return function(n4) {
    return function(t3, r4, i6) {
      var a6, o4 = n4(t3, r4, i6), u4 = o4.dispatch, c4 = { getState: o4.getState, dispatch: function(e3) {
        return u4(e3);
      } };
      return a6 = [].slice.call(e2).map(function(e3) {
        return e3(c4);
      }), h({}, o4, { dispatch: u4 = _2.apply(void 0, a6)(o4.dispatch) });
    };
  };
}
var x2 = O + "anon_id";
var j2 = O + "user_id";
var T2 = O + "user_traits";
var z = { __proto__: null, ANON_ID: x2, USER_ID: j2, USER_TRAITS: T2 };
var M2 = "analytics";
var q2 = "userId";
var U2 = "anonymousId";
var V2 = ["bootstrap", "params", "campaign", "initializeStart", "initialize", "initializeEnd", "ready", "resetStart", "reset", "resetEnd", "pageStart", "page", "pageEnd", "pageAborted", "trackStart", "track", "trackEnd", "trackAborted", "identifyStart", "identify", "identifyEnd", "identifyAborted", "userIdChanged", "registerPlugins", "enablePlugin", "disablePlugin", "online", "offline", "setItemStart", "setItem", "setItemEnd", "setItemAborted", "removeItemStart", "removeItem", "removeItemEnd", "removeItemAborted"];
var L = ["name", "EVENTS", "config", "loaded"];
var C = V2.reduce(function(e2, n4) {
  return e2[n4] = n4, e2;
}, { registerPluginType: function(e2) {
  return "registerPlugin:" + e2;
}, pluginReadyType: function(e2) {
  return "ready:" + e2;
} });
var R2 = /^utm_/;
var $2 = /^an_prop_/;
var D = /^an_trait_/;
function B2(e2) {
  var n4 = e2.storage.setItem;
  return function(t3) {
    return function(r4) {
      return function(i6) {
        if (i6.type === C.bootstrap) {
          var a6 = i6.params, o4 = i6.user, u4 = i6.persistedUser, c4 = i6.initialUser, s4 = u4.userId === o4.userId;
          u4.anonymousId !== o4.anonymousId && n4(x2, o4.anonymousId), s4 || n4(j2, o4.userId), c4.traits && n4(T2, h({}, s4 && u4.traits ? u4.traits : {}, c4.traits));
          var l3 = Object.keys(i6.params);
          if (l3.length) {
            var f2 = a6.an_uid, d3 = a6.an_event, p = l3.reduce(function(e3, n5) {
              if (n5.match(R2) || n5.match(/^(d|g)clid/)) {
                var t4 = n5.replace(R2, "");
                e3.campaign["campaign" === t4 ? "name" : t4] = a6[n5];
              }
              return n5.match($2) && (e3.props[n5.replace($2, "")] = a6[n5]), n5.match(D) && (e3.traits[n5.replace(D, "")] = a6[n5]), e3;
            }, { campaign: {}, props: {}, traits: {} });
            t3.dispatch(h({ type: C.params, raw: a6 }, p, f2 ? { userId: f2 } : {})), f2 && setTimeout(function() {
              return e2.identify(f2, p.traits);
            }, 0), d3 && setTimeout(function() {
              return e2.track(d3, p.props);
            }, 0), Object.keys(p.campaign).length && t3.dispatch({ type: C.campaign, campaign: p.campaign });
          }
        }
        return r4(i6);
      };
    };
  };
}
function X2(e2) {
  return function(n4, t3) {
    if (void 0 === n4 && (n4 = {}), void 0 === t3 && (t3 = {}), t3.type === C.setItemEnd) {
      if (t3.key === x2) return h({}, n4, { anonymousId: t3.value });
      if (t3.key === j2) return h({}, n4, { userId: t3.value });
    }
    switch (t3.type) {
      case C.identify:
        return Object.assign({}, n4, { userId: t3.userId, traits: h({}, n4.traits, t3.traits) });
      case C.reset:
        return [j2, x2, T2].forEach(function(n5) {
          e2.removeItem(n5);
        }), Object.assign({}, n4, { userId: null, anonymousId: null, traits: {} });
      default:
        return n4;
    }
  };
}
function J2(e2) {
  return { userId: e2.getItem(j2), anonymousId: e2.getItem(x2), traits: e2.getItem(T2) };
}
var W2 = function(e2) {
  return O + "TEMP" + O + e2;
};
function H2(n4) {
  var t3 = n4.storage, r4 = t3.setItem, i6 = t3.removeItem, a6 = t3.getItem;
  return function(n5) {
    return function(t4) {
      return function(u4) {
        var c4 = u4.userId, s4 = u4.traits, l3 = u4.options;
        if (u4.type === C.reset && ([j2, T2, x2].forEach(function(e2) {
          i6(e2);
        }), [q2, U2, "traits"].forEach(function(e2) {
          i2(W2(e2));
        })), u4.type === C.identify) {
          a6(x2) || r4(x2, b());
          var f2 = a6(j2), d3 = a6(T2) || {};
          f2 && f2 !== c4 && n5.dispatch({ type: C.userIdChanged, old: { userId: f2, traits: d3 }, new: { userId: c4, traits: s4 }, options: l3 }), c4 && r4(j2, c4), s4 && r4(T2, h({}, d3, s4));
        }
        return t4(u4);
      };
    };
  };
}
var F = {};
function G2(e2, n4) {
  F[e2] && W(F[e2]) && (F[e2](n4), delete F[e2]);
}
function K(e2, n4, t3) {
  return new Promise(function(r4, i6) {
    return n4() ? r4(e2) : t3 < 1 ? i6(h({}, e2, { queue: true })) : new Promise(function(e3) {
      return setTimeout(e3, 10);
    }).then(function(a6) {
      return K(e2, n4, t3 - 10).then(r4, i6);
    });
  });
}
function Q2(e2) {
  return { abort: e2 };
}
function Y2(e2, n4, t3) {
  var r4 = {}, i6 = n4(), a6 = e2.getState(), o4 = a6.plugins, u4 = a6.queue, c4 = a6.user;
  if (!a6.context.offline && u4 && u4.actions && u4.actions.length) {
    var s4 = u4.actions.reduce(function(e3, n5, t4) {
      return o4[n5.plugin].loaded ? (e3.process.push(n5), e3.processIndex.push(t4)) : (e3.requeue.push(n5), e3.requeueIndex.push(t4)), e3;
    }, { processIndex: [], process: [], requeue: [], requeueIndex: [] });
    if (s4.processIndex && s4.processIndex.length) {
      s4.processIndex.forEach(function(n5) {
        var a7 = u4.actions[n5], s5 = a7.plugin, f3 = a7.payload.type, p = i6[s5][f3];
        if (p && W(p)) {
          var m5, g3 = (function(e3, n6) {
            return void 0 === e3 && (e3 = {}), void 0 === n6 && (n6 = {}), [q2, U2].reduce(function(t4, r5) {
              return e3.hasOwnProperty(r5) && n6[r5] && n6[r5] !== e3[r5] && (t4[r5] = n6[r5]), t4;
            }, e3);
          })(a7.payload, c4), v2 = r4[g3.meta.rid];
          if (!v2 && (m5 = p({ payload: g3, config: o4[s5].config, instance: t3, abort: Q2 })) && on(m5) && m5.abort) return void (r4[g3.meta.rid] = true);
          if (!v2) {
            var y2 = f3 + ":" + s5;
            e2.dispatch(h({}, g3, { type: y2, _: { called: y2, from: "queueDrain" } }));
          }
        }
      });
      var f2 = u4.actions.filter(function(e3, n5) {
        return !~s4.processIndex.indexOf(n5);
      });
      u4.actions = f2;
    }
  }
}
var Z = function(e2) {
  var n4 = e2.data, t3 = e2.action, r4 = e2.instance, i6 = e2.state, a6 = e2.allPlugins, o4 = e2.allMatches, u4 = e2.store, c4 = e2.EVENTS;
  try {
    var s4 = i6.plugins, f2 = i6.context, p = t3.type, m5 = p.match(ee), g3 = n4.exact.map(function(e3) {
      return e3.pluginName;
    });
    m5 && (g3 = o4.during.map(function(e3) {
      return e3.pluginName;
    }));
    var v2 = /* @__PURE__ */ (function(e3, n5) {
      return function(t4, r5, i7) {
        var a7 = r5.config, o5 = r5.name, u5 = o5 + "." + t4.type;
        i7 && (u5 = i7.event);
        var c5 = t4.type.match(ee) ? /* @__PURE__ */ (function(e4, n6, t5, r6, i8) {
          return function(a8, o6) {
            var u6 = r6 ? r6.name : e4, c6 = o6 && se(o6) ? o6 : t5;
            if (r6 && (!(c6 = o6 && se(o6) ? o6 : [e4]).includes(e4) || 1 !== c6.length)) throw new Error("Method " + n6 + " can only abort " + e4 + " plugin. " + JSON.stringify(c6) + " input valid");
            return h({}, i8, { abort: { reason: a8, plugins: c6, caller: n6, _: u6 } });
          };
        })(o5, u5, n5, i7, t4) : /* @__PURE__ */ (function(e4, n6) {
          return function() {
            throw new Error(e4.type + " action not cancellable. Remove abort in " + n6);
          };
        })(t4, u5);
        return { payload: de(t4), instance: e3, config: a7 || {}, abort: c5 };
      };
    })(r4, g3), y2 = n4.exact.reduce(function(e3, n5) {
      var t4 = n5.pluginName, r5 = n5.methodName, i7 = false;
      return r5.match(/^initialize/) || r5.match(/^reset/) || (i7 = !s4[t4].loaded), f2.offline && r5.match(/^(page|track|identify)/) && (i7 = true), e3["" + t4] = i7, e3;
    }, {});
    return Promise.resolve(n4.exact.reduce(function(e3, i7, o5) {
      var u5 = i7.pluginName;
      return Promise.resolve(e3).then(function(e4) {
        function i8() {
          return Promise.resolve(e4);
        }
        var o6 = (function() {
          if (n4.namespaced && n4.namespaced[u5]) return Promise.resolve(n4.namespaced[u5].reduce(function(e5, n5, t4) {
            return Promise.resolve(e5).then(function(e6) {
              return n5.method && W(n5.method) ? ((function(e7, n6) {
                var t6 = fe(e7);
                if (t6 && t6.name === n6) {
                  var r5 = fe(t6.method);
                  throw new Error([n6 + " plugin is calling method " + e7, "Plugins cant call self", "Use " + t6.method + " " + (r5 ? "or " + r5.method : "") + " in " + n6 + " plugin insteadof " + e7].join("\n"));
                }
              })(n5.methodName, n5.pluginName), Promise.resolve(n5.method({ payload: e6, instance: r4, abort: (t5 = e6, i9 = u5, o7 = n5.pluginName, function(e7, n6) {
                return h({}, t5, { abort: { reason: e7, plugins: n6 || [i9], caller: p, from: o7 || i9 } });
              }), config: ie(n5.pluginName, s4, a6), plugins: s4 })).then(function(n6) {
                var t6 = on(n6) ? n6 : {};
                return Promise.resolve(h({}, e6, t6));
              })) : e6;
              var t5, i9, o7;
            });
          }, Promise.resolve(t3))).then(function(n5) {
            e4[u5] = n5;
          });
          e4[u5] = t3;
        })();
        return o6 && o6.then ? o6.then(i8) : i8();
      });
    }, Promise.resolve({}))).then(function(e3) {
      return Promise.resolve(n4.exact.reduce(function(t4, i7, o5) {
        try {
          var c5 = n4.exact.length === o5 + 1, f3 = i7.pluginName, d3 = a6[f3];
          return Promise.resolve(t4).then(function(n5) {
            var t5 = e3[f3] ? e3[f3] : {};
            if (m5 && (t5 = n5), ue(t5, f3)) return re({ data: t5, method: p, instance: r4, pluginName: f3, store: u4 }), Promise.resolve(n5);
            if (ue(n5, f3)) return c5 && re({ data: n5, method: p, instance: r4, store: u4 }), Promise.resolve(n5);
            if (y2.hasOwnProperty(f3) && true === y2[f3]) return u4.dispatch({ type: "queue", plugin: f3, payload: t5, _: { called: "queue", from: "queueMechanism" } }), Promise.resolve(n5);
            var i8 = v2(e3[f3], a6[f3]);
            return Promise.resolve(d3[p]({ abort: i8.abort, payload: t5, instance: r4, config: ie(f3, s4, a6), plugins: s4 })).then(function(i9) {
              var a7 = on(i9) ? i9 : {}, o6 = h({}, n5, a7), c6 = e3[f3];
              if (ue(c6, f3)) re({ data: c6, method: p, instance: r4, pluginName: f3, store: u4 });
              else {
                var s5 = p + ":" + f3;
                (s5.match(/:/g) || []).length < 2 && !p.match(ne) && !p.match(te) && r4.dispatch(h({}, m5 ? o6 : t5, { type: s5, _: { called: s5, from: "submethod" } }));
              }
              return Promise.resolve(o6);
            });
          });
        } catch (e4) {
          return Promise.reject(e4);
        }
      }, Promise.resolve(t3))).then(function(e4) {
        if (!(p.match(ee) || p.match(/^registerPlugin/) || p.match(te) || p.match(ne) || p.match(/^params/) || p.match(/^userIdChanged/))) {
          if (c4.plugins.includes(p), e4._ && e4._.originalAction === p) return e4;
          var t4 = h({}, e4, { _: { originalAction: e4.type, called: e4.type, from: "engineEnd" } });
          ce(e4, n4.exact.length) && !p.match(/End$/) && (t4 = h({}, t4, { type: e4.type + "Aborted" })), u4.dispatch(t4);
        }
        return e4;
      });
    });
  } catch (e3) {
    return Promise.reject(e3);
  }
};
var ee = /Start$/;
var ne = /^bootstrap/;
var te = /^ready/;
function re(e2) {
  var n4 = e2.pluginName, t3 = e2.method + "Aborted" + (n4 ? ":" + n4 : "");
  e2.store.dispatch(h({}, e2.data, { type: t3, _: { called: t3, from: "abort" } }));
}
function ie(e2, n4, t3) {
  var r4 = n4[e2] || t3[e2];
  return r4 && r4.config ? r4.config : {};
}
function ae(e2, n4) {
  return n4.reduce(function(n5, t3) {
    return t3[e2] ? n5.concat({ methodName: e2, pluginName: t3.name, method: t3[e2] }) : n5;
  }, []);
}
function oe(e2, n4) {
  var t3 = e2.replace(ee, ""), r4 = n4 ? ":" + n4 : "";
  return ["" + e2 + r4, "" + t3 + r4, t3 + "End" + r4];
}
function ue(e2, n4) {
  var t3 = e2.abort;
  return !!t3 && (true === t3 || le(t3, n4) || t3 && le(t3.plugins, n4));
}
function ce(e2, n4) {
  var t3 = e2.abort;
  if (!t3) return false;
  if (true === t3 || q(t3)) return true;
  var r4 = t3.plugins;
  return se(t3) && t3.length === n4 || se(r4) && r4.length === n4;
}
function se(e2) {
  return Array.isArray(e2);
}
function le(e2, n4) {
  return !(!e2 || !se(e2)) && e2.includes(n4);
}
function fe(e2) {
  var n4 = e2.match(/(.*):(.*)/);
  return !!n4 && { method: n4[1], name: n4[2] };
}
function de(e2) {
  return Object.keys(e2).reduce(function(n4, t3) {
    return "type" === t3 || (n4[t3] = on(e2[t3]) ? Object.assign({}, e2[t3]) : e2[t3]), n4;
  }, {});
}
function pe(e2, n4, t3) {
  var r4 = {};
  return function(i6) {
    return function(a6) {
      return function(o4) {
        try {
          var u4, c4 = function(e3) {
            return u4 ? e3 : a6(f2);
          }, s4 = o4.type, l3 = o4.plugins, f2 = o4;
          if (o4.abort) return Promise.resolve(a6(o4));
          if (s4 === C.enablePlugin && i6.dispatch({ type: C.initializeStart, plugins: l3, disabled: [], fromEnable: true, meta: o4.meta }), s4 === C.disablePlugin && setTimeout(function() {
            return G2(o4.meta.rid, { payload: o4 });
          }, 0), s4 === C.initializeEnd) {
            var m5 = n4(), g3 = Object.keys(m5), v2 = g3.filter(function(e3) {
              return l3.includes(e3);
            }).map(function(e3) {
              return m5[e3];
            }), y2 = [], b4 = [], I4 = o4.disabled, w2 = v2.map(function(e3) {
              var n5 = e3.loaded, t4 = e3.name, a7 = e3.config;
              return K(e3, function() {
                return n5({ config: a7 });
              }, 1e4).then(function(n6) {
                return r4[t4] || (i6.dispatch({ type: C.pluginReadyType(t4), name: t4, events: Object.keys(e3).filter(function(e4) {
                  return !L.includes(e4);
                }) }), r4[t4] = true), y2 = y2.concat(t4), e3;
              }).catch(function(e4) {
                if (e4 instanceof Error) throw new Error(e4);
                return b4 = b4.concat(e4.name), e4;
              });
            });
            Promise.all(w2).then(function(e3) {
              var n5 = { plugins: y2, failed: b4, disabled: I4 };
              setTimeout(function() {
                g3.length === w2.length + I4.length && i6.dispatch(h({}, { type: C.ready }, n5));
              }, 0);
            });
          }
          var E4 = (function() {
            if (s4 !== C.bootstrap) return /^ready:([^:]*)$/.test(s4) && setTimeout(function() {
              return Y2(i6, n4, e2);
            }, 0), Promise.resolve((function(e3, n5, t4, r5, i7) {
              try {
                var a7 = W(n5) ? n5() : n5, o5 = e3.type, u5 = o5.replace(ee, "");
                if (e3._ && e3._.called) return Promise.resolve(e3);
                var c5 = t4.getState(), s5 = (m6 = a7, void 0 === (g4 = c5.plugins) && (g4 = {}), void 0 === (v3 = e3.options) && (v3 = {}), Object.keys(m6).filter(function(e4) {
                  var n6 = v3.plugins || {};
                  return Q(n6[e4]) ? n6[e4] : false !== n6.all && (!g4[e4] || false !== g4[e4].enabled);
                }).map(function(e4) {
                  return m6[e4];
                }));
                o5 === C.initializeStart && e3.fromEnable && (s5 = Object.keys(c5.plugins).filter(function(n6) {
                  var t5 = c5.plugins[n6];
                  return e3.plugins.includes(n6) && !t5.initialized;
                }).map(function(e4) {
                  return a7[e4];
                }));
                var l4 = s5.map(function(e4) {
                  return e4.name;
                }), f3 = (function(e4, n6) {
                  var t5 = oe(e4).map(function(e5) {
                    return ae(e5, n6);
                  });
                  return n6.reduce(function(t6, r6) {
                    var i8 = r6.name, a8 = oe(e4, i8).map(function(e5) {
                      return ae(e5, n6);
                    }), o6 = a8[0], u6 = a8[1], c6 = a8[2];
                    return o6.length && (t6.beforeNS[i8] = o6), u6.length && (t6.duringNS[i8] = u6), c6.length && (t6.afterNS[i8] = c6), t6;
                  }, { before: t5[0], beforeNS: {}, during: t5[1], duringNS: {}, after: t5[2], afterNS: {} });
                })(o5, s5);
                return Promise.resolve(Z({ action: e3, data: { exact: f3.before, namespaced: f3.beforeNS }, state: c5, allPlugins: a7, allMatches: f3, instance: t4, store: r5, EVENTS: i7 })).then(function(e4) {
                  function n6() {
                    var n7 = (function() {
                      if (o5.match(ee)) return Promise.resolve(Z({ action: h({}, s6, { type: u5 + "End" }), data: { exact: f3.after, namespaced: f3.afterNS }, state: c5, allPlugins: a7, allMatches: f3, instance: t4, store: r5, EVENTS: i7 })).then(function(e5) {
                        e5.meta && e5.meta.hasCallback && G2(e5.meta.rid, { payload: e5 });
                      });
                    })();
                    return n7 && n7.then ? n7.then(function() {
                      return e4;
                    }) : e4;
                  }
                  if (ce(e4, l4.length)) return e4;
                  var s6, d3 = (function() {
                    if (o5 !== u5) return Promise.resolve(Z({ action: h({}, e4, { type: u5 }), data: { exact: f3.during, namespaced: f3.duringNS }, state: c5, allPlugins: a7, allMatches: f3, instance: t4, store: r5, EVENTS: i7 })).then(function(e5) {
                      s6 = e5;
                    });
                    s6 = e4;
                  })();
                  return d3 && d3.then ? d3.then(n6) : n6();
                });
              } catch (e4) {
                return Promise.reject(e4);
              }
              var m6, g4, v3;
            })(o4, n4, e2, i6, t3)).then(function(e3) {
              var n5 = a6(e3);
              return u4 = 1, n5;
            });
          })();
          return Promise.resolve(E4 && E4.then ? E4.then(c4) : c4(E4));
        } catch (e3) {
          return Promise.reject(e3);
        }
      };
    };
  };
}
function me(e2) {
  return function(n4) {
    return function(n5) {
      return function(t3) {
        var r4 = t3.type, i6 = t3.key, a6 = t3.value, o4 = t3.options;
        if (r4 === C.setItem || r4 === C.removeItem) {
          if (t3.abort) return n5(t3);
          r4 === C.setItem ? e2.setItem(i6, a6, o4) : e2.removeItem(i6, o4);
        }
        return n5(t3);
      };
    };
  };
}
var ge = function() {
  var e2 = this;
  this.before = [], this.after = [], this.addMiddleware = function(n4, t3) {
    e2[t3] = e2[t3].concat(n4);
  }, this.removeMiddleware = function(n4, t3) {
    var r4 = e2[t3].findIndex(function(e3) {
      return e3 === n4;
    });
    -1 !== r4 && (e2[t3] = [].concat(e2[t3].slice(0, r4), e2[t3].slice(r4 + 1)));
  }, this.dynamicMiddlewares = function(n4) {
    return function(t3) {
      return function(r4) {
        return function(i6) {
          var a6 = { getState: t3.getState, dispatch: function(e3) {
            return t3.dispatch(e3);
          } }, o4 = e2[n4].map(function(e3) {
            return e3(a6);
          });
          return _2.apply(void 0, o4)(r4)(i6);
        };
      };
    };
  };
};
function ve(e2) {
  return function(n4, t3) {
    void 0 === n4 && (n4 = {});
    var r4 = {};
    if ("initialize:aborted" === t3.type) return n4;
    if (/^registerPlugin:([^:]*)$/.test(t3.type)) {
      var i6 = he(t3.type, "registerPlugin"), a6 = e2()[i6];
      if (!a6 || !i6) return n4;
      var o4 = t3.enabled, u4 = a6.config;
      return r4[i6] = { enabled: o4, initialized: !!o4 && Boolean(!a6.initialize), loaded: !!o4 && Boolean(a6.loaded({ config: u4 })), config: u4 }, h({}, n4, r4);
    }
    if (/^initialize:([^:]*)$/.test(t3.type)) {
      var c4 = he(t3.type, C.initialize), s4 = e2()[c4];
      return s4 && c4 ? (r4[c4] = h({}, n4[c4], { initialized: true, loaded: Boolean(s4.loaded({ config: s4.config })) }), h({}, n4, r4)) : n4;
    }
    if (/^ready:([^:]*)$/.test(t3.type)) return r4[t3.name] = h({}, n4[t3.name], { loaded: true }), h({}, n4, r4);
    switch (t3.type) {
      case C.disablePlugin:
        return h({}, n4, ye(t3.plugins, false, n4));
      case C.enablePlugin:
        return h({}, n4, ye(t3.plugins, true, n4));
      default:
        return n4;
    }
  };
}
function he(e2, n4) {
  return e2.substring(n4.length + 1, e2.length);
}
function ye(e2, n4, t3) {
  return e2.reduce(function(e3, r4) {
    return e3[r4] = h({}, t3[r4], { enabled: n4 }), e3;
  }, t3);
}
function be(e2) {
  try {
    return JSON.parse(JSON.stringify(e2));
  } catch (e3) {
  }
  return e2;
}
var Ie = { last: {}, history: [] };
function we(e2, n4) {
  void 0 === e2 && (e2 = Ie);
  var t3 = n4.options, r4 = n4.meta;
  if (n4.type === C.track) {
    var i6 = be(h({ event: n4.event, properties: n4.properties }, Object.keys(t3).length && { options: t3 }, { meta: r4 }));
    return h({}, e2, { last: i6, history: e2.history.concat(i6) });
  }
  return e2;
}
var Ee = { actions: [] };
function Pe(e2, n4) {
  void 0 === e2 && (e2 = Ee);
  var t3 = n4.payload;
  switch (n4.type) {
    case "queue":
      var r4;
      return r4 = t3 && t3.type && t3.type === C.identify ? [n4].concat(e2.actions) : e2.actions.concat(n4), h({}, e2, { actions: r4 });
    case "dequeue":
      return [];
    default:
      return e2;
  }
}
var Se = /#.*$/;
function Ne(e2) {
  var n4 = /(http[s]?:\/\/)?([^\/\s]+\/)(.*)/g.exec(e2);
  return "/" + (n4 && n4[3] ? n4[3].split("?")[0].replace(Se, "") : "");
}
var Oe;
var Ae;
var _e;
var ke;
var xe = function(e2) {
  if (void 0 === e2 && (e2 = {}), !$) return e2;
  var n4 = document, t3 = n4.title, r4 = n4.referrer, i6 = window, a6 = i6.location, o4 = i6.innerWidth, u4 = i6.innerHeight, c4 = a6.hash, s4 = a6.search, l3 = (function(e3) {
    var n5 = (function() {
      if ($) {
        for (var e4, n6 = document.getElementsByTagName("link"), t4 = 0; e4 = n6[t4]; t4++) if ("canonical" === e4.getAttribute("rel")) return e4.getAttribute("href");
      }
    })();
    return n5 ? n5.match(/\?/) ? n5 : n5 + e3 : window.location.href.replace(Se, "");
  })(s4), f2 = { title: t3, url: l3, path: Ne(l3), hash: c4, search: s4, width: o4, height: u4 };
  return r4 && "" !== r4 && (f2.referrer = r4), h({}, f2, e2);
};
var je = { last: {}, history: [] };
function Te(e2, n4) {
  void 0 === e2 && (e2 = je);
  var t3 = n4.options;
  if (n4.type === C.page) {
    var r4 = be(h({ properties: n4.properties, meta: n4.meta }, Object.keys(t3).length && { options: t3 }));
    return h({}, e2, { last: r4, history: e2.history.concat(r4) });
  }
  return e2;
}
Oe = (function() {
  if (!$) return false;
  var e2 = navigator.appVersion;
  return ~e2.indexOf("Win") ? "Windows" : ~e2.indexOf("Mac") ? "MacOS" : ~e2.indexOf("X11") ? "UNIX" : ~e2.indexOf("Linux") ? "Linux" : "Unknown OS";
})(), Ae = $ ? document.referrer : null, _e = o2(), ke = a2();
var ze = { initialized: false, sessionId: b(), app: null, version: null, debug: false, offline: !!$ && !navigator.onLine, os: { name: Oe }, userAgent: $ ? navigator.userAgent : "node", library: { name: M2, version: "0.13.1" }, timezone: ke, locale: _e, campaign: {}, referrer: Ae };
function Me(e2, n4) {
  void 0 === e2 && (e2 = ze);
  var t3 = e2.initialized, r4 = n4.campaign;
  switch (n4.type) {
    case C.campaign:
      return h({}, e2, { campaign: r4 });
    case C.offline:
      return h({}, e2, { offline: true });
    case C.online:
      return h({}, e2, { offline: false });
    default:
      return t3 ? e2 : h({}, ze, e2, { initialized: true });
  }
}
var qe = ["plugins", "reducers", "storage"];
function Ue(e2, n4, t3) {
  if ($) {
    var r4 = window[(t3 ? "add" : "remove") + "EventListener"];
    e2.split(" ").forEach(function(e3) {
      r4(e3, n4);
    });
  }
}
function Ve(e2) {
  var n4 = Ue.bind(null, "online offline", function(n5) {
    return Promise.resolve(!navigator.onLine).then(e2);
  });
  return n4(true), function(e3) {
    return n4(false);
  };
}
function Le() {
  return a3(M2, []), function(e2) {
    return function(n4, t3, r4) {
      var i6 = e2(n4, t3, r4), a6 = i6.dispatch;
      return Object.assign(i6, { dispatch: function(e3) {
        return l[o3][M2].push(e3.action || e3), a6(e3);
      } });
    };
  };
}
function Ce(e2) {
  return function() {
    return _2(_2.apply(null, arguments), Le());
  };
}
function Re(e2) {
  return e2 ? rn(e2) ? e2 : [e2] : [];
}
function $e(n4, t3, r4) {
  void 0 === n4 && (n4 = {});
  var i6, a6, o4 = b();
  return t3 && (F[o4] = (i6 = t3, a6 = (function(e2) {
    for (var n5, t4 = e2 || Array.prototype.slice.call(arguments), r5 = 0; r5 < t4.length; r5++) if (W(t4[r5])) {
      n5 = t4[r5];
      break;
    }
    return n5;
  })(r4), function(e2) {
    a6 && a6(e2), i6(e2);
  })), h({}, n4, { rid: o4, ts: (/* @__PURE__ */ new Date()).getTime() }, t3 ? { hasCallback: true } : {});
}
function De(n4) {
  void 0 === n4 && (n4 = {});
  var t3 = n4.reducers || {}, c4 = n4.initialUser || {}, s4 = (n4.plugins || []).reduce(function(e2, n5) {
    if (W(n5)) return e2.middlewares = e2.middlewares.concat(n5), e2;
    if (n5.NAMESPACE && (n5.name = n5.NAMESPACE), !n5.name) throw new Error("https://lytics.dev/errors/1");
    n5.config || (n5.config = {});
    var t4 = n5.EVENTS ? Object.keys(n5.EVENTS).map(function(e3) {
      return n5.EVENTS[e3];
    }) : [];
    e2.pluginEnabled[n5.name] = !(false === n5.enabled || false === n5.config.enabled), delete n5.enabled, n5.methods && (e2.methods[n5.name] = Object.keys(n5.methods).reduce(function(e3, t5) {
      var r5;
      return e3[t5] = (r5 = n5.methods[t5], function() {
        for (var e4 = Array.prototype.slice.call(arguments), n6 = new Array(r5.length), t6 = 0; t6 < e4.length; t6++) n6[t6] = e4[t6];
        return n6[n6.length] = Z2, r5.apply({ instance: Z2 }, n6);
      }), e3;
    }, {}), delete n5.methods);
    var r4 = Object.keys(n5).concat(t4), i6 = new Set(e2.events.concat(r4));
    if (e2.events = Array.from(i6), e2.pluginsArray = e2.pluginsArray.concat(n5), e2.plugins[n5.name]) throw new Error(n5.name + "AlreadyLoaded");
    return e2.plugins[n5.name] = n5, e2.plugins[n5.name].loaded || (e2.plugins[n5.name].loaded = function() {
      return true;
    }), e2;
  }, { plugins: {}, pluginEnabled: {}, methods: {}, pluginsArray: [], middlewares: [], events: [] }), f2 = n4.storage ? n4.storage : { getItem: f, setItem: a3, removeItem: i2 }, p = /* @__PURE__ */ (function(e2) {
    return function(n5, t4, r4) {
      return t4.getState("user")[n5] || (r4 && on(r4) && r4[n5] ? r4[n5] : J2(e2)[n5] || f(W2(n5)) || null);
    };
  })(f2), v2 = s4.plugins, w2 = s4.events.filter(function(e2) {
    return !L.includes(e2);
  }).sort(), S3 = new Set(w2.concat(V2).filter(function(e2) {
    return !L.includes(e2);
  })), N3 = Array.from(S3).sort(), j3 = function() {
    return v2;
  }, T3 = new ge(), z2 = T3.addMiddleware, M3 = T3.removeMiddleware, R3 = T3.dynamicMiddlewares, $3 = function() {
    throw new Error("Abort disabled inListener");
  }, D2 = s(), F3 = J2(f2), G4 = h({}, F3, c4, D2.an_uid ? { userId: D2.an_uid } : {}, D2.an_aid ? { anonymousId: D2.an_aid } : {});
  G4.anonymousId || (G4.anonymousId = b());
  var K2 = h({ enable: function(e2, n5) {
    return new Promise(function(t4) {
      se2.dispatch({ type: C.enablePlugin, plugins: Re(e2), _: { originalAction: C.enablePlugin } }, t4, [n5]);
    });
  }, disable: function(e2, n5) {
    return new Promise(function(t4) {
      se2.dispatch({ type: C.disablePlugin, plugins: Re(e2), _: { originalAction: C.disablePlugin } }, t4, [n5]);
    });
  } }, s4.methods), Q3 = false, Z2 = { identify: function(e2, n5, t4, r4) {
    try {
      var i6 = q(e2) ? e2 : null, a6 = on(e2) ? e2 : n5, o4 = t4 || {}, c5 = Z2.user();
      a3(W2(q2), i6);
      var s5 = i6 || a6.userId || p(q2, Z2, a6);
      return Promise.resolve(new Promise(function(e3) {
        se2.dispatch(h({ type: C.identifyStart, userId: s5, traits: a6 || {}, options: o4, anonymousId: c5.anonymousId }, c5.id && c5.id !== i6 && { previousId: c5.id }), e3, [n5, t4, r4]);
      }));
    } catch (e3) {
      return Promise.reject(e3);
    }
  }, track: function(e2, n5, t4, r4) {
    try {
      var i6 = on(e2) ? e2.event : e2;
      if (!i6 || !q(i6)) throw new Error("EventMissing");
      var a6 = on(e2) ? e2 : n5 || {}, o4 = on(t4) ? t4 : {};
      return Promise.resolve(new Promise(function(e3) {
        se2.dispatch({ type: C.trackStart, event: i6, properties: a6, options: o4, userId: p(q2, Z2, n5), anonymousId: p(U2, Z2, n5) }, e3, [n5, t4, r4]);
      }));
    } catch (e3) {
      return Promise.reject(e3);
    }
  }, page: function(e2, n5, t4) {
    try {
      var r4 = on(e2) ? e2 : {}, i6 = on(n5) ? n5 : {};
      return Promise.resolve(new Promise(function(a6) {
        se2.dispatch({ type: C.pageStart, properties: xe(r4), options: i6, userId: p(q2, Z2, r4), anonymousId: p(U2, Z2, r4) }, a6, [e2, n5, t4]);
      }));
    } catch (e3) {
      return Promise.reject(e3);
    }
  }, user: function(e2) {
    if (e2 === q2 || "id" === e2) return p(q2, Z2);
    if (e2 === U2 || "anonId" === e2) return p(U2, Z2);
    var n5 = Z2.getState("user");
    return e2 ? dlv_es_default(n5, e2) : n5;
  }, reset: function(e2) {
    return new Promise(function(n5) {
      se2.dispatch({ type: C.resetStart }, n5, e2);
    });
  }, ready: function(e2) {
    return Q3 && e2({ plugins: K2, instance: Z2 }), Z2.on(C.ready, function(n5) {
      e2 && e2(n5), Q3 = true;
    });
  }, on: function(e2, n5) {
    if (!e2 || !W(n5)) return false;
    if (e2 === C.bootstrap) throw new Error(".on disabled for " + e2);
    var t4 = /Start$|Start:/;
    if ("*" === e2) {
      var r4 = function(e3) {
        return function(e4) {
          return function(r5) {
            return r5.type.match(t4) && n5({ payload: r5, instance: Z2, plugins: v2 }), e4(r5);
          };
        };
      }, i6 = function(e3) {
        return function(e4) {
          return function(r5) {
            return r5.type.match(t4) || n5({ payload: r5, instance: Z2, plugins: v2 }), e4(r5);
          };
        };
      };
      return z2(r4, Be), z2(i6, Xe), function() {
        M3(r4, Be), M3(i6, Xe);
      };
    }
    var a6 = e2.match(t4) ? Be : Xe, o4 = function(t5) {
      return function(t6) {
        return function(r5) {
          return r5.type === e2 && n5({ payload: r5, instance: Z2, plugins: v2, abort: $3 }), t6(r5);
        };
      };
    };
    return z2(o4, a6), function() {
      return M3(o4, a6);
    };
  }, once: function(e2, n5) {
    if (!e2 || !W(n5)) return false;
    if (e2 === C.bootstrap) throw new Error(".once disabled for " + e2);
    var t4 = Z2.on(e2, function(e3) {
      n5({ payload: e3.payload, instance: Z2, plugins: v2, abort: $3 }), t4();
    });
    return t4;
  }, getState: function(e2) {
    var n5 = se2.getState();
    return e2 ? dlv_es_default(n5, e2) : Object.assign({}, n5);
  }, dispatch: function(e2) {
    var n5 = q(e2) ? { type: e2 } : e2;
    if (V2.includes(n5.type)) throw new Error("reserved action " + n5.type);
    var t4 = h({}, n5, { _: h({ originalAction: n5.type }, e2._ || {}) });
    se2.dispatch(t4);
  }, enablePlugin: K2.enable, disablePlugin: K2.disable, plugins: K2, storage: { getItem: f2.getItem, setItem: function(e2, n5, t4) {
    se2.dispatch({ type: C.setItemStart, key: e2, value: n5, options: t4 });
  }, removeItem: function(e2, n5) {
    se2.dispatch({ type: C.removeItemStart, key: e2, options: n5 });
  } }, setAnonymousId: function(e2, n5) {
    Z2.storage.setItem(x2, e2, n5);
  }, events: { core: V2, plugins: w2 } }, ee2 = s4.middlewares.concat([function(e2) {
    return function(e3) {
      return function(n5) {
        return n5.meta || (n5.meta = $e()), e3(n5);
      };
    };
  }, R3(Be), pe(Z2, j3, { all: N3, plugins: w2 }), me(f2), B2(Z2), H2(Z2), R3(Xe)]), ne2 = { context: Me, user: X2(f2), page: Te, track: we, plugins: ve(j3), queue: Pe }, te2 = _2, re2 = _2;
  if ($ && n4.debug) {
    var ie2 = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
    ie2 && (te2 = ie2({ trace: true, traceLimit: 25 })), re2 = function() {
      return 0 === arguments.length ? Le() : on(typeof arguments[0]) ? Ce() : Ce().apply(null, arguments);
    };
  }
  var ae2, oe2 = (function(e2) {
    return Object.keys(e2).reduce(function(n5, t4) {
      return qe.includes(t4) || (n5[t4] = e2[t4]), n5;
    }, {});
  })(n4), ue2 = s4.pluginsArray.reduce(function(e2, n5) {
    var t4 = n5.name, r4 = n5.config, i6 = n5.loaded, a6 = s4.pluginEnabled[t4];
    return e2[t4] = { enabled: a6, initialized: !!a6 && Boolean(!n5.initialize), loaded: Boolean(i6({ config: r4 })), config: r4 }, e2;
  }, {}), ce2 = { context: oe2, user: G4, plugins: ue2 }, se2 = O2((function(e2) {
    for (var n5 = Object.keys(e2), t4 = {}, r4 = 0; r4 < n5.length; r4++) {
      var i6 = n5[r4];
      typeof e2[i6] === y && (t4[i6] = e2[i6]);
    }
    var a6, o4 = Object.keys(t4);
    try {
      !(function(e3) {
        Object.keys(e3).forEach(function(n6) {
          var t5 = e3[n6];
          if (typeof t5(void 0, { type: E2 }) === b2 || typeof t5(void 0, { type: P2 }) === b2) throw new Error(I2 + " " + n6 + " " + b2);
        });
      })(t4);
    } catch (e3) {
      a6 = e3;
    }
    return function(e3, n6) {
      if (void 0 === e3 && (e3 = {}), a6) throw a6;
      for (var r5 = false, i7 = {}, u4 = 0; u4 < o4.length; u4++) {
        var c5 = o4[u4], s5 = e3[c5], l3 = (0, t4[c5])(s5, n6);
        if (typeof l3 === b2) {
          var f3 = A2(c5, n6);
          throw new Error(f3);
        }
        i7[c5] = l3, r5 = r5 || l3 !== s5;
      }
      return r5 ? i7 : e3;
    };
  })(h({}, ne2, t3)), ce2, re2(te2(k2.apply(void 0, ee2))));
  se2.dispatch = (ae2 = se2.dispatch, function(e2, n5, t4) {
    var r4 = h({}, e2, { meta: $e(e2.meta, n5, Re(t4)) });
    return ae2.apply(null, [r4]);
  });
  var le2 = Object.keys(v2);
  se2.dispatch({ type: C.bootstrap, plugins: le2, config: oe2, params: D2, user: G4, initialUser: c4, persistedUser: F3 });
  var fe2 = le2.filter(function(e2) {
    return s4.pluginEnabled[e2];
  }), de2 = le2.filter(function(e2) {
    return !s4.pluginEnabled[e2];
  });
  return se2.dispatch({ type: C.registerPlugins, plugins: le2, enabled: s4.pluginEnabled }), s4.pluginsArray.map(function(e2, n5) {
    var t4 = e2.bootstrap, r4 = e2.config, i6 = e2.name;
    t4 && W(t4) && t4({ instance: Z2, config: r4, payload: e2 }), se2.dispatch({ type: C.registerPluginType(i6), name: i6, enabled: s4.pluginEnabled[i6], plugin: e2 }), s4.pluginsArray.length === n5 + 1 && se2.dispatch({ type: C.initializeStart, plugins: fe2, disabled: de2 });
  }), Ve(function(e2) {
    se2.dispatch({ type: e2 ? C.offline : C.online });
  }), (function(e2, n5, t4) {
    setInterval(function() {
      return Y2(e2, n5, t4);
    }, 3e3);
  })(se2, j3, Z2), Z2;
}
var Be = "before";
var Xe = "after";

// node_modules/@analytics/cookie-utils/dist/analytics-util-cookie.module.js
var t2 = "cookie";
var i3 = a4();
var r2 = d;
var c3 = d;
function u3(e2) {
  return i3 ? d(e2, "", -1) : i2(e2);
}
function a4() {
  if (void 0 !== i3) return i3;
  var e2 = t2 + t2;
  try {
    d(e2, e2), i3 = -1 !== document.cookie.indexOf(e2), u3(e2);
  } catch (e3) {
    i3 = false;
  }
  return i3;
}
function d(n4, t3, r4, c4, u4, a6) {
  if ("undefined" != typeof window) {
    var d3 = arguments.length > 1;
    return false === i3 && (d3 ? a3(n4, t3) : f(n4)), d3 ? document.cookie = n4 + "=" + encodeURIComponent(t3) + (r4 ? "; expires=" + new Date(+/* @__PURE__ */ new Date() + 1e3 * r4).toUTCString() + (c4 ? "; path=" + c4 : "") + (u4 ? "; domain=" + u4 : "") + (a6 ? "; secure" : "") : "") : decodeURIComponent((("; " + document.cookie).split("; " + n4 + "=")[1] || "").split(";")[0]);
  }
}

// node_modules/@analytics/localstorage-utils/dist/analytics-util-localstorage.module.js
var r3 = "localStorage";
var m3 = s2.bind(null, r3);
var g = u2(r3, "getItem", f);
var i4 = u2(r3, "setItem", a3);
var s3 = u2(r3, "removeItem", i2);

// node_modules/@analytics/session-storage-utils/dist/analytics-util-session-storage.module.js
var a5 = "sessionStorage";
var l2 = s2.bind(null, a5);
var m4 = u2(a5, "getItem", f);
var i5 = u2(a5, "setItem", a3);
var g2 = u2(a5, "removeItem", i2);

// node_modules/@analytics/storage-utils/dist/analytics-util-storage.module.js
function I3(t3) {
  var o4 = t3;
  try {
    if ("true" === (o4 = JSON.parse(t3))) return true;
    if ("false" === o4) return false;
    if (on(o4)) return o4;
    parseFloat(o4) === o4 && (o4 = parseFloat(o4));
  } catch (t4) {
  }
  if (null !== o4 && "" !== o4) return o4;
}
var k3 = m3();
var O3 = l2();
var x3 = a4();
function C2(o4, e2) {
  if (o4) {
    var r4 = A3(e2), a6 = !N2(r4), s4 = d2(r4) ? I3(localStorage.getItem(o4)) : void 0;
    if (a6 && !I(s4)) return s4;
    var n4 = h2(r4) ? I3(r2(o4)) : void 0;
    if (a6 && n4) return n4;
    var l3 = E3(r4) ? I3(sessionStorage.getItem(o4)) : void 0;
    if (a6 && l3) return l3;
    var u4 = f(o4);
    return a6 ? u4 : { localStorage: s4, sessionStorage: l3, cookie: n4, global: u4 };
  }
}
function L2(r4, a6, l3) {
  if (r4 && !I(a6)) {
    var u4 = {}, g3 = A3(l3), m5 = JSON.stringify(a6), p = !N2(g3);
    return d2(g3) && (u4[r3] = F2(r3, a6, I3(localStorage.getItem(r4))), localStorage.setItem(r4, m5), p) ? u4[r3] : h2(g3) && (u4[t2] = F2(t2, a6, I3(r2(r4))), c3(r4, m5), p) ? u4[t2] : E3(g3) && (u4[a5] = F2(a5, a6, I3(sessionStorage.getItem(r4))), sessionStorage.setItem(r4, m5), p) ? u4[a5] : (u4[n3] = F2(n3, a6, f(r4)), a3(r4, a6), p ? u4[n3] : u4);
  }
}
function b3(t3, e2) {
  if (t3) {
    var a6 = A3(e2), i6 = C2(t3, v), n4 = {};
    return !I(i6.localStorage) && d2(a6) && (localStorage.removeItem(t3), n4[r3] = i6.localStorage), !I(i6.cookie) && h2(a6) && (u3(t3), n4[t2] = i6.cookie), !I(i6.sessionStorage) && E3(a6) && (sessionStorage.removeItem(t3), n4[a5] = i6.sessionStorage), !I(i6.global) && G3(a6, n3) && (i2(t3), n4[n3] = i6.global), n4;
  }
}
function A3(t3) {
  return t3 ? q(t3) ? t3 : t3.storage : m;
}
function d2(t3) {
  return k3 && G3(t3, r3);
}
function h2(t3) {
  return x3 && G3(t3, t2);
}
function E3(t3) {
  return O3 && G3(t3, a5);
}
function N2(t3) {
  return t3 === v || "all" === t3;
}
function G3(t3, o4) {
  return t3 === m || t3 === o4 || N2(t3);
}
function F2(t3, o4, e2) {
  return { location: t3, current: o4, previous: e2 };
}
var J3 = { setItem: L2, getItem: C2, removeItem: b3 };

// node_modules/analytics/lib/analytics.browser.es.js
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);
  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    enumerableOnly && (symbols = symbols.filter(function(sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    })), keys.push.apply(keys, symbols);
  }
  return keys;
}
function _objectSpread2(target) {
  for (var i6 = 1; i6 < arguments.length; i6++) {
    var source = null != arguments[i6] ? arguments[i6] : {};
    i6 % 2 ? ownKeys(Object(source), true).forEach(function(key) {
      _defineProperty(target, key, source[key]);
    }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
      Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
    });
  }
  return target;
}
function analyticsLib() {
  var opts = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  var defaultSettings = {
    storage: J3
  };
  return De(_objectSpread2(_objectSpread2({}, defaultSettings), opts));
}
export {
  analyticsLib as Analytics,
  z as CONSTANTS,
  C as EVENTS,
  analyticsLib as default,
  analyticsLib as init
};
//# sourceMappingURL=analytics.js.map
