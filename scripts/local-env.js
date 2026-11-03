// Run as main: writes tmp/local-env/env.js, the env.js `ng serve` serves (src/env.js plus
// Keycloak lines from .env.local or the shell). Builds never read it.
const fs = require('fs');
const path = require('path');
const util = require('util');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const ENV_JS = path.join(ROOT, 'src', 'env.js');
const OUT_DIR = path.join(ROOT, 'tmp', 'local-env');
// process.env holds the whole shell; only these keys may reach the browser.
const BROWSER_KEYS = ['KEYCLOAK_URL', 'KEYCLOAK_REALM'];

function readLocalEnv() {
  const file = path.join(ROOT, '.env.local');
  const fromFile = fs.existsSync(file) ? util.parseEnv(fs.readFileSync(file, 'utf-8')) : {};
  return { ...fromFile, ...process.env };
}

function readEnvJs() {
  const sandbox = { __env: {} };
  vm.runInNewContext(fs.readFileSync(ENV_JS, 'utf-8'), sandbox);
  return sandbox.__env;
}

function writeServeEnvJs() {
  const env = readLocalEnv();
  const lines = BROWSER_KEYS
    .filter(key => env[key])
    .map(key => `\nwindow.__env.${key} = ${JSON.stringify(env[key])};`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, 'env.js'), fs.readFileSync(ENV_JS, 'utf-8') + lines.join(''));
}

if (require.main === module) writeServeEnvJs();

module.exports = { readLocalEnv, readEnvJs };
