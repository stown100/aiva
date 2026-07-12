# AIVA — AI Photo Transformation Platform

> **"Create your new style"** — пользователь загружает одно фото, выбирает стиль, получает AI-трансформацию.
> Принцип: **максимум визуального эффекта при минимуме решений пользователя**. Никаких промптов, моделей, параметров.

---

## 1. Технологический стек

| Слой | Технология | Назначение |
|---|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript (strict) | SPA-опыт, SSR лендинга |
| UI | Tailwind CSS 4 + shadcn/ui + Framer Motion | Дизайн-система, анимации |
| State | Zustand | Клиентское состояние flow генерации |
| i18n | next-intl | EN / RU / TR / ES |
| Backend | Next.js Route Handlers (`/api/*`) | MVP-бэкенд внутри Next.js |
| DB | PostgreSQL (Supabase) | Данные пользователей, стилей, генераций |
| Auth | Supabase Auth (email OTP / magic link + Google) | Без паролей — минимум трения |
| Storage | Supabase Storage (private buckets) | Оригиналы и результаты |
| AI | OpenAI Image API (`gpt-image-1`, edits endpoint) | Трансформация фото по промпт-шаблону стиля |
| Обработка | Sharp + heic-convert | HEIC→JPEG, оптимизация, удаление EXIF |
| PWA | manifest + service worker (next-pwa или ручной) | Установка на телефон |

**Почему бэкенд внутри Next.js, но отделяемый:** вся бизнес-логика живёт в изолированном слое сервисов (`src/server/`), route handlers — тонкие контроллеры (валидация → вызов сервиса → ответ). Позже слой `src/server/` переносится в отдельный сервис без переписывания логики.

---

## 2. Архитектура — Feature-Sliced Design

FSD-слои живут в `src/`. Next.js App Router (`src/app/`) — только маршрутизация и композиция; вся логика — в слоях FSD. Серверный код — в `src/server/` (вне FSD, т.к. FSD описывает клиентскую часть).

```
src/
├── app/                          # Next.js App Router (роутинг + композиция)
│   ├── [locale]/
│   │   ├── layout.tsx            # Root layout: провайдеры, шрифты, i18n
│   │   ├── page.tsx              # → views/landing
│   │   ├── create/page.tsx       # → views/create
│   │   ├── history/page.tsx      # → views/history
│   │   ├── account/page.tsx      # → views/account
│   │   └── auth/...              # Auth callback
│   ├── api/                      # Route handlers (тонкие контроллеры)
│   │   ├── upload/route.ts
│   │   ├── generations/route.ts              # POST — создать генерацию
│   │   ├── generations/[id]/route.ts         # GET — статус/результат
│   │   ├── generations/[id]/variants/route.ts# POST — regenerate
│   │   ├── styles/route.ts
│   │   ├── history/route.ts
│   │   └── me/route.ts
│   ├── manifest.ts               # PWA manifest
│   └── globals.css
│
├── views/                        # FSD "pages" (имя занято Next.js)
│   ├── landing/                  # Лендинг: hero, стили, benefits, pricing teaser
│   ├── create/                   # Экран создания: upload → style → generate → result
│   ├── history/
│   └── account/
│
├── widgets/                      # Крупные составные блоки
│   ├── photo-uploader/           # Дропзона, превью, прогресс
│   ├── style-gallery/            # Каталог стилей с категориями
│   ├── generation-progress/      # Премиальный экран ожидания (шаги, анимации)
│   ├── result-viewer/            # Результат: изображение, действия, слайдер версий
│   ├── history-grid/
│   └── app-header/               # Хедер: лого, кредиты, язык, аккаунт
│
├── features/                     # Пользовательские действия
│   ├── upload-photo/             # model: хук загрузки, валидация; ui: input
│   ├── select-style/
│   ├── generate-image/           # model: state machine генерации, polling
│   ├── switch-variant/           # Переключение версий
│   ├── download-result/
│   ├── share-result/
│   └── switch-language/
│
├── entities/                     # Бизнес-сущности
│   ├── user/                     # types, api (me, credits), ui (credits badge)
│   ├── style/                    # types, api, ui (StyleCard)
│   ├── generation/               # types (статусы), api, ui (GenerationCard)
│   └── variant/                  # types, ui (VariantThumbnail)
│
├── shared/                       # Переиспользуемое, без бизнес-логики
│   ├── ui/                       # shadcn/ui компоненты + базовые (Button, Card...)
│   ├── api/                      # apiClient (fetch-обёртка, типизация ошибок)
│   ├── lib/                      # utils, cn, format
│   ├── hooks/                    # useMediaQuery, useObjectUrl...
│   ├── config/                   # константы: лимиты, роуты, env
│   ├── i18n/                     # next-intl конфиг, routing
│   └── analytics/                # track() + типизированные события
│
└── server/                       # Серверный слой (будущий отдельный бэкенд)
    ├── services/                 # Бизнес-логика
    │   ├── upload.service.ts     # Валидация, HEIC→JPEG, EXIF strip, оптимизация
    │   ├── generation.service.ts # Оркестрация: кредиты → AI → storage → variant
    │   ├── credits.service.ts    # Атомарное списание/проверка
    │   ├── style.service.ts
    │   └── ai/openai.provider.ts # Адаптер OpenAI (за интерфейсом ImageAiProvider)
    ├── repositories/             # Доступ к данным (Supabase-клиент изолирован здесь)
    ├── storage/                  # Работа с бакетами, signed URLs
    ├── auth/                     # getSessionUser() для route handlers
    └── lib/                      # errors (ApiError), rate-limit, validation (zod)
```

