# bcgov / eagle-admin

Admin site project for management of EPIC

## Documentation

All documentation has been consolidated in the [Eagle Documentation Wiki](https://github.com/bcgov/eagle-dev-guides/wiki):

* **[Architecture Overview](https://github.com/bcgov/eagle-dev-guides/wiki/Architecture-Overview)** - System components and request flow
* **[Configuration Management](https://github.com/bcgov/eagle-dev-guides/wiki/Configuration-Management)** - ConfigService pattern and environment variables
* **[Deployment Pipeline](https://github.com/bcgov/eagle-dev-guides/wiki/Deployment-Pipeline)** - CI/CD workflows and procedures
* **[Helm Charts](https://github.com/bcgov/eagle-dev-guides/wiki/Helm-Charts)** - Kubernetes deployment configuration
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

Before setting up the project, ensure you have **Node.js 24** installed. We recommend using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) for easy Node.js version management.

To install nvm and Node.js 24 on Debian-based systems:

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm (you may need to restart your terminal or run these commands)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install and use Node.js 24
nvm install 24
nvm use 24

# Verify Node.js version
node -v  # Should output v24.x.x
```

Once Node.js 24 is active, install project dependencies using Yarn:

```bash
yarn install
```

## Build, Lint, Test, and Run

After installing Node.js 24 and project dependencies, you can use the following commands to work with the project:

### Start the Development Server

```bash
yarn start
```
This will start the webpack development server on port 4200. Visit [http://localhost:4200](http://localhost:4200) to view the application.

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

To run tests once in a CI environment (headless):

```bash
yarn test-ci
```

## CI/CD Pipeline

See the [Deployment Pipeline](https://github.com/bcgov/eagle-dev-guides/wiki/Deployment-Pipeline) documentation in the central wiki for complete CI/CD workflow information.


## How to Contribute

Feel free to create pull requests from the default "develop" branch, click here to create one automatically: <https://github.com/bcgov/eagle-admin/pull/new/develop>

