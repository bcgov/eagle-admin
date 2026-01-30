"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceTemplateRule = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const deprecated_component_1 = require("../utils/deprecated-component");
class SpaceTemplateRule extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        this.enabled = false;
    }
    visitTemplate(template) {
        this.failures.push(...(0, deprecated_component_1.deprecatedComponent)(template, 'nz-space-item', 'ng-template[nzSpaceItem]'));
    }
}
exports.SpaceTemplateRule = SpaceTemplateRule;
//# sourceMappingURL=space-template-rule.js.map