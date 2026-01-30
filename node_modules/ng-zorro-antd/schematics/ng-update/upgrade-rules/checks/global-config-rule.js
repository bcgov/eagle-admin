"use strict";
/**
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://github.com/NG-ZORRO/ng-zorro-antd/blob/master/LICENSE
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalConfigRule = void 0;
const injection_token_rule_1 = require("./injection-token-rule");
class GlobalConfigRule extends injection_token_rule_1.InjectionTokenRule {
    constructor() {
        super(...arguments);
        this.enabled = false;
        this.tokens = [];
    }
    getFailure(token) {
        return `Found deprecated symbol "${token}" which has been removed. Please use 'NzConfigService' instead.`;
    }
}
exports.GlobalConfigRule = GlobalConfigRule;
//# sourceMappingURL=global-config-rule.js.map