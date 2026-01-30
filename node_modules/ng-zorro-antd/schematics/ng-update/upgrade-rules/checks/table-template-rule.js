"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableTemplateRule = void 0;
const schematics_1 = require("@angular/cdk/schematics");
class TableTemplateRule extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        this.enabled = false;
    }
    visitTemplate(template) {
        const content = template.content.replace('nz-table', 'table  ');
        (0, schematics_1.findOutputsOnElementWithTag)(content, 'nzSortChangeWithKey', ['th'])
            .forEach(offset => {
            this.failures.push({
                filePath: template.filePath,
                position: template.getCharacterAndLineOfPosition(offset),
                message: `Found deprecated output 'th(nzSortChangeWithKey)'. Please manually remove this output.`
            });
        });
        (0, schematics_1.findInputsOnElementWithTag)(content, 'nzSingleSort', ['thead'])
            .forEach(offset => {
            this.failures.push({
                filePath: template.filePath,
                position: template.getCharacterAndLineOfPosition(offset),
                message: `Found deprecated input 'thead[nzSingleSort]'. Please manually change to 'th[nzSortFn]'.`
            });
        });
        (0, schematics_1.findInputsOnElementWithTag)(content, 'nzSortKey', ['th'])
            .forEach(offset => {
            this.failures.push({
                filePath: template.filePath,
                position: template.getCharacterAndLineOfPosition(offset),
                message: `Found deprecated input 'th[nzSortKey]'. Please manually change to 'th[nzSortFn]'.`
            });
        });
    }
}
exports.TableTemplateRule = TableTemplateRule;
//# sourceMappingURL=table-template-rule.js.map