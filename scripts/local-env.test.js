const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { readLocalEnv, readEnvJs, writeServeEnvJs } = require('./local-env');

const KEYS = ['FOO_TOKEN', 'KEYCLOAK_URL', 'KEYCLOAK_REALM', 'EAGLE_API_TARGET'];
let saved;
let root;

function writeFixture(file, text) {
  fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
  fs.writeFileSync(path.join(root, file), text);
}

beforeEach(() => {
  saved = Object.fromEntries(KEYS.map(key => [key, process.env[key]]));
  // Empty values hide any shell or .env.local line, so results do not depend on the dev's machine.
  KEYS.forEach(key => { process.env[key] = ''; });
  root = fs.mkdtempSync(path.join(os.tmpdir(), 'local-env-'));
});

afterEach(() => {
  KEYS.forEach(key => (saved[key] === undefined ? delete process.env[key] : (process.env[key] = saved[key])));
  fs.rmSync(root, { recursive: true, force: true });
});

test('writes only the Keycloak keys into the served env.js', () => {
  writeFixture('src/env.js', 'window.__env = {};');
  writeFixture('.env.local', 'FOO_TOKEN=from-file\n');
  process.env.FOO_TOKEN = 'from-shell';
  process.env.KEYCLOAK_REALM = 'probe-realm';

  writeServeEnvJs(root);

  assert.equal(
    fs.readFileSync(path.join(root, 'tmp/local-env/env.js'), 'utf-8'),
    'window.__env = {};\nwindow.__env.KEYCLOAK_REALM = "probe-realm";'
  );
});

test('a shell variable wins over the same line in .env.local', () => {
  writeFixture('.env.local', 'KEYCLOAK_REALM=file-realm\n');
  process.env.KEYCLOAK_REALM = 'shell-realm';

  assert.equal(readLocalEnv(root).KEYCLOAK_REALM, 'shell-realm');
});

test('proxies /api to env.js API_LOCATION when EAGLE_API_TARGET is unset', () => {
  const proxy = require('../proxy.conf.js');

  assert.equal(proxy['/api'].target, readEnvJs().API_LOCATION);
});
