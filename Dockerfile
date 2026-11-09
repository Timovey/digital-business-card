# syntax=docker/dockerfile:1.7

ARG NODE_IMAGE=node:24-alpine

# ---------- base ----------
FROM ${NODE_IMAGE} AS base
WORKDIR /app

# ---------- deps: полное дерево зависимостей, Prisma client генерируется в postinstall ----------
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma/schema.prisma ./prisma/schema.prisma
# Движок Prisma (schema-engine) по умолчанию скачивается с binaries.prisma.sh при `npm ci`.
# Где сеть до него ненадёжна, есть два способа, оба необязательные (пусто — обычное скачивание):
# - PRISMA_ENGINES_MIRROR — зеркало для скачивания (только на время сборки);
# - PRISMA_SCHEMA_ENGINE_BINARY — готовый бинарник из prisma/engines/ (см. prisma/engines/README.md).
#   Переменная остаётся в образе migrator: по ней `prisma migrate deploy` находит движок.
COPY prisma/engines/ ./prisma/engines/
ARG PRISMA_ENGINES_MIRROR
ARG PRISMA_SCHEMA_ENGINE_BINARY
ENV PRISMA_SCHEMA_ENGINE_BINARY=${PRISMA_SCHEMA_ENGINE_BINARY}
RUN --mount=type=cache,target=/root/.npm \
    if [ -n "$PRISMA_SCHEMA_ENGINE_BINARY" ]; then chmod 755 "$PRISMA_SCHEMA_ENGINE_BINARY"; fi \
    && npm ci

# ---------- build: компиляция TypeScript ----------
FROM deps AS build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ---------- migrator: разовая задача, применяет миграции и заполняет базу ----------
# Нужны Prisma CLI и tsx (dev-зависимости), поэтому это отдельный от API образ.
FROM deps AS migrator
COPY tsconfig.json ./
COPY prisma ./prisma
COPY src ./src
# COPY prisma заново кладёт локальный движок с правами из контекста сборки (обычно 644): возвращаем
# бит исполнения, иначе пользователь node не сможет запустить его при `migrate deploy`.
RUN if [ -n "$PRISMA_SCHEMA_ENGINE_BINARY" ]; then chmod 755 "$PRISMA_SCHEMA_ENGINE_BINARY"; fi
USER node
CMD ["npm", "run", "db:setup"]

# ---------- prod-deps: только зависимости времени выполнения ----------
FROM base AS prod-deps
COPY package.json package-lock.json ./
# @prisma/client объявляет Prisma CLI необязательной peer-зависимостью, и npm оставляет её в production-
# установке, потому что CLI указан в корневых devDependencies. Во время выполнения нужны только
# сгенерированный клиент и @prisma/client/runtime, поэтому CLI и его инструменты (движки, Studio,
# PGlite, TypeScript) удаляются.
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev --ignore-scripts   && rm -rf node_modules/prisma node_modules/typescript node_modules/effect node_modules/@electric-sql      node_modules/@prisma/config node_modules/@prisma/dev node_modules/@prisma/engines      node_modules/@prisma/fetch-engine node_modules/@prisma/studio-core node_modules/@prisma/streams-local

# ---------- runtime: минимальный образ, пользователь без root ----------
FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=5 \
  CMD wget -qO /dev/null "http://127.0.0.1:${PORT:-3000}/health" || exit 1
CMD ["node", "dist/main.js"]
