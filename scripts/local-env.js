// Run as main: writes tmp/local-env/env.js, the env.js `ng serve` serves (src/env.js plus
// Keycloak lines from .env.local or the shell). Builds never read it.
const fs = require('fs');
const path = require('path');
const util = require('util');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
// process.env holds the whole shell; only these keys may reach the browser.
const BROWSER_KEYS = ['KEYCLOAK_URL', 'KEYCLOAK_REALM'];

const envJsPath = root => path.join(root, 'src', 'env.js');

function readLocalEnv(root = ROOT) {
  const file = path.join(root, '.env.local');
  const fromFile = fs.existsSync(file) ? util.parseEnv(fs.readFileSync(file, 'utf-8')) : {};
  return { ...fromFile, ...process.env };
}

function readEnvJs(root = ROOT) {
  const sandbox = { __env: {} };
  vm.runInNewContext(fs.readFileSync(envJsPath(root), 'utf-8'), sandbox);
  return sandbox.__env;
}

function writeServeEnvJs(root = ROOT) {
  const env = readLocalEnv(root);
  const lines = BROWSER_KEYS
    .filter(key => env[key])
    .map(key => `\nwindow.__env.${key} = ${JSON.stringify(env[key])};`);
  const outDir = path.join(root, 'tmp', 'local-env');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'env.js'), fs.readFileSync(envJsPath(root), 'utf-8') + lines.join(''));
}

if (require.main === module) writeServeEnvJs();

module.exports = { readLocalEnv, readEnvJs, writeServeEnvJs };
