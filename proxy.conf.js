// Targets come from the shell, then .env.local, then test (see .env.example). Restart to apply.
const { readLocalEnv, readEnvJs } = require('./scripts/local-env');

const env = readLocalEnv();
const target = env.EAGLE_API_TARGET || readEnvJs().API_LOCATION || 'http://localhost:3000';

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
    target: env.DEMI_API_TARGET || 'https://demi-apim-test.azure-api.net',
    secure: false,
    changeOrigin: true,
    pathRewrite: { '^/demi/api': '/api' }
  }
};
