"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownClassRule = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const ts = require("typescript");
class DropdownClassRule extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        this.enabled = false;
    }
    visitNode(node) {
        if (ts.isIdentifier(node)) {
            this._visitIdentifier(node);
        }
    }
    _visitIdentifier(identifier) {
        if (identifier.getText() === 'NzDropdownContextComponent') {
            this.createFailureAtNode(identifier, `Found "NzDropdownContextComponent" which has been removed. Your code need to be updated.`);
        }
        if (identifier.getText() === 'NzDropdownService') {
            this.createFailureAtNode(identifier, `Found usage of "NzDropdownService" which has been removed. Please use "NzContextMenuService" instead.`);
        }
    }
}
exports.DropdownClassRule = DropdownClassRule;
//# sourceMappingURL=dropdown-class-rule.js.map