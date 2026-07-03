// @ts-check
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      tseslint.configs.recommended,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-types": "off",
      "@typescript-eslint/no-this-alias": "off",
      "@angular-eslint/no-output-on-prefix": "off"
    }
  },
  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended
    ],
    rules: {
      "@angular-eslint/template/eqeqeq": "off"
    }
  }
]);
