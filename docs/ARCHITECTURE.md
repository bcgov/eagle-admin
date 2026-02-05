# Eagle System Architecture

## Table of Contents
- [Configuration System](#configuration-system)
- [Deployment Architecture](#deployment-architecture)
- [Analytics Integration](#analytics-integration)
- [Route Architecture](#route-architecture)
- [Component Flow](#component-flow)
- [How to Update Configs](#how-to-update-configs)

---

## Configuration System

### Two-Stage Configuration Pattern

The Eagle system uses a two-stage configuration approach that provides both build-time defaults and runtime environment-specific overrides.

#### Stage 1: Build-Time (env.js)

**Location:** `src/env.js`

The env.js file is bundled into the Angular build and provides default configuration values:

```javascript
window.__env = window.__env || {};
window.__env.API_LOCATION = 'http://localhost:3000';
window.__env.ENVIRONMENT = 'local';
window.__env.configEndpoint = false;  // false for local, true for deployed
window.__env.BANNER_COLOUR = 'red';
window.__env.ANALYTICS_API_URL = '/analytics';
```

**Local Development:**
- `configEndpoint = false` → Use env.js values only
- No API call to `/api/config`
- Developers can edit env.js directly

**Deployed Environments:**
- `configEndpoint = true` → Fetch runtime config from `/api/config`
- Set via sed during GitHub Actions build:
  ```bash
  sed -i "s|window.__env.configEndpoint = false;|window.__env.configEndpoint = true;|g" src/env.js
  sed -i "s|window.__env.ENVIRONMENT = 'local';|window.__env.ENVIRONMENT = 'dev|test|prod';|g" src/env.js
  ```

#### Stage 2: Runtime (/api/config)

**Service:** [src/app/services/config.service.ts](../src/app/services/config.service.ts)

When `configEndpoint = true`, the ConfigService fetches environment-specific configuration from the eagle-api backend:

```typescript
public async init(): Promise<void> {
  this.configuration = window.__env || {};
  
  if (this.configuration.configEndpoint === true) {
    try {
      const apiConfig = await this.getConfigFromApi();
      this.configuration = { ...this.configuration, ...apiConfig };
    } catch (e) {
      console.error('Error getting API configuration, using env.js defaults:', e);
    }
  }
}
```

**Key Points:**
- APP_INITIALIZER ensures `init()` completes before app starts
- API config values override env.js values: `{ ...window.__env, ...apiConfig }`
- Fallback to env.js defaults if API call fails
- No race conditions because init() blocks app startup

#### Configuration Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Angular Build                                            │
│    - src/env.js bundled with defaults                       │
│    - GitHub Actions runs sed to set configEndpoint=true     │
│    - GitHub Actions runs sed to set ENVIRONMENT='dev|test|prod' │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. App Bootstrap (APP_INITIALIZER)                          │
│    - ConfigService.init() runs BEFORE app starts            │
│    - Loads window.__env (from bundled env.js)               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Runtime Config Fetch (if configEndpoint=true)            │
│    - HTTP GET to /api/config                                │
│    - eagle-api returns environment variables                │
│    - Merge: { ...env.js, ...apiConfig } (API wins)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Component Usage                                           │
│    - Components inject ConfigService                         │
│    - Read ConfigService.config.ENVIRONMENT, etc.            │
│    - Values are accurate and environment-specific           │
└─────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### GitHub Actions Workflows

All workflows use the pattern: **Build per environment with correct values baked in**

#### 1. Deploy to Dev (Automatic)

**Trigger:** Push to `develop` branch  
**File:** [.github/workflows/deploy-to-dev.yaml](../.github/workflows/deploy-to-dev.yaml)

```yaml
on:
  push:
    branches: [develop]

steps:
  - sed: configEndpoint = true, ENVIRONMENT = 'dev'
  - yarn build
  - docker build -f Dockerfile.Github
  - docker push as ci-latest and dev tags
  - OpenShift DeploymentConfig auto-rollout
```

#### 2. Deploy to Test (Manual)

**Trigger:** Manual workflow_dispatch  
**File:** [.github/workflows/deploy-to-test.yaml](../.github/workflows/deploy-to-test.yaml)

```yaml
on:
  workflow_dispatch:

steps:
  - sed: configEndpoint = true, ENVIRONMENT = 'test'
  - yarn build
  - docker build -f Dockerfile.Github
  - docker push as test tag
  - OpenShift DeploymentConfig auto-rollout
```

#### 3. Deploy to Prod (Manual)

**Trigger:** Manual workflow_dispatch  
**File:** [.github/workflows/deploy-to-prod.yaml](../.github/workflows/deploy-to-prod.yaml)

```yaml
on:
  workflow_dispatch:

steps:
  - sed: configEndpoint = true, ENVIRONMENT = 'prod'
  - yarn build
  - docker build -f Dockerfile.Github
  - docker push as prod tag
  - OpenShift DeploymentConfig auto-rollout
```

### OpenShift Deployment Flow

```
GitHub Actions                OpenShift Registry              OpenShift Cluster
     │                              │                               │
     │  docker build                │                               │
     │─────────────────────────────>│                               │
     │                              │                               │
     │  docker push as dev/test/prod│                               │
     │─────────────────────────────>│                               │
     │                              │                               │
     │                              │  Image tag change detected    │
     │                              │──────────────────────────────>│
     │                              │                               │
     │                              │     DeploymentConfig          │
     │                              │     triggers rollout          │
     │                              │                               │
     │                              │     New pods created          │
     │                              │     with updated image        │
     │                              │                               │
```

**Namespaces:**
- `6cdc9e-tools`: Build artifacts, image registry
- `6cdc9e-dev`: Dev environment deployments
- `6cdc9e-test`: Test environment deployments
- `6cdc9e-prod`: Prod environment deployments

---

## Analytics Integration

### penguin-analytics Service

**Technology:** Node.js + Express + PostgreSQL  
**Deployment:** Separate pod in each namespace  
**Documentation:** [penguin-analytics/docs/DEPLOYMENT.md](../../../penguin-analytics/docs/DEPLOYMENT.md)

**Endpoints:**
```
POST /analytics/event       - Record analytics event
GET  /analytics/health      - Health check
```

### Frontend Integration

**Service:** [src/app/services/analytics.service.ts](../src/app/services/analytics.service.ts)

The AnalyticsService reads the analytics API URL from ConfigService:

```typescript
constructor(private configService: ConfigService) {
  this.analyticsUrl = this.configService.config.ANALYTICS_API_URL;
}

trackEvent(eventData: any) {
  return this.http.post(`${this.analyticsUrl}/event`, eventData);
}
```

**Configuration Sources:**
1. **env.js default:** `ANALYTICS_API_URL = '/analytics'`
2. **API override:** eagle-api returns configured value from `ANALYTICS_API_URL` env var
3. **Routing:** rproxy forwards `/analytics/*` to penguin-analytics-api service

---

## Route Architecture

### External Access (projects.eao.gov.bc.ca)

```
Internet
   │
   │  HTTPS (port 443)
   │
   ▼
┌────────────────────────────────┐
│  OpenShift Route               │
│  projects.eao.gov.bc.ca        │
└────────────────────────────────┘
   │
   │  Routes to rproxy Service
   │
   ▼
┌────────────────────────────────┐
│  rproxy Pod (Caddy)            │
│  Reverse proxy / Load balancer │
└────────────────────────────────┘
   │
   │  Path-based routing:
   │
   ├──> /admin/*       → eagle-admin:8080
   │
   ├──> /api/*         → eagle-api:3000
   │
   └──> /analytics/*   → penguin-analytics-api:3001
```

### Internal Cluster DNS

**Services** (accessible within OpenShift cluster):
```
eagle-admin:8080              → eagle-admin pods
eagle-api:3000                → eagle-api pods
penguin-analytics-api:3001    → penguin-analytics pods
```

### Network Policies

Network policies control ingress/egress between pods:

```yaml
# eagle-admin can call eagle-api
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: allow-eagle-admin-to-api
spec:
  ingress:
    - from:
      - podSelector:
          matchLabels:
            app: eagle-admin
```

---

## Component Flow

### Header Banner Example

Shows how configuration flows through the system to display environment banners.

**Component:** [src/app/header/header.component.ts](../src/app/header/header.component.ts)

```typescript
ngOnInit() {
  this.envName = this.api.env;           // Line 86
  this.bannerColour = this.api.bannerColour;
  
  if (this.envName && this.bannerColour && 
      this.bannerColour !== 'no-banner-colour-set') {
    this.showBanner = true;
  }
}
```

**Service Chain:**

1. **ApiService** ([src/app/services/api.ts](../src/app/services/api.ts)):
   ```typescript
   get env(): string {
     return this.configService.config.ENVIRONMENT;  // Delegates to ConfigService
   }
   
   get bannerColour(): string {
     return this.configService.config.BANNER_COLOUR;
   }
   ```

2. **ConfigService** ([src/app/services/config.service.ts](../src/app/services/config.service.ts)):
   ```typescript
   get config() {
     return this.configuration;  // Merged env.js + API config
   }
   ```

**Flow Diagram:**

```
HeaderComponent.ngOnInit()
    │
    │  reads this.api.env
    ▼
ApiService.env getter
    │
    │  returns this.configService.config.ENVIRONMENT
    ▼
ConfigService.config
    │
    │  returns merged configuration
    ▼
{ ...window.__env, ...apiConfigResponse }
    │
    │  ENVIRONMENT: 'test'    (from eagle-api /api/config)
    │  BANNER_COLOUR: 'green'  (from eagle-api /api/config)
    ▼
Header displays green "TEST ENVIRONMENT" banner
```

### APP_INITIALIZER Safety

**Location:** [src/app/app.module.ts](../src/app/app.module.ts)

```typescript
{
  provide: APP_INITIALIZER,
  useFactory: (configService: ConfigService) => () => configService.init(),
  deps: [ConfigService],
  multi: true
}
```

**Why It Matters:**
- Ensures `ConfigService.init()` completes **before** Angular bootstraps
- Prevents race condition where components read env.js before `/api/config` loads
- Guarantees all components see merged configuration
- Blocks app startup until config is ready

---

## How to Update Configs

### For Specific Environments

Configuration values for deployed environments come from OpenShift environment variables set on the eagle-api deployment. Follow these steps to update configs:

#### 1. Identify Required Configuration

The eagle-api `/api/config` endpoint exposes these variables:

| Variable | Purpose | Example Values |
|----------|---------|----------------|
| `ENVIRONMENT` | Environment name for banner display | `dev`, `test`, `prod` |
| `BANNER_COLOUR` | Banner color for environment | `red`, `green`, `no-banner-colour-set` |
| `ANALYTICS_API_URL` | Analytics endpoint path | `/analytics` |
| `API_LOCATION` | Full API base URL | `https://test.projects.eao.gov.bc.ca/api` |

#### 2. Set Environment Variables on eagle-api

**Using oc command:**

```bash
# Login to OpenShift
oc login --token=<your-token> --server=https://api.silver.devops.gov.bc.ca:6443

# Switch to the target namespace
oc project 6cdc9e-test  # or 6cdc9e-dev, 6cdc9e-prod

# Set environment variables on eagle-api deployment
oc set env deployment/eagle-api \
  ENVIRONMENT="test" \
  BANNER_COLOUR="green" \
  ANALYTICS_API_URL="/analytics" \
  API_LOCATION="https://test.projects.eao.gov.bc.ca/api"

# Verify the variables are set
oc set env deployment/eagle-api --list | grep -E "ENVIRONMENT|BANNER_COLOUR|ANALYTICS"
```

**For all environments:**

```bash
# DEV
oc project 6cdc9e-dev
oc set env deployment/eagle-api \
  ENVIRONMENT="dev" \
  BANNER_COLOUR="red" \
  ANALYTICS_API_URL="/analytics" \
  API_LOCATION="https://dev.projects.eao.gov.bc.ca/api"

# TEST
oc project 6cdc9e-test
oc set env deployment/eagle-api \
  ENVIRONMENT="test" \
  BANNER_COLOUR="green" \
  ANALYTICS_API_URL="/analytics" \
  API_LOCATION="https://test.projects.eao.gov.bc.ca/api"

# PROD
oc project 6cdc9e-prod
oc set env deployment/eagle-api \
  ENVIRONMENT="prod" \
  BANNER_COLOUR="no-banner-colour-set" \
  ANALYTICS_API_URL="/analytics" \
  API_LOCATION="https://projects.eao.gov.bc.ca/api"
```

#### 3. Verify Configuration is Returned

After setting env vars, the eagle-api deployment will automatically rollout. Verify the config endpoint:

```bash
# Test the /api/config endpoint
curl https://test.projects.eao.gov.bc.ca/api/config

# Expected response:
{
  "ENVIRONMENT": "test",
  "BANNER_COLOUR": "green",
  "ANALYTICS_API_URL": "/analytics",
  "API_LOCATION": "https://test.projects.eao.gov.bc.ca/api"
}
```

#### 4. Frontend Automatically Picks Up Changes

No frontend rebuild is required! The ConfigService fetches from `/api/config` on every page load:

1. User visits `https://test.projects.eao.gov.bc.ca/admin`
2. eagle-admin loads, APP_INITIALIZER runs ConfigService.init()
3. ConfigService fetches `/api/config` from eagle-api
4. eagle-api returns current environment variables
5. Frontend uses merged config values
6. Header displays correct banner

### Adding New Configuration Values

To add a new config value that eagle-admin needs:

#### Step 1: Add to eagle-api

**File:** `eagle-api/api/controllers/config.js`

```javascript
exports.getConfiguration = function (args, res, next) {
  res.status(200).json({
    ENVIRONMENT: process.env.ENVIRONMENT,
    BANNER_COLOUR: process.env.BANNER_COLOUR,
    ANALYTICS_API_URL: process.env.ANALYTICS_API_URL,
    API_LOCATION: process.env.API_LOCATION,
    NEW_CONFIG_VALUE: process.env.NEW_CONFIG_VALUE  // Add here
  });
};
```

#### Step 2: Set Environment Variable

```bash
oc set env deployment/eagle-api NEW_CONFIG_VALUE="some-value"
```

#### Step 3: Use in Frontend

```typescript
// In any Angular component/service:
constructor(private configService: ConfigService) {}

ngOnInit() {
  const newValue = this.configService.config.NEW_CONFIG_VALUE;
  console.log('New config value:', newValue);
}
```

#### Step 4: Add Default to env.js (Optional)

For local development, add a default value to `src/env.js`:

```javascript
window.__env.NEW_CONFIG_VALUE = 'local-default-value';
```

This ensures the value exists when running locally with `configEndpoint = false`.

### Troubleshooting Configuration Issues

#### Config Not Updating

**Problem:** Changed env vars but frontend still shows old values

**Solutions:**
1. Check eagle-api restarted after env var change:
   ```bash
   oc get pods | grep eagle-api
   # Should show recent restart time
   ```

2. Verify env vars are set on deployment:
   ```bash
   oc set env deployment/eagle-api --list
   ```

3. Test `/api/config` endpoint directly:
   ```bash
   curl https://test.projects.eao.gov.bc.ca/api/config
   ```

4. Clear browser cache and hard reload (Ctrl+Shift+R)

#### Wrong Environment Displayed

**Problem:** Header shows wrong environment name

**Cause:** Either env.js has wrong value OR `/api/config` not being fetched

**Diagnosis:**
1. Check browser console for ConfigService errors
2. Check Network tab for `/api/config` request
3. Verify `window.__env.configEndpoint = true` in deployed env.js:
   ```bash
   curl https://test.projects.eao.gov.bc.ca/admin/env.js | grep configEndpoint
   ```

**Solution:**
- If `configEndpoint = false`: Rebuild with correct GitHub Actions workflow
- If `/api/config` fails: Check eagle-api is running and network policies allow access

#### Analytics Not Working

**Problem:** Events not being recorded

**Diagnosis:**
1. Check ConfigService has correct `ANALYTICS_API_URL`:
   ```javascript
   // In browser console:
   angular.element(document.body).injector().get('ConfigService').config.ANALYTICS_API_URL
   // Should return: "/analytics"
   ```

2. Check penguin-analytics is running:
   ```bash
   oc get pods | grep penguin-analytics
   ```

3. Check network policy allows eagle-admin → penguin-analytics:
   ```bash
   oc get networkpolicy
   ```

4. Test endpoint directly:
   ```bash
   curl -X POST https://test.projects.eao.gov.bc.ca/analytics/event \
     -H "Content-Type: application/json" \
     -d '{"event": "test"}'
   ```

**Solution:** See [penguin-analytics/docs/DEPLOYMENT.md](../../../penguin-analytics/docs/DEPLOYMENT.md)

---

## Architecture Principles

### Why This Architecture?

1. **Separation of Concerns**
   - Build-time values in env.js (local development)
   - Runtime values from API (environment-specific)
   - Clear separation between local and deployed configs

2. **No Hardcoded Values**
   - All environment-specific values come from OpenShift env vars
   - No need to rebuild frontend to change configs
   - Single source of truth: eagle-api environment variables

3. **Fail-Safe Defaults**
   - If `/api/config` fails, falls back to env.js
   - APP_INITIALIZER prevents race conditions
   - Graceful degradation

4. **Developer Experience**
   - Local development: Just edit env.js, no API needed
   - Deployed environments: Zero config, just works
   - Clear error messages in console

5. **Operational Simplicity**
   - Update config: `oc set env deployment/eagle-api KEY=value`
   - Automatic rollout when image or config changes
   - Easy to verify with curl

### Design Decisions

**Q: Why not use environment variables in Docker image?**  
A: Can't change without rebuilding. Our pattern allows runtime config changes.

**Q: Why fetch /api/config on every page load?**  
A: Ensures fresh config without caching issues. Performance impact is negligible (one request on app init).

**Q: Why keep env.js if /api/config overrides it?**  
A: Provides defaults for local dev and fallback if API is unavailable.

**Q: Why set ENVIRONMENT in env.js during build if API overrides it?**  
A: Future-proofing. If code reads `window.__env` directly, it sees correct values.

---

## See Also

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures and workflows
- [eagle-api/docs/ENVIRONMENT_CONFIGURATION.md](../../../eagle-api/docs/ENVIRONMENT_CONFIGURATION.md) - API environment variables
- [penguin-analytics/docs/DEPLOYMENT.md](../../../penguin-analytics/docs/DEPLOYMENT.md) - Analytics deployment
- [eagle-public/docs/DEPLOYMENT.md](../../../eagle-public/docs/DEPLOYMENT.md) - Public site architecture
