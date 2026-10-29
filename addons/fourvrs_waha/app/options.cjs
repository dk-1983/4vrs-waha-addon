'use strict';

const fs = require('node:fs');
const net = require('node:net');

function proxyOptions(value) {
  if (!value.proxy_enabled) return null;
  const raw = value.proxy_url;
  if (typeof raw !== 'string' || !/^(http|https|socks5):\/\/(\[[^\]]+\]|[^:/?#]+):[0-9]+\/?$/.test(raw) ||
      /[\x00-\x20\x7f]/.test(raw)) throw new Error('Invalid proxy_url');
  const parsed = new URL(raw);
  const host = parsed.hostname.replace(/^\[|\]$/g, '');
  if (parsed.username || parsed.password || parsed.search || parsed.hash ||
      (!net.isIP(host) && !/^[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?$/.test(host))) {
    throw new Error('Invalid proxy_url');
  }
  const explicitPort = Number(raw.match(/:([0-9]+)\/?$/)[1]);
  if (explicitPort < 1 || explicitPort > 65535) throw new Error('Invalid proxy_url');
  const username = value.proxy_username || '';
  const password = value.proxy_password || '';
  if (typeof username !== 'string' || typeof password !== 'string' ||
      username.length > 255 || password.length > 255 || username.includes(':') ||
      /[\x00-\x1f\x7f]/.test(username + password) || Boolean(username) !== Boolean(password)) {
    throw new Error('Invalid proxy credentials');
  }
  if (parsed.protocol === 'socks5:' && username) throw new Error('SOCKS5 authentication unsupported by Chromium');
  return {server: parsed.origin === 'null' ? raw.replace(/\/$/, '') : parsed.origin,
    username, password};
}

function readOptions(path = '/data/options.json') {
  const value = JSON.parse(fs.readFileSync(path, 'utf8'));
  function text(key, min, max) {
    const result = value[key];
    if (typeof result !== 'string' || result.length < min || result.length > max ||
        /[\x00-\x1f\x7f]/.test(result) || result !== result.trim()) {
      throw new Error(`Invalid ${key}`);
    }
    return result;
  }
  const apiKey = text('api_key', 16, 512);
  // Upstream interprets this prefix as a hash rather than a literal key.
  if (apiKey.startsWith('sha512:')) throw new Error('Use a plain API key');
  const username = text('dashboard_username', 1, 64);
  if (username.includes(':')) throw new Error('Invalid dashboard_username');
  const password = text('dashboard_password', 16, 512);
  if (!['warn', 'error'].includes(value.log_level)) throw new Error('Invalid log_level');
  return {apiKey, username, password, logLevel: value.log_level, proxy: proxyOptions(value)};
}

function environment(options, inherited = {}) {
  const result = {...inherited};
  // Never inherit an alternate credential that overrides the configured API key.
  delete result.WHATSAPP_API_KEY;
  // Disabled means direct; never inherit an ambient proxy or proxy rotation list.
  for (const key of ['WHATSAPP_PROXY_SERVER', 'WHATSAPP_PROXY_SERVER_LIST',
    'WHATSAPP_PROXY_SERVER_INDEX_PREFIX', 'WHATSAPP_PROXY_SERVER_USERNAME',
    'WHATSAPP_PROXY_SERVER_PASSWORD', 'HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY',
    'http_proxy', 'https_proxy', 'all_proxy']) delete result[key];
  if (options.proxy) {
    result.WHATSAPP_PROXY_SERVER = options.proxy.server;
    result.WHATSAPP_PROXY_SERVER_USERNAME = options.proxy.username;
    result.WHATSAPP_PROXY_SERVER_PASSWORD = options.proxy.password;
  }
  return Object.assign(result, {
    WAHA_API_KEY: options.apiKey,
    WHATSAPP_API_HOSTNAME: '0.0.0.0',
    WHATSAPP_API_PORT: '3000',
    WHATSAPP_DEFAULT_ENGINE: 'WEBJS',
    WAHA_LOCAL_STORE_BASE_DIR: '/data/sessions',
    WAHA_DASHBOARD_ENABLED: 'True',
    WAHA_DASHBOARD_USERNAME: options.username,
    WAHA_DASHBOARD_PASSWORD: options.password,
    WHATSAPP_SWAGGER_ENABLED: 'True',
    WHATSAPP_SWAGGER_USERNAME: options.username,
    WHATSAPP_SWAGGER_PASSWORD: options.password,
    WAHA_PRINT_QR: 'False',
    WAHA_LOG_LEVEL: options.logLevel,
    WAHA_EVENTS_DOWNLOAD_MEDIA: 'False',
    WAHA_API_DOWNLOAD_MEDIA: 'False',
    WAHA_CLIENT_DEVICE_NAME: '4VRS Intercom',
    NODE_OPTIONS: '--max-old-space-size=2048',
  });
}

module.exports = {readOptions, environment, proxyOptions};
