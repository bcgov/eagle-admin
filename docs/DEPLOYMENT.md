# Eagle-Admin Deployment Guide

## Overview

Eagle-admin uses GitHub Actions for CI/CD with manual deployment to test/prod environments via `workflow_dispatch`.

## Architecture

- **Build Once, Deploy Everywhere**: Images are built once in dev, then tagged for test/prod
- **Configuration Management**: Uses `configEndpoint=true` to fetch runtime config from `/api/config`
- **Environment Detection**: Runtime configuration from eagle-api overrides env.js defaults

## Deployment Workflow

### 1. Dev Environment (Automatic)

**Trigger**: Push to `develop` branch

```yaml
# .github/workflows/deploy-to-dev.yaml
on:
  push:
    branches: [develop]
```

**Process**:
1. Installs dependencies with Yarn
2. **Modifies env.js**:
   ```bash
   sed -i "s|window.__env.configEndpoint = false;|window.__env.configEndpoint = true;|g" src/env.js
   ```
3. Builds Angular app (`yarn build`)
4. Pushes Docker image with tags: `ci-latest` and `dev`
5. Tags trigger automatic deployment to dev namespace

**Key Point**: `configEndpoint=true` means the app fetches config from `/api/config` at runtime.

---

### 2. Test Environment (Manual)

**Trigger**: `workflow_dispatch` (manual via GitHub Actions UI)

```bash
# Via GitHub UI: Actions → Deploy to Test → Run workflow
```

**Process**:
1. Tags existing `ci-latest` image as `test`
2. Image tag change triggers rollout in test namespace

**Why no rebuild?**: We use the same image as dev. The app fetches environment-specific config from `/api/config`, so no need to rebuild with different ENVIRONMENT values.

---

### 3. Prod Environment (Manual)

**Trigger**: `workflow_dispatch` (manual via GitHub Actions UI)

```bash
# Via GitHub UI: Actions → Deploy to Prod → Run workflow
```

**Process**:
1. Tags existing `test` image as `prod`
2. Image tag change triggers rollout in prod namespace

---

## Configuration System

### env.js (Bundled in Image)

Located at `src/env.js`, modified during build:

```javascript
// Before build (local dev)
window.__env.configEndpoint = false;
window.__env.ENVIRONMENT = 'local';
window.__env.ANALYTICS_API_URL = 'http://localhost:3001/analytics';

// After build (deployed environments)
window.__env.configEndpoint = true;  // ← Changed by sed
window.__env.ENVIRONMENT = 'local';  // ← NOT changed (doesn't matter)
window.__env.ANALYTICS_API_URL = 'http://localhost:3001/analytics';  // ← NOT changed (doesn't matter)
```

**Why doesn't ENVIRONMENT matter?** Because `configEndpoint=true` means the app calls `/api/config` at startup and **overrides** these values with environment-specific config.

---

### Runtime Config (/api/config)

Served by eagle-api, loaded by `ConfigService.init()` on app startup.

**Flow**:
1. Angular app loads, `env.js` runs first
2. ConfigService sees `configEndpoint=true`
3. Fetches `/api/config` from eagle-api
4. Merges API response over env.js values (API wins)

**eagle-api /api/config response example**:
```json
{
  "ENVIRONMENT": "test",
  "BANNER_COLOUR": "green",
  "API_LOCATION": "",
  "ANALYTICS_API_URL": "/analytics",
  "KEYCLOAK_URL": "https://test.loginproxy.gov.bc.ca/auth",
  ...
}
```

---

## Required eagle-api Environment Variables

For eagle-admin to get correct config, eagle-api **must** have these env vars set:

### Dev (6cdc9e-dev)
```bash
oc set env dc/eagle-api \
  ENVIRONMENT=dev \
  BANNER_COLOUR=yellow \
  ANALYTICS_API_URL=/analytics \
  -n 6cdc9e-dev
```

### Test (6cdc9e-test)
```bash
oc set env dc/eagle-api \
  ENVIRONMENT=test \
  BANNER_COLOUR=green \
  ANALYTICS_API_URL=/analytics \
  -n 6cdc9e-test
```

