# Call Booking Service Backend

Backend реализован по контракту из [tsp-output/@typespec/openapi3/openapi.yaml](/Users/ishchts/projects/ai-for-developers-project-386/tsp-output/@typespec/openapi3/openapi.yaml) на Node.js + Fastify + TypeScript.

## Project structure

- [backend/server.ts](/Users/ishchts/projects/ai-for-developers-project-386/backend/server.ts) - запуск HTTP-сервера
- [backend/app.ts](/Users/ishchts/projects/ai-for-developers-project-386/backend/app.ts) - Fastify-приложение и роуты
- [backend/types.ts](/Users/ishchts/projects/ai-for-developers-project-386/backend/types.ts) - TypeScript-типы контрактных сущностей
- [backend/schemas.ts](/Users/ishchts/projects/ai-for-developers-project-386/backend/schemas.ts) - JSON Schema для валидации запросов и ответов
- [backend/store.ts](/Users/ishchts/projects/ai-for-developers-project-386/backend/store.ts) - in-memory storage
- [backend/time.ts](/Users/ishchts/projects/ai-for-developers-project-386/backend/time.ts) - генерация слотов и работа с датами
- [backend/errors.ts](/Users/ishchts/projects/ai-for-developers-project-386/backend/errors.ts) - контрактные ошибки API
- [test/backend.test.ts](/Users/ishchts/projects/ai-for-developers-project-386/test/backend.test.ts) - интеграционные тесты через Fastify inject
- [tsconfig.backend.json](/Users/ishchts/projects/ai-for-developers-project-386/tsconfig.backend.json) - конфигурация TypeScript для backend и тестов

## API

Реализованы все эндпоинты из контракта:

- `GET /event-types`
- `GET /event-types/{eventTypeId}/slots?date=YYYY-MM-DD`
- `POST /bookings`
- `GET /owner/bookings`
- `POST /owner/event-types`

Ошибки `400`, `404` и `409` возвращаются только в контрактном формате:

```json
{
  "code": "BAD_REQUEST",
  "message": "..."
}
```

## Run

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

3. При необходимости запустить frontend:

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:8080 npm run frontend:dev
```

Frontend будет доступен на `http://127.0.0.1:5173`, а запросы на `/api` проксируются в backend.

## Tests

```bash
npm test
npm run typecheck
```

### End-to-end tests

Playwright E2E tests run against the real backend and frontend dev servers. They do not use Prism.

1. Install Playwright browsers:

```bash
npm run playwright:install
```

or:

```bash
make install-playwright
```

2. Run the E2E suite:

```bash
npm run test:e2e
```

or:

```bash
make test-e2e
```

Optional modes:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
```

The Playwright runner starts backend on `http://127.0.0.1:18080` and frontend on `http://127.0.0.1:4173` automatically, with `TZ=UTC` for deterministic date/time rendering.

## Notes

- Хранилище полностью in-memory. После перезапуска сервера типы событий и бронирования очищаются.
- Бронирование конфликтует глобально по `startTime`: нельзя создать два бронирования на один и тот же слот, даже для разных `eventTypeId`.
- Правило генерации слотов `09:00-18:00` с шагом `durationMinutes` является временным техническим допущением. Этого правила нет в OpenAPI/TypeSpec контракте, оно использовано только для минимальной детерминированной реализации `GET /event-types/{eventTypeId}/slots` и проверки `POST /bookings`.