**Правила FSD:**
- Импорты только "вниз": `views → widgets → features → entities → shared`.
- Каждый слайс: `ui/` (только рендер), `model/` (хуки, store, логика), `api/`, `lib/`, `constants.ts`, `types.ts` — по необходимости.
- UI-компоненты не содержат бизнес-логики — получают данные и колбэки из `model`-хуков.
- Публичный API слайса — через `index.ts`.

---

## 3. Схема базы данных

```sql
users                     -- профиль (зеркало auth.users)
  id            uuid PK (= auth.users.id)
  email         text
  language      text default 'en'
  credits       int  default 3
  credits_reset_at timestamptz        -- когда обновятся бесплатные кредиты
  subscription_status text default 'free'   -- 'free' | 'pro' (задел на будущее)
  created_at    timestamptz

original_images
  id            uuid PK
  user_id       uuid FK → users
  storage_path  text                  -- private bucket 'originals'
  format        text                  -- итоговый формат после обработки
  width int, height int, size_bytes int
  created_at    timestamptz

styles
  id            text PK               -- 'anime-dream', 'pixar-character'...
  category      text                  -- 'trending' | 'creative' | 'professional' | 'fun'
  preview_url   text
  prompt_template text                -- скрытый промпт (никогда не уходит на клиент)
  prompt_version  int default 1
  active        boolean default true
  sort_order    int
  -- name/description локализуются на клиенте по ключу id (styles.<id>.name)

generations
  id            uuid PK
  user_id       uuid FK
  original_image_id uuid FK
  style_id      text FK
  prompt_version int                  -- зафиксированная версия промпта (для A/B в будущем)
  status        text                  -- 'pending' | 'processing' | 'completed' | 'failed'
  error_code    text null
  created_at    timestamptz

generation_variants
  id            uuid PK
  generation_id uuid FK
  version_number int                  -- 1, 2, 3... (unique per generation)
  storage_path  text                  -- private bucket 'results'
  created_at    timestamptz

credit_transactions                   -- задел под платежи: аудит кредитов
  id uuid PK, user_id uuid FK
  amount int                          -- -1 генерация, +N покупка/сброс
  reason text                         -- 'generation' | 'monthly_reset' | 'purchase'
  generation_id uuid null
  created_at timestamptz
```

