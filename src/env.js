(function (window) {
  window.__env = window.__env || {};

  // Ideally in our app we have a wrapper around our logger class in the angular front ends to
  // turn on/off the console.log's
  window.__env.debugMode = true;

  // Detect environment from hostname at runtime
  const hostname = window.location.hostname;
  
  // Environment configuration based on hostname
  const envConfigs = {
    'eagle-dev.apps.silver.devops.gov.bc.ca': {
      environment: 'dev',
      bannerColour: 'blue',
      apiLocation: 'https://eagle-dev.apps.silver.devops.gov.bc.ca',
      keycloakUrl: 'https://dev.loginproxy.gov.bc.ca/auth',
      analyticsUrl: 'https://penguin-analytics-api-6cdc9e-dev.apps.silver.devops.gov.bc.ca/events'
    },
    'eagle-test.apps.silver.devops.gov.bc.ca': {
      environment: 'test',
      bannerColour: 'orange',
      apiLocation: 'https://eagle-test.apps.silver.devops.gov.bc.ca',
      keycloakUrl: 'https://test.loginproxy.gov.bc.ca/auth',
      analyticsUrl: 'https://penguin-analytics-api-6cdc9e-test.apps.silver.devops.gov.bc.ca/events'
    },
    'projects.eao.gov.bc.ca': {
      environment: 'prod',
      bannerColour: 'green',
      apiLocation: 'https://projects.eao.gov.bc.ca',
      keycloakUrl: 'https://loginproxy.gov.bc.ca/auth',
      analyticsUrl: 'https://penguin-analytics-api-6cdc9e-prod.apps.silver.devops.gov.bc.ca/events'
    }
  };

  // Default to local config
  const config = envConfigs[hostname] || {
    environment: 'local',
    bannerColour: 'red',
    apiLocation: 'https://eagle-dev.apps.silver.devops.gov.bc.ca',
    keycloakUrl: 'https://dev.loginproxy.gov.bc.ca/auth',
    analyticsUrl: '/api/analytics'  // Uses proxy.conf.json locally
  };

  // Environment name
  window.__env.ENVIRONMENT = config.environment;
  window.__env.BANNER_COLOUR = config.bannerColour;
  window.__env.API_LOCATION = config.apiLocation;
  window.__env.API_PATH = '/api';
  window.__env.API_PUBLIC_PATH = '/api/public';
  window.__env.KEYCLOAK_CLIENT_ID = 'eagle-admin-console';
  window.__env.KEYCLOAK_URL = config.keycloakUrl;
  window.__env.KEYCLOAK_REALM = 'eao-epic';
  window.__env.KEYCLOAK_ENABLED = true;

  // Analytics configuration
  window.__env.ANALYTICS_API_URL = config.analyticsUrl;
  window.__env.ANALYTICS_DEBUG = config.environment === 'local';

  // Add any feature-toggles
  // window.__env.coolFeatureActive = false;
}(this));