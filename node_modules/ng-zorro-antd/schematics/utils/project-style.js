"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProjectStyle = getProjectStyle;
const schematics_1 = require("@angular/cdk/schematics");
const schema_1 = require("@schematics/angular/application/schema");
function getProjectStyle(project) {
    const stylesPath = (0, schematics_1.getProjectStyleFile)(project);
    const style = stylesPath ? stylesPath.split('.').pop() : schema_1.Style.Css;
    return style;
}
//# sourceMappingURL=project-style.js.map