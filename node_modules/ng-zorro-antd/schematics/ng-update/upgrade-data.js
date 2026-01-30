"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nzUpgradeData = void 0;
exports.getVersionUpgradeData = getVersionUpgradeData;
const schematics_1 = require("@angular/cdk/schematics");
const data_1 = require("./data");
/** Upgrade data that will be used for the NG-ZORRO ng-update schematic. */
exports.nzUpgradeData = {
    attributeSelectors: data_1.attributeSelectors,
    classNames: data_1.classNames,
    constructorChecks: data_1.constructorChecks,
    cssSelectors: data_1.cssSelectors,
    cssTokens: data_1.cssTokens,
    elementSelectors: data_1.elementSelectors,
    inputNames: data_1.inputNames,
    methodCallChecks: data_1.methodCallChecks,
    outputNames: data_1.outputNames,
    propertyNames: data_1.propertyNames,
    symbolRemoval: data_1.symbolRemoval,
    importSpecifiers: data_1.importSpecifiers
};
/**
 * Gets the reduced upgrade data for the specified data key. The function reads out the
 * target version and upgrade data object from the migration and resolves the specified
 * data portion that is specifically tied to the target version.
 */
function getVersionUpgradeData(migration, dataName) {
    if (migration.targetVersion === null) {
        return [];
    }
    // Note that below we need to cast to `unknown` first TS doesn't infer the type of T correctly.
    return (0, schematics_1.getChangesForTarget)(migration.targetVersion, migration.upgradeData[dataName]);
}
//# sourceMappingURL=upgrade-data.js.map