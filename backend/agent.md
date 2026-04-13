# Backend Agent Guide

## Назначение

Этот файл задает рабочие правила для агента, который меняет backend проекта. Область ответственности: Fastify backend в `backend/`, API-маршруты, health check, static hosting, SPA fallback и in-memory data model.

## Ключевые точки входа

- `backend/server.ts` — запуск HTTP-сервера.
- `backend/app.ts` — сборка Fastify приложения, `healthz`, static hosting и SPA fallback.
- `backend/api-routes.ts` — регистрация API-маршрутов под `/api`.
- `backend/store.ts` — in-memory store.
- `backend/schemas.ts` — JSON schema для запросов и ответов.
- `backend/types.ts` — доменные типы и контракты.
- `backend/errors.ts` — API-ошибки и helpers.
- `backend/time.ts` — генерация слотов и date/time утилиты.
- `test/backend.test.ts` — backend tests.

## Правила изменений

- Публичный API должен оставаться под префиксом `/api`.
- Контракт ошибок должен оставаться JSON-совместимым в формате `{ code, message }`.
- При изменении маршрутов, схем или типов держи в синхронизации `api-routes.ts`, `schemas.ts`, `types.ts` и frontend API types при необходимости.
- Учитывай, что production backend одновременно раздает API и собранный frontend из одного процесса.
- Не ломай поведение `healthz`, static hosting и SPA fallback без явной задачи.
- Учитывай существующую обработку legacy-path not found в `backend/app.ts`; старые пути не должны внезапно начинать отдавать `index.html`.

## Где искать связанные части

- Корневой `README.md` — описание API, локальной разработки, тестов и deployment assumptions.
- `typespec/` и `tsp-output/@typespec/openapi3/openapi.yaml` — контрактные артефакты API.
- `frontend/src/lib/api.ts` и `frontend/src/types/api.ts` — клиентская сторона backend-контрактов.

## Проверки

После изменений запускай минимум:

- `npm test`
- `npm run typecheck`

Если нужно вручную проверить локальный runtime:

- `npm start`

## Критичные инварианты

- `GET /healthz` должен оставаться доступным отдельно от `/api`.
- API-маршруты не должны конфликтовать со static hosting и SPA fallback.
- Для `/api/*` и legacy API paths 404 должен возвращаться как JSON error payload, а не как HTML.
- Хранилище по умолчанию in-memory; не вводи персистентность или внешние зависимости без явной задачи.
- Бронирование конфликтует по `startTime`, и это поведение нельзя менять без отдельного требования.
