"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarTemplateRule = void 0;
const schematics_1 = require("@angular/cdk/schematics");
class CalendarTemplateRule extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        this.enabled = false;
    }
    visitTemplate(template) {
        (0, schematics_1.findInputsOnElementWithTag)(template.content, 'nzCard', ['nz-calendar'])
            .forEach(offset => {
            this.failures.push({
                filePath: template.filePath,
                position: template.getCharacterAndLineOfPosition(offset),
                message: `Found deprecated input "nzCard" component. Use "nzFullscreen" to instead please.`
            });
        });
    }
}
exports.CalendarTemplateRule = CalendarTemplateRule;
//# sourceMappingURL=calendar-input-rule.js.map