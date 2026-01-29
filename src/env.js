(function (window) {
  window.__env = window.__env || {};

  // Ideally in our app we have a wrapper around our logger class in the angular front ends to
  // turn on/off the console.log's
  window.__env.debugMode = true;

  // Environment name
  window.__env.ENVIRONMENT = 'local';  // local | dev | test | prod
  window.__env.BANNER_COLOUR = 'red'
  window.__env.API_LOCATION = 'https://eagle-dev.apps.silver.devops.gov.bc.ca';
  window.__env.API_PATH = '/api';
  window.__env.API_PUBLIC_PATH = '/api/public';
  window.__env.KEYCLOAK_CLIENT_ID = 'eagle-admin-console';
  window.__env.KEYCLOAK_URL = 'https://dev.loginproxy.gov.bc.ca/auth';
  window.__env.KEYCLOAK_REALM = 'eao-epic';
  window.__env.KEYCLOAK_ENABLED = true;

  // Analytics configuration
  // Uses relative path - nginx reverse proxies /api/analytics to penguin-analytics service
  window.__env.ANALYTICS_API_URL = '/api/analytics';
  window.__env.ANALYTICS_DEBUG = window.__env.ENVIRONMENT === 'local';

  // Add any feature-toggles
  // window.__env.coolFeatureActive = false;
}(this));