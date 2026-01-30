"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.findElementWithoutStructuralDirective = findElementWithoutStructuralDirective;
exports.findElementWithTag = findElementWithTag;
exports.findElementWithClassName = findElementWithClassName;
const parse5_1 = require("parse5");
const hasClassName = (node, className) => {
    var _a, _b;
    return (_b = (_a = node.attrs) === null || _a === void 0 ? void 0 : _a.find) === null || _b === void 0 ? void 0 : _b.call(_a, attr => attr.name === 'class' && attr.value.indexOf(className) !== -1);
};
const compareCaseInsensitive = (a, b) => (a === null || a === void 0 ? void 0 : a.toLowerCase()) === (b === null || b === void 0 ? void 0 : b.toLowerCase());
function findElementWithoutStructuralDirective(html, tagName, directiveName, attr) {
    const document = (0, parse5_1.parseFragment)(html, { sourceCodeLocationInfo: true });
    const elements = [];
    const visitNodes = (nodes) => {
        nodes.forEach(node => {
            if (node['childNodes'] && !(node['tagName'] === 'ng-template' && !!node.attrs.find(a => compareCaseInsensitive(a.name, directiveName)))) {
                visitNodes(node['childNodes']);
            }
            if (compareCaseInsensitive(node['tagName'], tagName)) {
                const element = node;
                const directive = `*${directiveName}`;
                if (!!element.attrs.find(a => compareCaseInsensitive(a.name, attr)) && !element.attrs.find(a => compareCaseInsensitive(a.name, directive))) {
                    elements.push(element);
                }
            }
        });
    };
    visitNodes(document.childNodes);
    return elements
        .filter(e => { var _a; return (_a = e === null || e === void 0 ? void 0 : e.sourceCodeLocation) === null || _a === void 0 ? void 0 : _a.startTag; })
        .map(element => element.sourceCodeLocation.startTag.startOffset);
}
function findElementWithTag(html, tagName) {
    const document = (0, parse5_1.parseFragment)(html, { sourceCodeLocationInfo: true });
    const elements = [];
    const visitNodes = (nodes) => {
        nodes.forEach(node => {
            if (node['childNodes']) {
                visitNodes(node['childNodes']);
            }
            if (compareCaseInsensitive(node['tagName'], tagName)) {
                elements.push(node);
            }
        });
    };
    visitNodes(document.childNodes);
    return elements
        .filter(e => { var _a; return (_a = e === null || e === void 0 ? void 0 : e.sourceCodeLocation) === null || _a === void 0 ? void 0 : _a.startTag; })
        .map(element => element.sourceCodeLocation.startTag.startOffset);
}
function findElementWithClassName(html, className, tagName) {
    const document = (0, parse5_1.parseFragment)(html, { sourceCodeLocationInfo: true });
    const elements = [];
    const visitNodes = (nodes) => {
        nodes.forEach(node => {
            if (node['childNodes']) {
                visitNodes(node['childNodes']);
            }
            if (compareCaseInsensitive(node['tagName'], tagName) && hasClassName(node, className)) {
                elements.push(node);
            }
        });
    };
    visitNodes(document.childNodes);
    return elements
        .filter(e => { var _a; return (_a = e === null || e === void 0 ? void 0 : e.sourceCodeLocation) === null || _a === void 0 ? void 0 : _a.startTag; })
        .map(element => element.sourceCodeLocation.attrs.class.startOffset);
}
//# sourceMappingURL=elements.js.map