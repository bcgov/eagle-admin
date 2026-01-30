"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.addIconToAssets = addIconToAssets;
const schematics_1 = require("@angular/cdk/schematics");
const utility_1 = require("@schematics/angular/utility");
const chalk_1 = require("chalk");
const iconPathSegment = '@ant-design/icons-angular';
const iconAssetObject = {
    'glob': '**/*',
    'input': './node_modules/@ant-design/icons-angular/src/inline-svg/',
    'output': '/assets/'
};
function addIconToAssets(options) {
    return (0, utility_1.updateWorkspace)(workspace => {
        const project = (0, schematics_1.getProjectFromWorkspace)(workspace, options.project);
        const targetOptions = (0, schematics_1.getProjectTargetOptions)(project, 'build');
        if (!targetOptions.assets) {
            targetOptions.assets = [Object.assign({}, iconAssetObject)];
        }
        else {
            const assets = targetOptions.assets;
            const assetsString = JSON.stringify(assets);
            if (!assetsString.includes(iconPathSegment)) {
                assets.push(Object.assign({}, iconAssetObject));
            }
            else {
                console.log();
                console.log((0, chalk_1.yellow)(`Could not add the icon assets to the CLI project assets ` +
                    `because there is already a icon assets file referenced.`));
                console.log((0, chalk_1.yellow)(`Please manually add the following config to your assets:`));
                console.log((0, chalk_1.cyan)(JSON.stringify(iconAssetObject, null, 2)));
                return;
            }
        }
    });
}
//# sourceMappingURL=add-icon-assets.js.map