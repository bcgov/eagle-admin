"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecondaryEntryPointsRule = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const ts = require("typescript");
class SecondaryEntryPointsRule extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        this.enabled = false;
    }
    visitNode(declaration) {
        if (!ts.isImportDeclaration(declaration) ||
            !ts.isStringLiteralLike(declaration.moduleSpecifier)) {
            return;
        }
        const importLocation = declaration.moduleSpecifier.text;
        if (importLocation === 'ng-zorro-antd/core') {
            this.createFailureAtNode(declaration, 'The entry-point "ng-zorro-antd/core" is removed, ' +
                'use "ng-zorro-antd/core/**" instead.');
        }
        if (importLocation === 'ng-zorro-antd') {
            this.createFailureAtNode(declaration, 'The entry-point "ng-zorro-antd" is removed, ' +
                'use "ng-zorro-antd/**" instead.');
        }
    }
}
exports.SecondaryEntryPointsRule = SecondaryEntryPointsRule;
//# sourceMappingURL=secondary-entry-points-rule.js.map