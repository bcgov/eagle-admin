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
  window.__env.BANNER_COLOUR = 'yellow';

  // API — proxy.conf.js reads API_LOCATION to generate dev server proxy rules
  // The Angular app uses relative paths (/api, /analytics) — never API_LOCATION directly
  window.__env.API_LOCATION = 'http://localhost:3000';
  window.__env.API_PATH = '/api';

  // Keycloak configuration
  window.__env.KEYCLOAK_CLIENT_ID = 'eagle-admin-console';
  window.__env.KEYCLOAK_URL = 'https://dev.loginproxy.gov.bc.ca/auth';
  window.__env.KEYCLOAK_REALM = 'eao-epic';
  window.__env.KEYCLOAK_ENABLED = true;
  window.__env.REDIRECT_KEY = 'REDIRECT';

  // Analytics — proxied through /analytics (eagle-api forwards to penguin-analytics)
  window.__env.ANALYTICS_API_URL = '/analytics';
  window.__env.ANALYTICS_DEBUG = true;
}(this));