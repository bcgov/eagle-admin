"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deprecatedComponent = void 0;
const elements_1 = require("../../../utils/ng-update/elements");
const deprecatedComponent = (template, deprecated, instead) => {
    return (0, elements_1.findElementWithTag)(template.content, deprecated)
        .map(offset => ({
        filePath: template.filePath,
        position: template.getCharacterAndLineOfPosition(offset),
        message: `Found deprecated '<${deprecated}>' component. Please use '${instead}' instead.`
    }));
};
exports.deprecatedComponent = deprecatedComponent;
//# sourceMappingURL=deprecated-component.js.map