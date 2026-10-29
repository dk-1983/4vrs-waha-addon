# 0.3.0

- Optional dashboard authentication: disable the switch to open the dashboard
  and API documentation without a login/password. API key protection stays on.
- Saved dashboard credentials are retained while authentication is disabled.

- Startup diagnostics identify the failing field or startup phase using safe,
  static RU/EN messages; no settings or upstream exception values are logged.
- Standalone read-only configuration validator.
- Register nested tini as a child subreaper under Supervisor's init process.

Диагностика запуска указывает конкретное поле или этап без вывода секретов.
Добавлена отдельная проверка настроек без запуска WAHA. Устранено предупреждение
вложенного tini под Supervisor.
Авторизацию панели и документации API можно отключить отдельным переключателем;
ключ API остаётся обязательным. Сохранённые реквизиты панели не удаляются.

# 0.2.1

- Publish the tested amd64 image to GitHub Container Registry for Supervisor
  installations without on-host Docker Hub builds.
- Runtime, proxy options and stored session data are unchanged.

Готовый проверенный образ amd64 публикуется в GitHub Container Registry,
чтобы устанавливать дополнение без локальной сборки через Docker Hub.
Работа приложения и настройки прокси не изменены.

# 0.2.0

- Independent WhatsApp proxy switch with HTTP, HTTPS and unauthenticated SOCKS5.
- HTTP/HTTPS proxy username/password in Supervisor configuration.
- No inherited proxy route when disabled. No automatic direct fallback.
- Telegram proxy is configured separately in intercom integration 0.10.0.

Отдельный переключатель прокси WhatsApp; HTTP/HTTPS с авторизацией,
SOCKS5 без авторизации (ограничение Chromium). Прокси Telegram настраивается
независимо в интеграции домофона 0.10.0.

# 0.1.0

- Initial Home Assistant Supervisor app around pinned WAHA Core (amd64).
- Configuration, start/stop, dashboard link, watchdog and persistent pairing data.
- English and Russian settings and installation instructions.
- API key and dashboard password required before first start.

Первый выпуск дополнения Supervisor: настройки, управление, панель QR-кода,
watchdog и сохранение привязки. Интерфейс и инструкции на русском и английском.
