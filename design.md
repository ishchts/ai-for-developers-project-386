# Design System

## Purpose

`design.md` фиксирует текущую визуальную систему проекта и правила её изменения. Это не брендбук и не отдельная дизайн-спецификация, а рабочий контракт между дизайном и кодом:

- где объявлены токены;
- какие значения считаются системными;
- как использовать их в компонентах;
- как вносить изменения без расползания raw values по коду.

Главный принцип: сначала меняются токены, затем компоненты. Не наоборот.

Текущее визуальное направление для `light` theme:

- warm
- calm
- human
- approachable

Приоритет у cream surfaces, мягких границ и тёплого контраста, а не у холодного SaaS-blue.

## Source Of Truth

Текущее source of truth для дизайн-токенов и базовых UI-паттернов:

- [frontend/src/styles/tokens.css](/Users/ishchts/projects/ai-for-developers-project-386/frontend/src/styles/tokens.css)  
  Базовые системные токены: spacing, radius, typography, shadows, motion.
- [frontend/src/styles/themes.css](/Users/ishchts/projects/ai-for-developers-project-386/frontend/src/styles/themes.css)  
  Цветовые semantic tokens и theme overrides для `light` / `dark`.
- [frontend/src/styles/base.css](/Users/ishchts/projects/ai-for-developers-project-386/frontend/src/styles/base.css)  
  Базовые layout/UI primitives: shell, typography usage, поля, общие паттерны адаптива.
- [frontend/src/styles/components.css](/Users/ishchts/projects/ai-for-developers-project-386/frontend/src/styles/components.css)  
  Общие component-level паттерны: card, button, inline-message, skeleton.
- [frontend/src/styles/booking.css](/Users/ishchts/projects/ai-for-developers-project-386/frontend/src/styles/booking.css)  
  Feature-level композиция для booking/admin экранов.

Если визуальное значение переиспользуется на системном уровне, оно должно жить в `tokens.css` или `themes.css`, а не в feature-стилях.

## Design Tokens

### Color Tokens

Цветовые токены описываются семантически, а не через прямое назначение hex по компонентам.

#### Theme-aware tokens

Эти токены переопределяются между `light` и `dark` в `themes.css`:

| Token | Light | Dark | Назначение |
| --- | --- | --- | --- |
| `--color-bg` | `#f6ecdf` | `#0f1724` | Базовый фон приложения |
| `--color-bg-accent` | `#efdac4` | `#1d2a3a` | Дополнительный тёплый фон/градиентная подложка |
| `--color-surface` | `rgba(255, 249, 243, 0.86)` | `rgba(17, 24, 39, 0.88)` | Основной фон карточек и поверхностей |
| `--color-surface-strong` | `#fffaf3` | `#111827` | Плотная поверхность без прозрачности |
| `--color-border` | `rgba(92, 70, 48, 0.12)` | `rgba(255, 255, 255, 0.12)` | Стандартные границы |
| `--color-border-strong` | `rgba(92, 70, 48, 0.22)` | `rgba(255, 255, 255, 0.22)` | Усиленные границы и focus state |
| `--color-text` | `#132238` | `#f4f7fb` | Основной текст |
| `--color-text-muted` | `rgba(64, 47, 34, 0.72)` | `rgba(244, 247, 251, 0.72)` | Вторичный текст, descriptions, meta |
| `--color-primary` | `#5b3a29` | `#d7e9ff` | Основной CTA и активные состояния |
| `--color-primary-contrast` | `#fff8f1` | `#102033` | Текст/иконки на primary фоне |
| `--color-secondary` | `rgba(124, 90, 60, 0.1)` | `rgba(255, 255, 255, 0.08)` | Вторичные поверхности и subdued actions |
| `--color-secondary-contrast` | `#4a3126` | `#f4f7fb` | Текст на secondary фоне |
| `--color-success-bg` | `rgba(236, 253, 243, 0.92)` | `rgba(11, 57, 37, 0.9)` | Success background |
| `--color-success-border` | `rgba(48, 138, 88, 0.22)` | `rgba(91, 194, 129, 0.3)` | Success border |
| `--color-warning-bg` | `rgba(255, 245, 226, 0.94)` | `rgba(78, 52, 12, 0.9)` | Warning background |
| `--color-warning-border` | `rgba(172, 116, 36, 0.26)` | `rgba(255, 200, 87, 0.24)` | Warning border |
| `--color-error-bg` | `rgba(255, 240, 240, 0.94)` | `rgba(84, 22, 22, 0.9)` | Error background |
| `--color-error-border` | `rgba(172, 44, 44, 0.2)` | `rgba(255, 128, 128, 0.24)` | Error border |
| `--color-info-bg` | `rgba(255, 249, 242, 0.94)` | `rgba(20, 28, 41, 0.92)` | Neutral informational surface |
| `--color-info-border` | `rgba(92, 70, 48, 0.1)` | `rgba(255, 255, 255, 0.08)` | Neutral informational border |
| `--color-input-bg` | `rgba(255, 252, 247, 0.98)` | `rgba(15, 23, 36, 0.94)` | Поля ввода и form controls |

