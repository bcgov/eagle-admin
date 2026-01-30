"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const schematics_1 = require("@angular-devkit/schematics");
const build_component_1 = require("../utils/build-component");
function default_1(options) {
    return (0, schematics_1.chain)([
        (0, build_component_1.buildComponent)(Object.assign({}, options))
    ]);
}
//# sourceMappingURL=index.js.map