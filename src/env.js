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
  // Dynamically set by run script at container startup via %PENGUIN_ANALYTICS_URL%
  // Default: uses relative proxy path /api/analytics (nginx reverse proxy)
  // Can be overridden via PENGUIN_ANALYTICS_URL env variable during deployment
  window.__env.ANALYTICS_API_URL = '%PENGUIN_ANALYTICS_URL%';
  window.__env.ANALYTICS_DEBUG = window.__env.ENVIRONMENT === 'local';

  // Add any feature-toggles
  // window.__env.coolFeatureActive = false;
}(this));