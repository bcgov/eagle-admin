# @digitalspace/eagle-analytics-client

Browser client for the EPIC analytics ingest API. TypeScript, no runtime dependencies, ESM and CommonJS builds.

It queues events, batches them, and posts them to `POST ${apiUrl}/events`. On page hide it uses `navigator.sendBeacon` so the last events are not lost.

## Install

Published to GitHub Packages, which asks for a token on every install even though this repository is
public. The registry line on its own gets a 401.

`eagle-public` and `eagle-admin` are both Yarn 4, which ignores `.npmrc`, so the config goes in
`.yarnrc.yml`:

```yaml
npmScopes:
  digitalspace:
    npmRegistryServer: "https://npm.pkg.github.com"
    npmAlwaysAuth: true
    npmAuthToken: "${GH_PACKAGES_TOKEN:-}"
```

An npm or Yarn 1 consumer uses `.npmrc` instead:

```
@digitalspace:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GH_PACKAGES_TOKEN}
```

```sh
yarn add @digitalspace/eagle-analytics-client
```

In GitHub Actions the workflow's own `GITHUB_TOKEN` is enough once this package grants that
repository read access. Anywhere else the token is a classic personal access token with
`read:packages`.

## React

```ts
// src/app/analytics/analytics.ts
const analytics = createAnalytics({ apiUrl: config.ANALYTICS_API_URL, sourceApp: 'eagle-public', enhancedTracking: true });
export const page = (name?: string, properties?: Record<string, unknown>) => analytics.page(name, properties);
export const track = (event: string, properties?: Record<string, unknown>) => analytics.track(event, properties);
```

## Angular

```ts
// src/app/services/analytics/analytics.service.ts
private analytics = createAnalytics({ apiUrl: this.config.ANALYTICS_API_URL, sourceApp: 'eagle-admin', enhancedTracking: true });
identify(userId: string, traits?: Record<string, unknown>) { this.analytics.identify(userId, traits); }
track(event: string, properties?: Record<string, unknown>) { this.analytics.track(event, properties); }
```

## Config

| Option | Default | Meaning |
|---|---|---|
| `apiUrl` | none | Ingest base URL or path. Empty gives a no-op instance, so a build with tracking off needs no other change. |
| `sourceApp` | none | App name stored with every event, for example `eagle-public`. |
| `debug` | `false` | Log send failures to the console. Off in production. |
| `enhancedTracking` | `false` | Automatic events: page view context, link and button clicks, activity heartbeat, session start and end. |
| `trafficTracking` | `false` | Campaign and referrer attribution on page views and session start. |
| `fetch` | global `fetch` | Override for tests or a wrapped transport. |

Batching is fixed: 20 events per request, a partial batch every 5 seconds, and a `User Active`
heartbeat every 30 seconds while the tab is visible.

Deployed apps read these from the eagle-api `Config` collection:

| Config key | Option |
|---|---|
| `ANALYTICS_API_URL` | `apiUrl` |
| `ANALYTICS_ENHANCED_TRACKING` | `enhancedTracking` |
| `ANALYTICS_TRAFFIC_TRACKING` | `trafficTracking` |
| `ANALYTICS_DEBUG` | `debug` |

## API

```ts
createAnalytics(config: AnalyticsConfig): Analytics
```

- `page(name?, properties?)` sends `Page Viewed` with path, title and referrer, plus screen, viewport, user agent and language under enhanced tracking.
- `track(event, properties?)` sends one custom event. Event names are trimmed to 100 characters. An
  event whose properties serialise past 8000 bytes is dropped, because the server would reject the
  batch it travelled in.
- `identify(userId, traits?)` sends `User Identified` and attaches the user id to later events. Admin apps only; the public app stays anonymous.
- `reset()` ends the session, forgets the user, and starts a fresh session id. Call it on logout.
- `flush()` posts anything queued. Returns a promise that always resolves.
- `destroy()` removes the listeners and timers, then flushes.

Nothing here throws into the host app: listener and method bodies are guarded, and failed requests are dropped rather than retried.

## Privacy

- Session id is a random UUID in `sessionStorage`, one per tab. No cookies, no `localStorage`, no consent banner needed.
- User id is held in memory only, and only when `identify()` is called.
- The full URL is sent only under enhanced tracking, because query strings can carry search terms.
- The ingest Function derives coarse geography from the request IP and never stores the IP.

## Development

```sh
yarn install
yarn test        # vitest, jsdom
yarn typecheck
yarn build       # dist/index.js (ESM), dist/index.cjs, and .d.ts / .d.cts types
```

## Releases

The tag drives the publish, and it has to match the version in `package.json`.

1. Bump `version` in `client/package.json` on `main`.
2. Tag that commit `client-vX.Y.Z` with the same numbers.
3. Push the tag.

```sh
git tag client-v0.1.0
git push origin client-v0.1.0
```

Pushing the tag runs `.github/workflows/publish-client.yaml`: it compares the tag against
`package.json` and stops there if they disagree, then typechecks, tests, builds and publishes to
GitHub Packages. The run's own `GITHUB_TOKEN` is the only credential.

It then creates the GitHub release for the tag, if it does not exist yet, and attaches two files:

| Asset | What it is |
|---|---|
| `eagle-analytics-client-X.Y.Z.tgz` | `yarn pack` of `client/`: `package.json`, `README.md` and the built `dist/`. |
| `SHA256SUMS` | Checksum of the tarball, and of each file in `dist/`. |

`dist/` is gitignored, so the tag alone carries no build. The release assets are the only thing that
ties a vendored copy to a version.

The registry will not accept a version it already holds, so a bad publish needs a new patch version
rather than a moved tag.

## Vendoring

`eagle-admin` and `eagle-public` do not install from GitHub Packages. They keep a copy under
`vendor/eagle-analytics-client/` and depend on the directory, so no token is involved. Take a new
version from the release, not from a local build. Nobody else can check a local build.

```sh
VERSION=0.1.0
gh release download "client-v${VERSION}" -R digitalspace/eagle-analytics \
  -p "eagle-analytics-client-${VERSION}.tgz" -p SHA256SUMS

# Fails loudly if the tarball is not the one the release run built.
sha256sum -c SHA256SUMS --ignore-missing

tar -xzf "eagle-analytics-client-${VERSION}.tgz"      # extracts to package/
( cd package && sha256sum -c ../SHA256SUMS --ignore-missing )   # checks each dist file
```

Then, in the consumer repository:

1. Replace `vendor/eagle-analytics-client/` with `package/`'s `dist/`, `package.json` and
   `README.md`.
2. Record the tag and the tarball's sha256 in that directory's `README.md`, so the next person can
   tell which release the checked-in `dist/` came from without rebuilding it.
3. Run `yarn install` and commit.

Nothing else needs changing: the dependency stays
`"@digitalspace/eagle-analytics-client": "file:./vendor/eagle-analytics-client"`.
