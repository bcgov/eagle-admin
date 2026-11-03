(function (window) {
  window.__env = window.__env || {};

  // Log level: 0 = All, 1 = Debug, 2 = Info, 3 = Warn, 4 = Error
  window.__env.logLevel = 0;

  // true = merge DEMI /config over these values; false = env.js values only.
  // Local dev runs against test: the dev server proxies /api and /demi/api there.
  window.__env.configEndpoint = true;

  // Environment name
  window.__env.ENVIRONMENT = 'test'; // local | dev | test | prod
  window.__env.BANNER_COLOUR = 'blue';

  // API — proxy.conf.js reads API_LOCATION to generate dev server proxy rules
  // The Angular app uses relative paths (/api) — never API_LOCATION directly
  window.__env.API_LOCATION = 'https://eagle-test.apps.silver.devops.gov.bc.ca';
  window.__env.API_PATH = '/api';

  // DEMI native reads — same-origin path the edge forwards to DEMI
  window.__env.DEMI_API_PATH = '/demi/api';

  // Keycloak configuration
  window.__env.KEYCLOAK_CLIENT_ID = 'eagle-admin-console';
  window.__env.KEYCLOAK_URL = 'https://test.loginproxy.gov.bc.ca/auth';
  window.__env.KEYCLOAK_REALM = 'eao-epic';
  window.__env.KEYCLOAK_ENABLED = true;
  window.__env.REDIRECT_KEY = 'REDIRECT';

  // Application Insights; empty disables browser telemetry. Deployed builds take
  // DEMI /config/public's value; ng serve keeps this one.
  window.__env.APPINSIGHTS_CONNECTION_STRING = '';

  // eagle-analytics ingest base; empty keeps the client off. Deployed builds take
  // DEMI /config/public's value; ng serve keeps this one.
  window.__env.EAGLE_ANALYTICS_URL = '';

  // EPIC.centre API base for the "last accessed" record; empty sends nothing
  window.__env.CENTRE_API_URL = '';
}(this));