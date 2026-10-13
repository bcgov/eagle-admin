/**
 * Dev server proxy — auto-generated from src/env.js
 *
 * env.js is the single source of truth for /api.  Change API_LOCATION there;
 * the dev server picks it up on next restart.  /demi/api always goes to DEMI test.
 */
const fs   = require('fs');
const vm   = require('vm');
const path = require('path');

const envJs = fs.readFileSync(path.join(__dirname, 'src', 'env.js'), 'utf-8');
const sandbox = { __env: {} };
vm.runInNewContext(envJs, sandbox);

const target = sandbox.__env.API_LOCATION || 'http://localhost:3000';

const proxyRule = {
  target,
  secure: false,
  changeOrigin: true,
  // Prevent Angular dev server from timing out long-running proxied requests
  // (e.g. eagle-demi OCR extraction can take up to 280s).
  // proxyTimeout = socket timeout toward the target; timeout = inbound socket timeout.
  proxyTimeout: 350_000,
  timeout: 350_000,
};

module.exports = {
  '/api':       proxyRule,
  '/analytics': proxyRule,
  // DEMI_API_PATH. DEMI has no dev instance; the edge maps /demi/api onto DEMI's /api, and so does this rule.
  '/demi/api': {
    target: 'https://demi-apim-test.azure-api.net',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/demi/api': '/api' }
  }
};