#### Роли цветовых токенов

- Background:
  `--color-bg`, `--color-bg-accent`
- Surface:
  `--color-surface`, `--color-surface-strong`
- Text:
  `--color-text`, `--color-text-muted`
- Border:
  `--color-border`, `--color-border-strong`
- Actions:
  `--color-primary`, `--color-primary-contrast`, `--color-secondary`, `--color-secondary-contrast`
- Feedback:
  `--color-success-*`, `--color-warning-*`, `--color-error-*`, `--color-info-*`
- Form:
  `--color-input-bg`

Использование цветов по компонентам должно идти через эти роли, а не через прямые значения `#hex` или случайные `rgba(...)`.

### Spacing Tokens

Источник: `tokens.css`

| Token | Value | Назначение |
| --- | --- | --- |
| `--space-1` | `0.25rem` | Минимальные микро-отступы |
| `--space-2` | `0.5rem` | Плотные интервалы внутри мелких UI-блоков |
| `--space-3` | `0.75rem` | Компактные промежутки между связанными элементами |
| `--space-4` | `1rem` | Базовый интервал по умолчанию |
| `--space-5` | `1.25rem` | Расширенный внутренний отступ |
| `--space-6` | `1.5rem` | Стандартный card padding / block spacing |
| `--space-8` | `2rem` | Крупные секционные отступы |
| `--space-10` | `2.5rem` | Усиленные интервалы между крупными блоками |
| `--space-12` | `3rem` | Самые крупные секционные интервалы |

Правило:

- layout spacing: только через `--space-*`
- если значение отступа используется минимум в двух местах, его нужно выносить в токен

### Radius Tokens

Источник: `tokens.css`

| Token | Value | Назначение |
| --- | --- | --- |
| `--radius-sm` | `0.75rem` | Компактные элементы |
| `--radius-md` | `1rem` | Inputs и небольшие контейнеры |
| `--radius-lg` | `1.5rem` | Карточки, панели, большие контейнеры |
| `--radius-pill` | `999px` | Кнопки-pill, badges, step chips |

Правило:

- shape и скругления не хардкодятся в компоненте;
- если нужен новый системный тип формы, он добавляется в токены.

### Typography Tokens

Источник: `tokens.css`

#### Font family

| Token | Value | Назначение |
| --- | --- | --- |
| `--font-sans` | `"IBM Plex Sans", "Segoe UI", sans-serif` | Базовый шрифт интерфейса |

#### Font sizes

| Token | Value | Назначение |
| --- | --- | --- |
| `--font-size-xs` | `0.75rem` | Meta, eyebrow, service labels |
| `--font-size-sm` | `0.875rem` | Вторичный текст, dt labels |
| `--font-size-md` | `1rem` | Основной текст |
| `--font-size-lg` | `1.125rem` | Усиленные текстовые блоки |
| `--font-size-xl` | `clamp(2rem, 3vw, 3.25rem)` | Hero и крупные page titles |

#### Font weights

| Token | Value | Назначение |
| --- | --- | --- |
| `--font-weight-normal` | `400` | Основной текст |
| `--font-weight-medium` | `500` | Акцент внутри текста |
| `--font-weight-semibold` | `600` | Secondary emphasis |
| `--font-weight-bold` | `700` | Заголовки, бренд, сильный CTA emphasis |

Правило:

- text hierarchy строится только через `--font-size-*` и `--font-weight-*`;
- нельзя вводить локальные font-size без причины системного уровня.

### Shadow Tokens

Источник: `tokens.css`

| Token | Value | Назначение |
| --- | --- | --- |
| `--shadow-sm` | `0 8px 24px rgba(16, 24, 40, 0.06)` | Стандартная глубина карточек и selected states |
| `--shadow-md` | `0 20px 50px rgba(16, 24, 40, 0.1)` | Hero blocks и elevated surfaces |

Правило:

- визуальная глубина задаётся только через shadow tokens;
- если нужен новый уровень elevation, он сначала добавляется как системный token.

### Motion Tokens

Источник: `tokens.css`

