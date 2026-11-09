# Локальный движок Prisma для сборки образа

При `npm ci` Prisma скачивает движок миграций (`schema-engine`) с `binaries.prisma.sh`. Если сервер, где
собирается образ, до него не достаёт (сборка падает на `prisma generate` с `ETIMEDOUT`), положите готовый
бинарник сюда — тогда сборка обходится без сети. Бинарники в этой папке не коммитятся (`.gitignore`).

## 1. Узнать версию и платформу

Версия — хэш движка из `npx prisma version` (строка `Schema Engine`). Образ собирается на `node:24-alpine`,
платформа — `linux-musl-openssl-3.0.x`.

## 2. Скачать и проверить

```bash
H=d1b3f377ca835d73fd50954a5e22128b9ebdd6b8   # хэш движка для prisma@7.10.1
P=all_commits/$H/linux-musl-openssl-3.0.x
curl -fL --retry 10 --retry-all-errors -o schema-engine.gz https://cdn.npmmirror.com/binaries/prisma/$P/schema-engine.gz
gunzip -f schema-engine.gz
sha256sum schema-engine   # должен совпасть с официальным: https://binaries.prisma.sh/$P/schema-engine.sha256
```

Для `prisma@7.10.1` официальный SHA-256 —
`c583d08ce5150fe39ff1d4a981c790e3eee8e1fbb432b80dba7606d74c1e56cf`.

## 3. Указать путь при сборке

В `deploy/.env`:

```
PRISMA_SCHEMA_ENGINE_BINARY=/app/prisma/engines/schema-engine
```

При обновлении `prisma` в `package.json` меняется и хэш движка — скачайте новый бинарник.
