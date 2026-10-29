'use strict';

// Static allowlist only. Never render exception text or configuration values.
const reasons = {
  options_read_failed: 'Cannot read /data/options.json. / Не удалось прочитать настройки дополнения.',
  options_json_invalid: 'Settings must be a JSON object. / Файл настроек должен содержать объект JSON.',
  api_key_invalid: 'API key: 16–512 characters, no surrounding whitespace or control characters. / Ключ API: 16–512 символов, без пробелов по краям и управляющих символов.',
  api_key_hashed: 'Enter a plain API key, not a sha512 hash. / Укажите исходный ключ API, а не хеш sha512.',
  dashboard_username_invalid: 'Dashboard username: 1–64 characters, no colon or surrounding whitespace. / Пользователь панели: 1–64 символа, без двоеточия и пробелов по краям.',
  dashboard_password_invalid: 'Dashboard password: 16–512 characters, no surrounding whitespace or control characters. / Пароль панели: 16–512 символов, без пробелов по краям и управляющих символов.',
  log_level_invalid: 'Log level must be warn or error. / Уровень журнала должен быть warn или error.',
  proxy_url_invalid: 'Proxy URL: http://host:port, https://host:port or socks5://host:port, without embedded credentials, path or whitespace. / Адрес прокси: протокол://адрес:порт, без логина, пароля, пути и пробелов.',
  proxy_credentials_invalid: 'Enter both proxy username and password, or leave both empty; no colon in username or control characters. / Заполните логин и пароль прокси либо оставьте оба пустыми; без двоеточия в логине и управляющих символов.',
  proxy_socks_auth_unsupported: 'SOCKS5 authentication unsupported by Chromium; use HTTP/HTTPS for an authenticated proxy. / Авторизация SOCKS5 не поддерживается Chromium; используйте HTTP/HTTPS с логином и паролем.',
  session_storage_failed: 'Cannot prepare persistent session storage. / Не удалось подготовить постоянное хранилище сессий.',
  upstream_start_failed: 'Cannot execute upstream WAHA entrypoint. / Не удалось запустить приложение WAHA.',
  startup_failed: 'Unexpected startup failure. / Непредвиденная ошибка запуска.',
};

class ConfigurationError extends Error {
  constructor(code) {
    super(reasons[code] || reasons.startup_failed);
    this.code = Object.hasOwn(reasons, code) ? code : 'startup_failed';
  }
}

function report(error) {
  const safe = error instanceof ConfigurationError ? error : new ConfigurationError('startup_failed');
  return `4VRS WAHA: cannot start [${safe.code}]. ${safe.message}`;
}

module.exports = {ConfigurationError, report};
