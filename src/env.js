(function (window) {
  window.__env = window.__env || {};

  // Log level: 0 = All, 1 = Debug, 2 = Info, 3 = Warn, 4 = Error
  window.__env.logLevel = 0;

  // Get config from remote host?
  // false = use env.js values only (local dev)
  // true = fetch config from API endpoint (deployed environments)
  window.__env.configEndpoint = false;

  // Environment name
  window.__env.ENVIRONMENT = 'local'; // local | dev | test | prod
  window.__env.BANNER_COLOUR = 'red';

  // API configuration
  // For local dev: proxy routes to dev OpenShift API (see proxy.conf.json)
  // For deployed: configEndpoint=true fetches from /api/config
  window.__env.API_LOCATION = '';
  window.__env.API_PATH = '/api';

  // Keycloak configuration
  window.__env.KEYCLOAK_CLIENT_ID = 'eagle-admin-console';
  window.__env.KEYCLOAK_URL = 'https://dev.loginproxy.gov.bc.ca/auth';
  window.__env.KEYCLOAK_REALM = 'eao-epic';
  window.__env.KEYCLOAK_ENABLED = true;
  window.__env.REDIRECT_KEY = 'REDIRECT';

  // Analytics - for local dev, use localhost penguin-analytics (port 3001)
  // For deployed: use /api/analytics which rproxy routes to penguin-analytics
  window.__env.ANALYTICS_API_URL = 'http://localhost:3001';
  window.__env.ANALYTICS_DEBUG = true;
}(this));