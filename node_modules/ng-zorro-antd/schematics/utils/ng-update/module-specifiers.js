"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ngZorroModuleSpecifier = void 0;
exports.isNgZorroImportDeclaration = isNgZorroImportDeclaration;
exports.isNgZorroExportDeclaration = isNgZorroExportDeclaration;
const schematics_1 = require("@angular/cdk/schematics");
exports.ngZorroModuleSpecifier = 'ng-zorro-antd';
function isNgZorroImportDeclaration(node) {
    return isNgZorroDeclaration((0, schematics_1.getImportDeclaration)(node));
}
function isNgZorroExportDeclaration(node) {
    return isNgZorroDeclaration((0, schematics_1.getExportDeclaration)(node));
}
function isNgZorroDeclaration(declaration) {
    if (!declaration.moduleSpecifier) {
        return false;
    }
    const moduleSpecifier = declaration.moduleSpecifier.getText();
    return moduleSpecifier.indexOf(exports.ngZorroModuleSpecifier) !== -1;
}
//# sourceMappingURL=module-specifiers.js.map