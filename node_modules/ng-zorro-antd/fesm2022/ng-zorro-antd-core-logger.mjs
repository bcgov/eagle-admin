import { isDevMode } from '@angular/core';
import { environment } from 'ng-zorro-antd/core/environments';

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
const record = {};
const PREFIX = '[NG-ZORRO]:';
function notRecorded(...args) {
    const asRecord = args.reduce((acc, c) => acc + c.toString(), '');
    if (record[asRecord]) {
        return false;
    }
    else {
        record[asRecord] = true;
        return true;
    }
}
function consoleCommonBehavior(consoleFunc, ...args) {
    if (environment.isTestMode || (isDevMode() && notRecorded(...args))) {
        consoleFunc(...args);
    }
}
// Warning should only be printed in dev mode and only once.
const warn = (...args) => consoleCommonBehavior((...arg) => console.warn(PREFIX, ...arg), ...args);
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const warnDeprecation = (...args) => {
    if (!environment.isTestMode) {
        const stack = new Error().stack;
        return consoleCommonBehavior((...arg) => console.warn(PREFIX, 'deprecated:', ...arg, stack), ...args);
    }
    else {
        return () => { };
    }
};
// Log should only be printed in dev mode.
const log = (...args) => {
    if (isDevMode()) {
        console.log(PREFIX, ...args);
    }
};

/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */

/**
 * Generated bundle index. Do not edit.
 */

export { PREFIX, log, warn, warnDeprecation };
//# sourceMappingURL=ng-zorro-antd-core-logger.mjs.map
