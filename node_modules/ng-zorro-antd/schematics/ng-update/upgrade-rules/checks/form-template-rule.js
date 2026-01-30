"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormTemplateRule = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const deprecated_component_1 = require("../utils/deprecated-component");
class FormTemplateRule extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        this.enabled = false;
        this.deprecatedComponents = [{
                replace: 'nz-form-extra',
                replaceWith: 'nz-form-control[nzExtra]'
            }, {
                replace: 'nz-form-explain',
                replaceWith: 'nz-form-control[nzSuccessTip][nzWarningTip][nzErrorTip][nzValidatingTip]...'
            }];
    }
    visitTemplate(template) {
        this.deprecatedComponents.forEach(data => {
            this.failures.push(...(0, deprecated_component_1.deprecatedComponent)(template, data.replace, data.replaceWith));
        });
    }
}
exports.FormTemplateRule = FormTemplateRule;
//# sourceMappingURL=form-template-rule.js.map