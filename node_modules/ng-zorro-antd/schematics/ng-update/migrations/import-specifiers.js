"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportSpecifiersMigration = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const ts = require("typescript");
const module_specifiers_1 = require("../../utils/ng-update/module-specifiers");
const upgrade_data_1 = require("../upgrade-data");
class ImportSpecifiersMigration extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        /** Change data that upgrades to the specified target version. */
        this.data = (0, upgrade_data_1.getVersionUpgradeData)(this, 'importSpecifiers');
        // Only enable the migration rule if there is upgrade data.
        this.enabled = this.data.length !== 0;
    }
    visitNode(node) {
        if (ts.isImportDeclaration(node)) {
            this.visitImportDeclaration(node);
        }
    }
    visitImportDeclaration(node) {
        if ((0, module_specifiers_1.isNgZorroImportDeclaration)(node)) {
            return this._createFailureWithReplacement(node);
        }
    }
    /** Creates a failure and replacement for the specified identifier. */
    _createFailureWithReplacement(identifier) {
        const upgradeData = this.data.find(({ replace }) => identifier.moduleSpecifier.getText().indexOf(replace) !== -1);
        if (upgradeData) {
            const filePath = this.fileSystem.resolve(identifier.getSourceFile().fileName);
            this.fileSystem.edit(filePath)
                .remove(identifier.moduleSpecifier.getStart() + 1, identifier.moduleSpecifier.getWidth() - 2) // quotes
                .insertRight(identifier.moduleSpecifier.getStart() + 1, upgradeData.replaceWith);
        }
    }
}
exports.ImportSpecifiersMigration = ImportSpecifiersMigration;
//# sourceMappingURL=import-specifiers.js.map