| Token | Value | Назначение |
| --- | --- | --- |
| `--transition-base` | `160ms ease` | Базовые hover/focus/opacity transitions |

Правило:

- интерактивные состояния используют `--transition-base` или новый motion token;
- не добавлять уникальные transition timings в отдельных компонентах без системной причины.

## UI Principles

### 1. Ясная визуальная иерархия

- На каждом экране должен быть один доминирующий уровень внимания.
- Заголовок объясняет контекст, подзаголовок снимает неопределённость.
- Secondary content визуально тише через `--color-text-muted`, меньший размер и более слабый контраст.

### 2. Один главный CTA на экран или блок

- Основное действие должно читаться сразу.
- Secondary и ghost actions не конкурируют с primary.
- Если в блоке есть основной сценарий, все остальные действия должны быть менее заметными.

### 3. Спокойный, нейтральный интерфейс

- Интерфейс должен выглядеть чисто и уверенно, без визуального шума.
- Базовый паттерн поверхности — карточка или мягко отделённый блок.
- Цвет используется семантически, а не декоративно.

### 4. Человекочитаемые состояния

- Loading: не технический лог, а понятное сообщение или skeleton.
- Empty: объясняет, почему данных нет, и что делать дальше.
- Success: подтверждает завершение сценария и снижает тревожность.
- Warning/Error: объясняют проблему и следующий шаг, а не только факт ошибки.

### 5. Mobile-first читаемость

- Критичные действия должны иметь комфортные hit targets.
- Линейный mobile flow важнее декоративной multi-column композиции.
- Sticky и вспомогательные панели не должны ломать основной сценарий на малых экранах.

## Composition Rules

### Cards

- Карточка — основной surface pattern для контентных блоков.
- Card использует `--color-surface`, `--radius-lg`, `--shadow-sm` или `--shadow-md`.
- Внутренние интервалы карточки строятся на `--space-6` и соседних spacing tokens.

### Buttons

- `primary` — только для основного действия.
- `secondary` — для менее приоритетных действий внутри того же контекста.
- `ghost` — для навигационного или безопасного вторичного действия.

### Whitespace

- Плотность интерфейса регулируется spacing scale, а не случайными margin/padding.
- Близкие элементы группируются через меньшие интервалы, независимые блоки разводятся большими.

### Summary / Sticky blocks

- Summary-блок поддерживает сценарий, но не должен забирать приоритет у главного действия.
- Sticky-поведение допустимо только если не мешает mobile UX и чтению основного контента.

## Theme Model

Текущая модель тем:

- `data-theme="light"` — рабочая тема по умолчанию, с тёплой cream/sand палитрой
- `data-theme="dark"` — подготовленная структура токенов для тёмной темы

Правила:

- Компоненты не должны знать о теме напрямую.
- Компоненты работают только через semantic color tokens.
- Theme switch реализуется переопределением токенов, а не отдельными наборами component styles.
- Нельзя привязывать компонент к `light` или `dark` через локальные значения цвета.

## Change Rules

### Что запрещено

- Хардкодить цвета в компонентах.
- Хардкодить радиусы, spacing и shadows в feature-стилях без системной причины.
- Вводить component-specific raw values, если их можно выразить существующими токенами.
- Привязывать поведение компонента к конкретной теме напрямую.

### Когда нужно добавлять новый токен

Новый токен добавляется, если:

- значение повторяется минимум в двух местах;
- значение задаёт системный уровень визуального поведения;
- значение относится к theme-aware семантике;
- без него появляется соблазн копировать raw value по нескольким компонентам.

### Порядок изменения системы

1. Обновить токен в `tokens.css` или `themes.css`.
2. Проверить, не затрагивает ли изменение базовые primitives в `base.css` и `components.css`.
3. Обновить feature-level стили, только если они действительно должны измениться вслед за токеном.
4. Проверить light/dark совместимость для theme-aware значений.

## Technical Debt Notes

В текущих стилях ещё есть единичные raw values вне токенов, например:

- часть `rgba(...)` в gradient backgrounds;
- локальные значения для focus ring / skeleton shimmer;
- отдельные размеры в feature-level layout (`minmax`, фиксированные ширины, `1.5rem` badge size).

После смещения light theme в более тёплую сторону эти raw values всё ещё допустимы как локальные visual treatments, но если warm gradients или accent glows начнут повторяться в нескольких местах, их нужно будет вынести в отдельные semantic tokens.

Это допустимо как временный технический долг, пока значение не стало системным. Если такие значения начинают повторяться или влиять на общую визуальную консистентность, их нужно переносить в токены.
