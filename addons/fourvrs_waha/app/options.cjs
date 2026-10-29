'use strict';

const fs = require('node:fs');

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
  return {apiKey, username, password, logLevel: value.log_level};
}

function environment(options, inherited = {}) {
  const result = {...inherited};
  // Never inherit an alternate credential that overrides the configured API key.
  delete result.WHATSAPP_API_KEY;
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

module.exports = {readOptions, environment};
