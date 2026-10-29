# 4VRS WhatsApp (WAHA)

Unofficial Home Assistant Supervisor app wrapping **WAHA Core** by devlikeapro.
Install, configure, start, stop and restart from Home Assistant Apps. Pair an
ordinary WhatsApp account using the upstream QR dashboard. The 4VRS intercom
integration uses its HTTP API to deliver personal passwords.

Неофициальное дополнение Home Assistant для **WAHA Core**: установка, настройки,
запуск и перезапуск через «Приложения». Обычный аккаунт WhatsApp привязывается
по QR-коду. Интеграция домофона отправляет пароли через API дополнения.

- amd64 only; pinned upstream image, WEBJS/Chromium engine.
- Version 0.2.1+: prebuilt GHCR image; no on-host Docker Hub build during install.
- Private API key and separate dashboard credentials.
- Version 0.3.0: optional dashboard authentication; API key remains required.
- Specific, secret-free startup diagnostics in Russian and English.
- Pairing data in `/data/sessions`, included in Supervisor app backups.
- Watchdog and Docker health check. No automatic logout or re-pairing.
- RU/EN configuration and instructions: [DOCS.md](DOCS.md).
- WAHA Core: Apache 2.0; wrapper: Apache 2.0. [Attribution](licenses/NOTICE.md).

This remains a community app installed from a custom repository, not an official
Home Assistant or WhatsApp product. WAHA Plus is not included. Version 0.2.0 adds
an independent proxy switch: HTTP, HTTPS or SOCKS5 without authentication.
HTTP/HTTPS proxy authentication is supported. Docker downloads need separate routing.
