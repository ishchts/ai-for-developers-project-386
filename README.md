# website

[https://ai-for-developers-project-386-xuzb.onrender.com/](https://ai-for-developers-project-386-xuzb.onrender.com/)

# Call Booking Service

Приложение состоит из Fastify backend и React/Vite frontend. В development frontend работает через Vite dev server и проксирует запросы на backend по `/api`. В production backend раздает собранный frontend и API из одного процесса и одного Docker-контейнера.

## Project structure

- [backend/server.ts](/Users/ishchts/projects/ai-for-developers-project-386/backend/server.ts) - запуск HTTP-сервера
- [backend/app.ts](/Users/ishchts/projects/ai-for-developers-project-386/backend/app.ts) - Fastify-приложение, health check, static hosting и SPA fallback
- [backend/api-routes.ts](/Users/ishchts/projects/ai-for-developers-project-386/backend/api-routes.ts) - API-маршруты под `/api`
- [frontend/src/lib/config.ts](/Users/ishchts/projects/ai-for-developers-project-386/frontend/src/lib/config.ts) - базовый URL API (`/api`)
- [test/backend.test.ts](/Users/ishchts/projects/ai-for-developers-project-386/test/backend.test.ts) - backend routing и API tests
- [Dockerfile](/Users/ishchts/projects/ai-for-developers-project-386/Dockerfile) - multi-stage production image
- [render.yaml](/Users/ishchts/projects/ai-for-developers-project-386/render.yaml) - Render Blueprint config

## API

Публичный API доступен только под `/api/*`:

- `GET /api/event-types`
- `GET /api/event-types/{eventTypeId}/slots?date=YYYY-MM-DD`
- `POST /api/bookings`
- `GET /api/owner/bookings`
- `POST /api/owner/event-types`
- `GET /healthz`

Ошибки `400`, `404` и `409` возвращаются в контрактном JSON-формате:

```json
{
  "code": "BAD_REQUEST",
  "message": "..."
}
```

## Local development

1. Установить зависимости:

```bash
npm install
npm install --prefix frontend
```

2. Запустить backend:

```bash
PORT=8080 npm start
```

Если `PORT` не задан, сервер слушает `8080`.

3. Запустить frontend:

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:8080 npm run frontend:dev
```

Frontend будет доступен на `http://127.0.0.1:5173`, а запросы на `/api` будут проксироваться в backend без rewrite, как в production.

## Tests

```bash
npm test
npm run typecheck
```

### End-to-end tests

Playwright поднимает backend и frontend автоматически.

1. Установить браузеры:

```bash
npm run playwright:install
```

или:

```bash
make install-playwright
```

2. Запустить suite:

```bash
npm run test:e2e
```

или:

```bash
make test-e2e
```

Optional modes:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
```

## Docker

Сборка production-образа:

```bash
docker build -t call-booking-service .
```

Локальный запуск контейнера:

```bash
docker run --rm -p 8080:8080 -e PORT=8080 call-booking-service
```

Проверки после старта:

- `http://127.0.0.1:8080/healthz`
- `http://127.0.0.1:8080/`
- `http://127.0.0.1:8080/admin`
- `http://127.0.0.1:8080/api/event-types`

Контейнер стартует автоматически по порту из `PORT`. Если `PORT` не задан вне контейнера, backend использует fallback `8080`.

## Render

В репозитории есть [render.yaml](/Users/ishchts/projects/ai-for-developers-project-386/render.yaml) для Docker-based deploy.

### Вариант 1: Blueprint

1. Создать новый Blueprint в Render.
2. Подключить репозиторий.
3. Render считает `render.yaml` и создаст один Docker web service.

### Вариант 2: вручную через Web Service

1. Создать `Web Service`.
2. Выбрать репозиторий.
3. Указать `Runtime = Docker`.
4. Убедиться, что используется [Dockerfile](/Users/ishchts/projects/ai-for-developers-project-386/Dockerfile).
5. В качестве health check path указать `/healthz`.

Дополнительные переменные окружения не требуются. Render сам передает `PORT`, а приложение слушает `0.0.0.0:$PORT`.

## Notes

- Хранилище полностью in-memory. После перезапуска сервера типы событий и бронирования очищаются.
- При старте пустого storage backend автоматически добавляет 3 дефолтных типа встреч: `15 минут`, `30 минут`, `45 минут`.
- Бронирование конфликтует глобально по `startTime`: нельзя создать два бронирования на один и тот же слот, даже для разных `eventTypeId`.
- SPA fallback применяется только к не-API `GET`/`HEAD` маршрутам. Запросы на `/api/*` и `/healthz` обрабатываются раньше static/fallback и не превращаются в `index.html`.
