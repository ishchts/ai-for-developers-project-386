# Frontend Agent Guide

## Назначение

Этот файл задает рабочие правила для агента, который меняет frontend проекта. Область ответственности: React/Vite приложение в `frontend/`, пользовательские экраны, UI-компоненты, клиентский API-слой, локализация и стили.

## Ключевые точки входа

- `frontend/src/main.tsx` — bootstrap приложения, провайдеры, подключение глобальных стилей.
- `frontend/src/router.tsx` — маршруты приложения.
- `frontend/src/pages/` — верхнеуровневые экраны (`GuestPage`, `BookingPage`, `AdminPage`).
- `frontend/src/components/` — переиспользуемые UI-блоки.
- `frontend/src/features/booking/` — доменная логика booking flow.
- `frontend/src/lib/api.ts` — HTTP-клиент для backend API.
- `frontend/src/i18n/` — локализация и ресурсы переводов.
- `frontend/src/theme/` — тема и theme provider.

## Дизайн и стили

Визуальная система проекта описана в [design.md](/Users/ishchts/projects/ai-for-developers-project-386/design.md). Для любых UI-изменений это source of truth. Не придумывай отдельные визуальные правила внутри `agent.md`, если они уже зафиксированы в `design.md`.

Главные CSS-слои:

- `frontend/src/styles/tokens.css` — системные токены spacing/radius/typography/shadow/motion.
- `frontend/src/styles/themes.css` — semantic color tokens и theme overrides.
- `frontend/src/styles/base.css` — базовый layout, typography и primitives.
- `frontend/src/styles/components.css` — общие component-level паттерны.
- `frontend/src/styles/booking.css` — feature-level композиция booking/admin экранов.

Правила:

- Сначала меняй токены и семантические стили, потом компоненты.
- Не хардкодь raw colors, raw spacing, raw radius и raw shadows без явной системной причины.
- Не привязывай компонент к конкретной теме через локальные цвета.
- Сохраняй mobile-first читаемость и не ломай основной пользовательский сценарий на малых экранах.
- Если визуальное значение становится системным или повторяется, выноси его в соответствующий слой стилей, а не дублируй локально.

## Правила изменений

- Сохраняй текущую архитектуру: страницы собираются из UI-компонентов и feature-логики, а сеть проходит через `frontend/src/lib/api.ts`.
- При изменении маршрутов учитывай `frontend/src/router.tsx` и backend SPA fallback.
- Не ломай контракт API-клиента без синхронного изменения backend и типов в `frontend/src/types/api.ts`.
- При изменениях текстов обновляй соответствующие ресурсы переводов в `frontend/src/i18n/resources/`.
- Предпочитай изменения в существующих паттернах проекта вместо ввода новой локальной архитектуры.

## Проверки

После изменений запускай минимум:

- `npm run build --prefix frontend`

Если изменения затрагивают интеграцию frontend/backend или пользовательские сценарии бронирования, дополнительно используй:

- `npm run test:e2e`

## Критичные инварианты

- Frontend работает через API base URL `/api`, как в development, так и в production.
- Основные пользовательские маршруты: `/`, `/book/:eventTypeId`, `/admin`.
- Глобальные стили подключаются через `frontend/src/main.tsx`; не разводи случайные точки подключения стилей.
- Визуальные изменения должны соответствовать правилам из [design.md](/Users/ishchts/projects/ai-for-developers-project-386/design.md), если задача явно не требует пересмотра самой дизайн-системы.
