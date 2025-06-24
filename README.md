# bcgov / eagle-admin

Admin site project for management of EPIC

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

Before setting up the project, ensure you have **Node.js 14** installed. We recommend using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) for easy Node.js version management.

To install nvm and Node.js 14 on Debian-based systems:

```bash
# Install nvm if you don't have it
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Load nvm (you may need to restart your terminal or run these commands)
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

# Install and use Node.js 14
nvm install 14
nvm use 14

# Verify Node.js version
node -v  # Should output v14.x.x
```

Once Node.js 14 is active, install project dependencies using:

```bash
npm i
```

## Build, Lint, Test, and Run

After installing Node.js 14 and project dependencies, you can use the following commands to work with the project:

### Start the Development Server

```bash
npm start
```
This will start the webpack development server on port 4200. Visit [http://localhost:4200](http://localhost:4200) to view the application.

### Build the Project

```bash
npm run build
```
This will build the project for production. The build artifacts will be stored in the `dist/` directory.

### Lint the Code

```bash
npm run lint
```
This will lint your app code using ESLint and output any issues in a stylish format.

### Run Unit Tests

```bash
npm run test
```
This will run the unit tests in watch mode using Karma and Jasmine.

To run tests once in a CI environment (headless):

```bash
npm run test-ci
```

## CI/CD Pipeline

The EPIC project has moved away from PR based pipeline due to complexity and reliability concerns of the PR based pipeline implementation. The current CI/CD pipeline utilizes Github Actions to build Docker images and push them back into the BC Gov OpenShift Docker registry.

A full description and guide to the EPIC pipeline and branching strategy is available in the [eagle-dev-guides](https://github.com/bcgov/eagle-dev-guides/blob/master/dev_guides/github_action_pipeline.md) repository.

## Angular Code scaffolding

A brief guide to Angular CLI's code scaffolding can be found in [eagle-dev-guides](https://github.com/bcgov/eagle-dev-guides/blob/master/dev_guides/angular_scaffolding.md)


## How to Contribute

Feel free to create pull requests from the default "develop" branch, click here to create one automatically: <https://github.com/bcgov/eagle-admin/pull/new/develop>
