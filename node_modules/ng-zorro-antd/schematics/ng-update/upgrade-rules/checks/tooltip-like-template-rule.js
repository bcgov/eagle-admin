"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TooltipLikeTemplateRule = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const deprecated_component_1 = require("../utils/deprecated-component");
class TooltipLikeTemplateRule extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        this.enabled = true;
        this.deprecatedComponents = [{
                replace: 'nz-tooltip',
                replaceWith: '[nz-tooltip]'
            }, {
                replace: 'nz-popover',
                replaceWith: '[nz-popover]'
            }, {
                replace: 'nz-popconfirm',
                replaceWith: '[nz-popconfirm]'
            }];
    }
    visitTemplate(template) {
        this.deprecatedComponents.forEach(data => {
            this.failures.push(...(0, deprecated_component_1.deprecatedComponent)(template, data.replace, data.replaceWith));
        });
    }
}
exports.TooltipLikeTemplateRule = TooltipLikeTemplateRule;
//# sourceMappingURL=tooltip-like-template-rule.js.map