**RLS (Row Level Security):** пользователь читает только свои строки; `styles` — публичное чтение `active=true` **без** колонок `prompt_template`/`prompt_version` (через view `styles_public`). Запись — только сервисной ролью с сервера.

**Кредиты:** списание атомарно в Postgres-функции `consume_credit(user_id)` (`UPDATE ... WHERE credits > 0 RETURNING`) — защита от гонок при параллельных запросах. Free: 3 кредита, авто-сброс раз в месяц (lazy-check при запросе профиля — без cron в MVP). Regenerate тоже стоит 1 кредит. При ошибке генерации кредит возвращается.

---

## 4. Поток генерации

### Клиентская state machine (Zustand, `features/generate-image/model`)

```
IDLE → UPLOADING → PHOTO_READY → STYLE_SELECTED → GENERATING → RESULT_READY
                                       ↑______________________________|
                                        (regenerate / change style)
```

### Серверный поток

```
POST /api/upload          multipart, ≤10MB, MIME-whitelist (jpg/jpeg/png/webp/heic/heif)
  → sharp: HEIC→JPEG, resize ≤2048px, strip EXIF, → JPEG q85
  → Supabase Storage (private 'originals') → original_images
  ← { originalImageId, previewUrl (signed) }

POST /api/generations     { originalImageId, styleId }
  → auth → consume_credit() → generations(status=pending)
  → async: OpenAI Images Edit (фото + prompt_template стиля)
  → результат → Storage ('results') → generation_variants(version=1)
  → status=completed | failed (+ возврат кредита)
  ← { generationId }        клиент поллит GET /api/generations/[id] каждые 2с

POST /api/generations/[id]/variants    -- regenerate: то же, version+1
```

**Почему polling, а не SSE/WebSocket:** генерация 15–60 сек, поллинг раз в 2 сек прост, надёжен на мобильных сетях и в serverless. Интерфейс `generation.api` позволит заменить на SSE позже.

**Экран ожидания:** анимированные шаги «Анализируем фото → Применяем стиль → Финальные штрихи», прогресс по таймингу, микроанимации Framer Motion. Никаких спиннеров-заглушек.

### Экран результата

- Название стиля, крупное изображение (fade-in).
- Слайдер версий: `Версия 3 / 5` + горизонтальная лента миниатюр, свайп на мобильном, активная подсвечена.
- Действия: **Скачать** (signed URL), **Поделиться** (Web Share API → fallback копия ссылки), **Ещё вариант** (regenerate), **Другой стиль** (возврат к галерее, фото сохраняется).

---

## 5. Библиотека стилей (15 стилей)

| Категория | Стили |
|---|---|
| **Trending** | Anime Dream, Pixar Character, Cinematic Movie, Luxury Magazine, Vintage Film |
| **Creative** | Cyberpunk, Fantasy Hero, Comic Book, Watercolor, Oil Painting |
| **Professional** | LinkedIn Portrait, Startup Founder, Influencer Style |
| **Fun** | Retro 90s, Game Character |

- Стили в БД (seed-скрипт), промпты меняются без деплоя, версионируются (`prompt_version`).
- Карточка = превью-изображение + локализованное имя + эмоциональное описание («Стань героем аниме»). Названия/описания — в словарях next-intl по ключу `styles.<id>`.
- Промпт-шаблоны на клиент **никогда** не попадают.

---

## 6. Безопасность

- **Файлы:** MIME по magic bytes (не по расширению), лимит 10MB, один файл, EXIF удаляется всегда.
- **Storage:** оба бакета приватные; выдача только через signed URLs (TTL 1 час).
- **API:** все ручки кроме `styles` требуют сессию; zod-валидация входа; единый формат ошибок `{ error: { code, message } }` (code → ключ локализации).
- **Rate limiting (подготовка):** middleware-заглушка с in-memory лимитом на upload/generate; интерфейс под Upstash Redis.
- **Ключи:** `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` — только на сервере.

