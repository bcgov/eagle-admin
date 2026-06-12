/**
 * Dev server proxy — auto-generated from src/env.js
 *
 * env.js is the single source of truth.  Change API_LOCATION there;
 * the dev server picks it up on next restart.  No need to touch this file.
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
  '/analytics': proxyRule
};
