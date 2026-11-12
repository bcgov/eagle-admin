// Targets come from the shell, then .env.local, then test (see .env.example). Restart to apply.
const { readLocalEnv, readEnvJs } = require('./scripts/local-env');

const env = readLocalEnv();
const target = env.EAGLE_API_TARGET || readEnvJs().API_LOCATION || 'http://localhost:3000';

const proxyRule = {
  target,
  secure: false,
  changeOrigin: true,
  // eagle-demi OCR extraction can take 280s. proxyTimeout is the socket toward the
  // target; timeout is the inbound socket.
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
  },
  // View Document's cached public route. The edge serves /demi-search itself, so no pathRewrite.
  '/demi-search': {
    target: env.DEMI_SEARCH_TARGET || 'https://test.projects.eao.gov.bc.ca',
    secure: false,
    changeOrigin: true
  }
};
