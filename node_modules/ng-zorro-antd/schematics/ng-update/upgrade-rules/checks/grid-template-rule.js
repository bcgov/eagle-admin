"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridTemplateRule = void 0;
const schematics_1 = require("@angular/cdk/schematics");
class GridTemplateRule extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        this.enabled = false;
    }
    visitTemplate(template) {
        const offsets = [];
        offsets.push(...(0, schematics_1.findInputsOnElementWithAttr)(template.content, 'nzType', ['nz-row']));
        offsets.push(...(0, schematics_1.findInputsOnElementWithTag)(template.content, 'nzType', ['nz-form-item', 'nz-row']));
        offsets.forEach(offset => {
            this.failures.push({
                filePath: template.filePath,
                position: template.getCharacterAndLineOfPosition(offset),
                message: `Found deprecated input '[nzType]'. Please manually remove this input.`
            });
        });
        (0, schematics_1.findInputsOnElementWithTag)(template.content, 'nzFlex', ['nz-form-item']).forEach(offset => {
            this.failures.push({
                filePath: template.filePath,
                position: template.getCharacterAndLineOfPosition(offset),
                message: `Found deprecated input '[nzFlex]'. Please manually remove this input.`
            });
        });
    }
}
exports.GridTemplateRule = GridTemplateRule;
//# sourceMappingURL=grid-template-rule.js.map