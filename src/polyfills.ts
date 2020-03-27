/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/** IE9, IE10 and IE11 requires all of the following polyfills. **/
import 'core-js/features/symbol';
import 'core-js/features/function';
import 'core-js/features/parse-int';
import 'core-js/features/parse-float';
import 'core-js/features/number';
import 'core-js/features/math';
import 'core-js/features/string';
import 'core-js/features/date';
import 'core-js/features/array';
import 'core-js/features/regexp';
import 'core-js/features/map';
import 'core-js/features/set';

import 'core-js/features/weak-map';
import 'core-js/features/weak-set';
import 'core-js/features/object';

/** IE10 and IE11 requires the following for NgClass support on SVG elements */
import 'classlist.js';  // Run `npm install --save classlist.js`.

/** IE10 and IE11 requires the following to support `@angular/animation`. */
import 'web-animations-js';  // Run `npm install --save web-animations-js`.


/** Evergreen browsers require these. **/
import 'core-js/features/reflect';


/** ALL Firefox browsers require the following to support `@angular/animation`. **/
import 'web-animations-js';  // Run `npm install --save web-animations-js`.



/***************************************************************************************************
 * Zone JS is required by Angular itself.
 */
import 'zone.js/dist/zone';  // Included with Angular CLI.



/***************************************************************************************************
 * APPLICATION IMPORTS
 */

 // global is not defined fix (https://github.com/Leonidas-from-XIV/node-xml2js/issues/538)
(window as any)['global'] = window;

// Specific polyfill needed for IE11 using current packages as of Sep 24, 2018:
// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
if (!String.prototype.padStart) {
  String.prototype.padStart = function padStart(targetLength, padString) {
    // tslint:disable-next-line:no-bitwise
    targetLength = targetLength >> 0; // truncate if number or convert non-number to 0;
    padString = String((typeof padString !== 'undefined' ? padString : ' '));
    if (this.length > targetLength) {
      return String(this);
    } else {
      targetLength = targetLength - this.length;
      if (targetLength > padString.length) {
        padString += padString.repeat(targetLength / padString.length); // append to original to ensure we are longer than needed
      }
      return padString.slice(0, targetLength) + String(this);
    }
  };
}
