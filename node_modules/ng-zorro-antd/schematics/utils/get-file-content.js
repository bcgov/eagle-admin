"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileContent = getFileContent;
function getFileContent(tree, path) {
    const fileEntry = tree.get(path);
    if (!fileEntry) {
        throw new Error(`The file (${path}) does not exist.`);
    }
    return fileEntry.content.toString();
}
//# sourceMappingURL=get-file-content.js.map