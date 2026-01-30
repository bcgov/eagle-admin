"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTestProject = createTestProject;
/** Create a base project used for testing. */
function createTestProject(runner_1, projectType_1) {
    return __awaiter(this, arguments, void 0, function* (runner, projectType, appOptions = {}, tree) {
        const workspaceTree = yield runner.runExternalSchematic('@schematics/angular', 'workspace', {
            name: 'workspace',
            version: '6.0.0',
            newProjectRoot: 'projects'
        }, tree);
        return runner.runExternalSchematic('@schematics/angular', projectType, Object.assign({ name: 'ng-zorro' }, appOptions), workspaceTree);
    });
}
//# sourceMappingURL=test-project.js.map