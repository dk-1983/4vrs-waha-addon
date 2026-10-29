'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {readOptions, environment} = require('../app/options.cjs');

const valid = {api_key: 'private-api-key-for-test', dashboard_username: 'admin',
  dashboard_password: 'different-panel-password', log_level: 'warn'};

test('settings are required, never reflected in exceptions, and cannot inject headers', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'waha-options-'));
  const file = path.join(dir, 'options.json');
  try {
    for (const change of [{api_key: ''}, {api_key: 'short'},
      {api_key: 'sha512:not-a-plain-key'}, {api_key: 'test-secret\ninvalid'},
      {dashboard_password: ''}, {dashboard_username: 'admin:other'}, {log_level: 'debug'}]) {
      fs.writeFileSync(file, JSON.stringify({...valid, ...change}));
      assert.throws(() => readOptions(file), err => !err.message.includes('test-secret'));
    }
    fs.writeFileSync(file, JSON.stringify(valid));
    const options = readOptions(file);
    assert.equal(options.apiKey, valid.api_key);
    const env = environment(options, {WHATSAPP_API_KEY: 'overriding-secret', PATH: '/bin'});
    assert.equal(env.WHATSAPP_API_KEY, undefined);
    assert.equal(env.WAHA_API_KEY, valid.api_key);
    assert.equal(env.WAHA_LOCAL_STORE_BASE_DIR, '/data/sessions');
    assert.equal(env.WAHA_DASHBOARD_PASSWORD, valid.dashboard_password);
    assert.equal(env.WAHA_PRINT_QR, 'False');
    assert.equal(env.PATH, '/bin');
  } finally {fs.rmSync(dir, {recursive: true});}
});
