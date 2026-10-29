# Installation / Установка

## English

1. Add the published repository's **root URL** to Settings → Apps → App Store →
   Repositories. Do not use a `/tree/main` URL. Install **4VRS WhatsApp (WAHA)**.
   Supervisor downloads a prebuilt image from GitHub Container Registry (0.2.1+).
   The browser image is large and downloading can take several minutes.
2. Before starting, open Configuration. Set `api_key` to a private random string
   of at least 16 characters and `dashboard_password` to a different password of
   at least 16 characters. Username defaults to `admin`. Save.
3. Start the app. Enable Start on boot and Watchdog. Open Web UI. The dashboard
   uses the published port (3000 by default), rather than HA Ingress. Log in using
   the configured dashboard username/password. If asked for an API connection,
   enter `http://HA_LAN_IP:3000` and the API key.
4. Create/start the `default` session in WAHA. Display QR. On the phone:
   WhatsApp → Linked devices → Link a device. Scan and wait for `WORKING`.
5. In the 4VRS intercom integration (0.9.0+), open Messaging. Enable WhatsApp,
   set URL `http://HA_LAN_IP:3000`, the same API key, and session `default`.
   Bind the user's international phone number (digits, optional leading `+`).
6. Run `fourvrs_voice_intercom.test_messenger` with provider `whatsapp` and the
   phone number. This sends a test message and does not change passwords.

Keep the API/dashboard port on a trusted LAN; use HTTPS via a reverse proxy if
needed. Do not expose it directly to the internet. No host network, Docker socket,
Supervisor API token or privileged mode is required. Chromium may use substantial
memory. The app is currently amd64 only.

Supervisor retains `/data` across updates and includes it in app backups. Back up
the app before updating; deleting the app may delete its pairing. Treat backups
as private. Restoring a backup does not guarantee WhatsApp will keep the session
authorized. Watchdog checks API availability, not WhatsApp login status. The
health check also permits an empty session list while awaiting QR pairing.

Update via App Store after refreshing the repository. Upstream is pinned to a
tested image digest, so updates arrive as app releases; there is no hidden
unattended upstream image replacement.

### Proxy (0.2.0)

Enable `proxy_enabled` independently of Telegram. Set `proxy_url` to
`http://host:port`, `https://host:port` or `socks5://host:port`. Credentials go into
`proxy_username` and `proxy_password`; leave both empty for no authentication.
Chromium does not support SOCKS5 authentication; use HTTP/HTTPS if credentials
are required. HTTPS proxies need trusted TLS certificates. Save and restart WAHA.
Disabling keeps your settings but removes the container's proxy route. There is
no automatic direct fallback. Remove per-session `config.proxy` overrides in the
WAHA dashboard, as those take priority over global settings. The HA-to-WAHA API
connection remains direct. This switch does not configure Docker image downloads.

For local testing without a public repository, copy the `fourvrs_waha` directory
into HA's `/addons` directory, reload the App Store and install from Local apps.
No standalone `docker compose` container is needed with this app.

## Русский

1. Добавьте **корневой URL опубликованного репозитория** в Настройки → Приложения →
   Магазин приложений → Репозитории. Ссылку с `/tree/main` использовать не нужно.
   Установите **4VRS WhatsApp (WAHA)**. С версии 0.2.1 Supervisor скачивает готовый
   образ из GitHub Container Registry. Загрузка большого образа с браузером
   может занять несколько минут; локальная сборка не требуется.
2. До первого запуска откройте настройки дополнения. Задайте `api_key` — секретный
   случайный ключ от 16 символов, и отдельный `dashboard_password` от 16 символов.
   Логин по умолчанию `admin`. Сохраните настройки.
3. Запустите дополнение. Включите запуск при загрузке и Watchdog. Нажмите
   «Открыть веб-интерфейс». Панель открывается через порт (по умолчанию 3000),
   без HA Ingress. Войдите с заданными логином и паролем панели. Если панель
   запросит подключение API, укажите `http://IP_HA_В_СЕТИ:3000` и ключ API.
4. Создайте/запустите сессию `default`, покажите QR-код. На телефоне: WhatsApp →
   Связанные устройства → Привязка устройства. Сканируйте код; дождитесь `WORKING`.
5. В интеграции домофона 4VRS версии 0.9.0 и выше откройте «Мессенджеры», включите
   WhatsApp, задайте `http://IP_HA_В_СЕТИ:3000`, тот же ключ и сессию `default`.
   В карточке пользователя задайте международный номер телефона: цифры,
   допускается `+` в начале.
6. Выполните `fourvrs_voice_intercom.test_messenger`: провайдер `whatsapp`,
   получатель — номер телефона. Тест отправляет сообщение, пароль не меняет.

Порт API и панели оставляйте в доверенной локальной сети; при необходимости
используйте HTTPS через обратный прокси. Не публикуйте порт напрямую в интернете.
Доступ к Docker, API Supervisor, привилегированный режим и сеть хоста не нужны.
Chromium может потреблять заметный объём памяти. Пока поддерживается только amd64.

Привязка хранится в `/data/sessions`: сохраняется при обновлении и входит в
резервную копию дополнения Supervisor. Перед обновлением сделайте копию.
Удаление дополнения может удалить привязку. Копия содержит секретные данные.
После восстановления WhatsApp всё равно может потребовать повторную привязку.
Watchdog проверяет доступность API, а не наличие авторизации WhatsApp; ожидание
QR-кода не считается сбоем, в том числе для проверки Docker.

Обновления доступны через магазин после обновления списка репозиториев. Версия
WAHA зафиксирована по digest: она меняется вместе с выпуском дополнения.
Самовольной подмены образа при запуске нет.

### Прокси (0.2.0)

Включите `proxy_enabled` независимо от Telegram. В `proxy_url` задайте
`http://адрес:порт`, `https://адрес:порт` или `socks5://адрес:порт`. Учётные данные
вводятся в `proxy_username` и `proxy_password`; для работы без авторизации оба
поля оставьте пустыми. Chromium не поддерживает авторизацию SOCKS5 — если нужны
логин и пароль, используйте HTTP/HTTPS. HTTPS-прокси нужен доверенный сертификат.
Сохраните и перезапустите WAHA. Отключение переключателя сохраняет параметры,
но убирает маршрут прокси контейнера. Автоматического перехода на прямой маршрут
нет. Удалите отдельные `config.proxy` сессии в панели WAHA: у них приоритет.
Соединение HA с локальным API WAHA остаётся прямым. Этот переключатель
не настраивает скачивание Docker-образов.

Для локальной установки без публичного репозитория скопируйте папку
`fourvrs_waha` в `/addons` на HA, обновите магазин и установите из локальных
дополнений. Отдельный контейнер `docker compose` при этом не требуется.