### Prod (6cdc9e-prod)
```bash
oc set env dc/eagle-api \
  ENVIRONMENT=prod \
  BANNER_COLOUR= \
  ANALYTICS_API_URL=/analytics \
  -n 6cdc9e-prod
```

**Verify config endpoint**:
```bash
# Dev
curl -s https://eagle-dev.apps.silver.devops.gov.bc.ca/api/config | jq

# Test
curl -s -u admin:fooey https://test.projects.eao.gov.bc.ca/api/config | jq

# Prod
curl -s https://projects.eao.gov.bc.ca/api/config | jq
```

---

## Troubleshooting

### Issue: App shows wrong environment or config

**Symptoms**:
- Banner color is wrong
- Analytics not working
- App using localhost URLs in deployed environment

**Diagnosis**:
1. Check if `configEndpoint=true` in deployed env.js:
   ```bash
   curl -s https://test.projects.eao.gov.bc.ca/admin/env.js | grep configEndpoint
   ```

2. Check what `/api/config` returns:
   ```bash
   curl -s https://test.projects.eao.gov.bc.ca/api/config | jq
   ```

3. Check browser console for config logs:
   - Open DevTools → Console
   - Look for "Initial configuration from env.js" and "Final configuration" logs

**Solutions**:
- If `configEndpoint=false`: Redeploy from latest `ci-latest` image
- If `/api/config` returns wrong values: Fix eagle-api environment variables (see above)
- If browser cached old JS: Hard refresh (Ctrl+Shift+R)

---

### Issue: Test/prod deployment failed

**Check image tag**:
```bash
# What image is test using?
oc get dc eagle-admin -n 6cdc9e-test -o jsonpath='{.spec.triggers[?(@.type=="ImageChange")].imageChangeParams.from.name}'

# When was ci-latest built?
oc get istag eagle-admin:ci-latest -n 6cdc9e-tools -o jsonpath='{.image.dockerImageMetadata.Created}'
```

**Manually trigger rollout**:
```bash
oc rollout latest dc/eagle-admin -n 6cdc9e-test
```

---

### Issue: Analytics not working

**Verify analytics configuration**:
1. Check eagle-api has `ANALYTICS_API_URL=/analytics`:
   ```bash
   oc get dc eagle-api -n 6cdc9e-test -o jsonpath='{.spec.template.spec.containers[0].env[?(@.name=="ANALYTICS_API_URL")].value}'
   ```

2. Check rproxy has analytics location block:
   ```bash
   oc exec -n 6cdc9e-test deployment/rproxy -- cat /etc/nginx/conf.d/server.conf | grep -A5 "location /analytics"
   ```

3. Check penguin-analytics is running:
   ```bash
   oc get pods -n 6cdc9e-test -l app=penguin-analytics-api
   ```

4. Test endpoint directly:
   ```bash
   curl -X POST https://test.projects.eao.gov.bc.ca/analytics \
     -H "Content-Type: application/json" \
     -d '{"eventType":"test","sessionId":"test123","sourceApp":"eagle-admin"}'
   ```

---

## Local Development

For local development, keep `configEndpoint=false` in `src/env.js`:

```javascript
window.__env.configEndpoint = false;  // Use env.js values only
window.__env.ENVIRONMENT = 'local';
window.__env.ANALYTICS_API_URL = 'http://localhost:3001/analytics';
```

The `proxy.conf.json` routes `/api` to dev OpenShift API.

---

## Image Promotion Flow

```
develop branch push
    ↓
  Build
    ↓
ci-latest + dev tags
    ↓ (manual via workflow_dispatch)
  test tag
    ↓ (manual via workflow_dispatch)
  prod tag
```

**Why this works**: All environments use the same image with `configEndpoint=true`, fetching environment-specific config from their local eagle-api instance at runtime.

---

## Best Practices

1. **Never manually edit env.js in deployed pods** - changes will be lost on next rollout
2. **Use `/api/config` for environment differences** - update eagle-api env vars instead
3. **Test in dev before promoting to test** - ensure config changes work correctly
4. **Use workflow_dispatch for test/prod** - manual control prevents accidental deployments
5. **Verify `/api/config` after eagle-api changes** - ensure frontend gets correct values
