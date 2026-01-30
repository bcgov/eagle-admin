"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const schematics_1 = require("@angular-devkit/schematics");
const build_component_1 = require("../../utils/build-component");
function default_1(options) {
    return (0, schematics_1.chain)([
        (0, build_component_1.buildComponent)(Object.assign({}, options), {
            template: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.html.template',
            stylesheet: './__path__/__name@dasherize@if-flat__/__name@dasherize__.component.__style__.template'
        })
    ]);
}
//# sourceMappingURL=index.js.map