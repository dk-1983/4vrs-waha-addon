# 4VRS WhatsApp for Home Assistant

Home Assistant Supervisor app for WAHA Core: settings, QR pairing dashboard,
start/stop, watchdog and persistent pairing. Community-maintained, amd64.

Дополнение Supervisor для WAHA Core: настройки, панель QR-кода, управление,
watchdog и сохранение привязки. Поддерживается сообществом, архитектура amd64.

Add this repository's root GitHub URL under Home Assistant → Settings → Apps →
App Store → Repositories, then install **4VRS WhatsApp (WAHA)**.

Добавьте корневой URL этого репозитория в HA → Настройки → Приложения → Магазин →
Репозитории и установите **4VRS WhatsApp (WAHA)**.

[Installation / Установка](addons/fourvrs_waha/DOCS.md)

Version 0.3.0 adds a switch for a password-free dashboard while keeping API-key
protection, plus precise startup diagnostics. Версия 0.3.0 позволяет отключить
авторизацию панели; ключ API остаётся обязательным. Диагностика указывает поле.

Version 0.2.1 uses a prebuilt image from GitHub Container Registry, avoiding local
Docker Hub builds during installation. Starting with 0.2.1, the public package is
`ghcr.io/dk-1983/amd64-addon-fourvrs_waha` (tag equals app version).
С версии 0.2.1 устанавливается готовый образ из GitHub Container Registry;
локальная сборка с обращением к Docker Hub не требуется.

Version 0.2.0 adds an independent WhatsApp proxy switch (HTTP, HTTPS, SOCKS5).
HTTP/HTTPS authentication is supported; Chromium SOCKS5 has no authentication.
Версия 0.2.0 добавляет отдельный переключатель прокси WhatsApp: HTTP, HTTPS,
SOCKS5. Авторизация поддерживается для HTTP/HTTPS; SOCKS5 в Chromium — без неё.

WAHA Core by devlikeapro is Apache 2.0. This separate 4VRS wrapper is also Apache
2.0. We do not claim authorship of WAHA or WhatsApp. This is not an official
WhatsApp/Meta or Home Assistant product. WAHA Plus is not included.

[License and attribution](addons/fourvrs_waha/licenses/NOTICE.md)

Maintainer: GitHub Actions publishes the tested image using its short-lived
GITHUB_TOKEN. After the first publication, set the container package visibility
to Public in GitHub Package settings before users install the app. Image tags
match app versions; runtime settings and pairing data are never included.

Для сопровождающего: после первой публикации образа откройте настройки пакета
GitHub и задайте видимость Public. Actions использует временный GITHUB_TOKEN;
в образ не включаются настройки пользователя и данные привязки.
