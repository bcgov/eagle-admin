"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassNamesMigration = void 0;
const schematics_1 = require("@angular/cdk/schematics");
const ts = require("typescript");
const module_specifiers_1 = require("../../utils/ng-update/module-specifiers");
const upgrade_data_1 = require("../upgrade-data");
class ClassNamesMigration extends schematics_1.Migration {
    constructor() {
        super(...arguments);
        /** Change data that upgrades to the specified target version. */
        this.data = (0, upgrade_data_1.getVersionUpgradeData)(this, 'classNames');
        /**
         * List of identifier names that have been imported from `@ng-zorro-antd`
         * in the current source file and therefore can be considered trusted.
         */
        this.trustedIdentifiers = new Set();
        /** List of namespaces that have been imported from `@ng-zorro-antd`. */
        this.trustedNamespaces = new Set();
        // Only enable the migration rule if there is upgrade data.
        this.enabled = this.data.length !== 0;
    }
    visitNode(node) {
        if (ts.isIdentifier(node)) {
            this.visitIdentifier(node);
        }
    }
    /** Method that is called for every identifier inside of the specified project. */
    visitIdentifier(identifier) {
        if (!this.data.some(data => data.replace === identifier.text)) {
            return;
        }
        if ((0, schematics_1.isNamespaceImportNode)(identifier) && (0, module_specifiers_1.isNgZorroImportDeclaration)(identifier)) {
            this.trustedNamespaces.add(identifier.text);
            return this._createFailureWithReplacement(identifier);
        }
        if ((0, schematics_1.isExportSpecifierNode)(identifier) && (0, module_specifiers_1.isNgZorroExportDeclaration)(identifier)) {
            return this._createFailureWithReplacement(identifier);
        }
        if ((0, schematics_1.isImportSpecifierNode)(identifier) && (0, module_specifiers_1.isNgZorroImportDeclaration)(identifier)) {
            this.trustedIdentifiers.add(identifier.text);
            return this._createFailureWithReplacement(identifier);
        }
        if (ts.isPropertyAccessExpression(identifier.parent)) {
            const expression = identifier.parent.expression;
            if (ts.isIdentifier(expression) && this.trustedNamespaces.has(expression.text)) {
                return this._createFailureWithReplacement(identifier);
            }
        }
        else if (this.trustedIdentifiers.has(identifier.text)) {
            return this._createFailureWithReplacement(identifier);
        }
    }
    /** Creates a failure and replacement for the specified identifier. */
    _createFailureWithReplacement(identifier) {
        const classData = this.data.find(data => data.replace === identifier.text);
        const filePath = this.fileSystem.resolve(identifier.getSourceFile().fileName);
        this.fileSystem.edit(filePath)
            .remove(identifier.getStart(), identifier.getWidth())
            .insertRight(identifier.getStart(), classData.replaceWith);
    }
}
exports.ClassNamesMigration = ClassNamesMigration;
//# sourceMappingURL=class-names.js.map