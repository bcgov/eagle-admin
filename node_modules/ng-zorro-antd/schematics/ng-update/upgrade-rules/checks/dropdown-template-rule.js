"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DropdownTemplateRule = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const deprecated_component_1 = require("../utils/deprecated-component");
class DropdownTemplateRule extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        this.enabled = false;
        this.deprecatedComponents = [{
                replace: 'nz-dropdown',
                replaceWith: '[nz-dropdown]'
            }, {
                replace: 'nz-dropdown-button',
                replaceWith: '[nz-dropdown]'
            }];
    }
    visitTemplate(template) {
        this.deprecatedComponents.forEach(data => {
            this.failures.push(...(0, deprecated_component_1.deprecatedComponent)(template, data.replace, data.replaceWith));
        });
    }
}
exports.DropdownTemplateRule = DropdownTemplateRule;
//# sourceMappingURL=dropdown-template-rule.js.map