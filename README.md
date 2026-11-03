# bcgov / eagle-admin

Admin site project for management of EPIC

## Documentation

All documentation has been consolidated in the [Eagle Documentation Wiki](https://github.com/bcgov/eagle-dev-guides/wiki):

* **[Architecture Overview](https://github.com/bcgov/eagle-dev-guides/wiki/Architecture-Overview)** - System components and request flow
* **[Configuration Management](https://github.com/bcgov/eagle-dev-guides/wiki/Configuration-Management)** - ConfigService pattern and environment variables
* **[Deployment Pipeline](https://github.com/bcgov/eagle-dev-guides/wiki/Deployment-Pipeline)** - CI/CD workflows and procedures
* **[Local Development](https://github.com/bcgov/eagle-dev-guides/wiki/Local-Development)** - Setting up your development environment
* **[Rollback Procedures](https://github.com/bcgov/eagle-dev-guides/wiki/Rollback-Procedures)** - How to rollback deployments
* **[Troubleshooting](https://github.com/bcgov/eagle-dev-guides/wiki/Troubleshooting)** - Common issues and solutions

## Related projects

Eagle is a revision name of the EAO EPIC application suite.

These projects comprise EAO EPIC:

* <https://github.com/bcgov/eagle-api>
* <https://github.com/bcgov/eagle-public>
* <https://github.com/bcgov/eagle-admin>
* <https://github.com/bcgov/eagle-mobile-inspections>
* <https://github.com/bcgov/eagle-reports>
* <https://github.com/bcgov/eagle-helper-pods>
* <https://github.com/bcgov/eagle-dev-guides>

## Pre-requisites

You need Node.js 24.15 or later in the 24 line. The Angular CLI does not start on older 24.x releases. `.nvmrc` pins the version, so you can install it with [nvm](https://github.com/nvm-sh/nvm):

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm (or open a new terminal)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Install and use the pinned Node.js version
nvm install
nvm use
node -v  # v24.15.0
```

The project uses Yarn 4, which ships with Node through corepack. Turn corepack on once, then install dependencies:

```bash
corepack enable
yarn install
```

## Build, Lint, Test, and Run

### Start the Development Server

```bash
yarn start
```

The dev server runs on port 4200. Open <http://localhost:4200/admin/>.

The local app runs against the test environment by default. The dev server proxies `/api` to eagle-api test and `/demi/api` to DEMI test.

You sign in with the test Keycloak (`eao-epic` realm). Your account needs the `sysadmin` realm role, or the app sends you to `/admin/not-authorized`.

### Point the Dev Server Elsewhere

Copy `.env.example` to `.env.local`, edit it, and restart `yarn start`. Use `yarn start`, not bare `ng serve`: it writes the `env.js` the dev server serves.

| Variable | What it sets | Default |
|---|---|---|
| `KEYCLOAK_URL` | Keycloak base URL, `/auth` included | `https://test.loginproxy.gov.bc.ca/auth` |
| `KEYCLOAK_REALM` | Keycloak realm | `eao-epic` |
| `EAGLE_API_TARGET` | Where `/api` and `/analytics` go | `API_LOCATION` in `src/env.js` (eagle-api test) |
| `DEMI_API_TARGET` | Where `/demi/api` goes | `https://demi-apim-test.azure-api.net` |

A variable set in your shell wins over `.env.local`. Change the Keycloak and API lines together, so they name the same environment.

Sign-in needs a `http://localhost:4200/*` redirect on the `eagle-admin-console` client in the realm you choose. Under `yarn start` the app keeps these Keycloak values and does not read them from DEMI `/config`.

### Build the Project

```bash
yarn build
```
This will build the project for production. The build artifacts will be stored in the `dist/` directory.

### Lint the Code

```bash
yarn lint
```
This will lint your app code using ESLint and output any issues in a stylish format.

### Run Unit Tests

```bash
yarn test
```
This will run the unit tests in watch mode using Karma and Jasmine.

To run tests once in headless Chrome:

```bash
yarn test-ci
```

Karma needs `CHROME_BIN` to find a Chrome or Chromium binary. Set it first if Karma cannot find a browser:

```bash
export CHROME_BIN=$(command -v chromium || command -v google-chrome)
```

## CI/CD Pipeline

See the [Deployment Pipeline](https://github.com/bcgov/eagle-dev-guides/wiki/Deployment-Pipeline) documentation in the central wiki for complete CI/CD workflow information.


## How to Contribute

Feel free to create pull requests from the default "develop" branch, click here to create one automatically: <https://github.com/bcgov/eagle-admin/pull/new/develop>

