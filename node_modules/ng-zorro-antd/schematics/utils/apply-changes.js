"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyChangesToFile = applyChangesToFile;
const change_1 = require("@schematics/angular/utility/change");
function applyChangesToFile(host, filePath, changes) {
    const recorder = host.beginUpdate(filePath);
    changes.forEach((change) => {
        if (change instanceof change_1.InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
    });
    host.commitUpdate(recorder);
}
//# sourceMappingURL=apply-changes.js.map