---

## 7. Локализация, PWA, Аналитика

**next-intl:** локали `en` (default), `ru`, `tr`, `es`; префикс `/[locale]/`; словари `messages/{locale}.json` — UI, ошибки, стили, онбординг. Язык сохраняется в профиле.

**PWA:** `manifest.ts` (standalone, иконки, theme color), service worker с кэшем статики, `apple-mobile-web-app-*` мета, safe-area insets.

**Аналитика:** `shared/analytics` — типизированный `track(event, props)`, в MVP пишет в console/dataLayer, интерфейс под Amplitude/PostHog. События: `page_view`, `upload_started`, `upload_completed`, `style_selected`, `generation_started`, `generation_completed`, `generation_failed`, `download_clicked`, `share_clicked`, `credit_exhausted`, `subscription_clicked`.

---

## 8. Страницы

| Роут | Содержимое |
|---|---|
| `/` | Hero «до → после» (авто-слайдер), CTA **«Попробовать бесплатно»**, примеры стилей, 3 benefit-блока, pricing teaser (Free 3/мес + «скоро Pro»), футер |
| `/create` | Единый экран-flow без перезагрузок: upload → галерея стилей → прогресс → результат |
| `/history` | Сетка прошлых генераций (изображение, стиль, дата) → открытие результата |
| `/account` | Email, язык, кредиты (осталось X из 3), статус подписки, выход |

Гость видит лендинг и галерею стилей; авторизация запрашивается перед первой генерацией (минимум трения до момента ценности).

---

## 9. План реализации (пауза после каждого шага)

| # | Шаг | Что делаем |
|---|---|---|
| 1 | ✅ **Каркас проекта** | Next.js 16 + TS strict + Tailwind 4 + shadcn/ui + Framer Motion + Zustand; FSD-структура папок; ESLint/Prettier; env-шаблон |
| 2 | ✅ **UI-система + лендинг** | Токены темы, базовые компоненты, app-header, лендинг `/`; сюда же перенесена next-intl-инфраструктура (роутинг `/[locale]/`, словари en/ru; полные переводы tr/es — в шаге 10) |
| 3 | ✅ **БД + Supabase** | SQL-миграции, RLS, `consume_credit()`, seed 15 стилей, бакеты; инструкция по применению — `supabase/README.md` |
| 4 | ✅ **Аутентификация** | Supabase Auth (magic link + Google), `users`-зеркало, guard'ы; настройка провайдеров — `supabase/README.md` §4 |
| 5 | ✅ **Загрузка фото** | `/api/upload` (sharp, HEIC, EXIF), widget photo-uploader, превью |
| 6 | ✅ **Выбор стиля** | `/api/styles`, style-gallery с категориями, StyleCard |
| 7 | **AI-генерация** | generation.service + OpenAI-адаптер, кредиты, state machine, polling, премиальный экран ожидания |
| 8 | **Результат + версии** | result-viewer, слайдер версий, regenerate, download/share |
| 9 | **История + аккаунт** | `/history`, `/account` |
| 10 | **Локализация** | next-intl, 4 словаря, переключатель языка |
| 11 | **PWA** | manifest, SW, иконки, установка |
| 12 | **Аналитика + полировка** | события, edge cases, empty states, финальный проход по UX |

Перед каждым шагом — краткое описание: что реализуется, какие файлы, почему такой подход. После — пауза на вашу проверку.

---

## 10. Что осознанно НЕ делаем (MVP)

Кастомные промпты, мультизагрузка, видео, соцфункции (лайки/комментарии/избранное), редактирование/фильтры, нативные приложения, реальные платежи (только архитектурный задел: `subscription_status`, `credit_transactions`).
