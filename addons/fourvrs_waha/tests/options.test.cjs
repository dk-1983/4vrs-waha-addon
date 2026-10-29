'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {readOptions, environment, proxyOptions} = require('../app/options.cjs');

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

test('independent proxy switch clears ambient routes and validates all protocols', () => {
  const ambient = {WHATSAPP_PROXY_SERVER:'ambient:80', WHATSAPP_PROXY_SERVER_LIST:'a:1,b:2',
    WHATSAPP_PROXY_SERVER_USERNAME:'old', WHATSAPP_PROXY_SERVER_PASSWORD:'old-secret',
    HTTP_PROXY:'http://ambient:80', ALL_PROXY:'socks5://ambient:80'};
  const direct = environment({}, ambient);
  for (const key of Object.keys(ambient)) assert.equal(direct[key], undefined);
  assert.equal(proxyOptions({proxy_enabled:false, proxy_url:'invalid'}), null);
  for (const scheme of ['http', 'https', 'socks5']) {
    const proxy = proxyOptions({proxy_enabled:true, proxy_url:scheme+'://proxy.test:1234'});
    const env = environment({proxy}, ambient);
    assert.equal(env.WHATSAPP_PROXY_SERVER, scheme+'://proxy.test:1234');
    assert.equal(env.WHATSAPP_PROXY_SERVER_LIST, undefined);
  }
  const proxy = proxyOptions({proxy_enabled:true,proxy_url:'https://proxy.test:443',
    proxy_username:'user',proxy_password:'secret'});
  assert.equal(environment({proxy}).WHATSAPP_PROXY_SERVER_PASSWORD, 'secret');
  for (const url of ['http://user:secret@proxy:80','http://proxy:0','ftp://proxy:80',
    'http://proxy:80/path','http://proxy:80?x=1','http://proxy;direct:80','http://proxy:80,other:80']) {
    assert.throws(() => proxyOptions({proxy_enabled:true,proxy_url:url}));
  }
  assert.throws(() => proxyOptions({proxy_enabled:true,proxy_url:'socks5://proxy:1080',
    proxy_username:'user',proxy_password:'secret'}), /SOCKS5 authentication unsupported/);
});
