# AIVA — Create your new style

AI-платформа трансформации фото: пользователь загружает одно фото, выбирает стиль — и получает AI-версию себя. Никаких промптов и настроек, максимум визуального эффекта при минимуме решений.

**Стек:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · shadcn/ui · Framer Motion · Zustand · next-intl · Supabase (PostgreSQL, Auth, Storage) · OpenAI Image API · Sharp

Полная архитектура и план реализации — в [doc.md](doc.md).

## Быстрый старт

```bash
npm install
cp .env.example .env.local   # заполнить ключи (см. ниже)
npm run dev                  # http://localhost:3000
```

### 1. Supabase

Создан проект на [supabase.com](https://supabase.com), применить миграции и seed, включить аутентификацию — пошаговая инструкция в [supabase/README.md](supabase/README.md) (там же — управление кредитами).

### 2. Переменные окружения (`.env.local`)

| Переменная | Где взять |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | там же, `publishable`-ключ |
| `SUPABASE_SERVICE_ROLE_KEY` | там же, `secret`-ключ (только сервер!) |
| `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com/api-keys) |
| `OPENAI_IMAGE_MODEL` | опционально, по умолчанию `gpt-image-1` |
| `OPENAI_IMAGE_QUALITY` | опционально: `low` / `medium` (default) / `high` / `auto` |

## Скрипты

```bash
npm run dev     # dev-сервер (Turbopack)
npm run build   # production-сборка
npm start       # запуск production-сборки
npm run lint    # ESLint
```

## Архитектура

Feature-Sliced Design; серверная логика изолирована для будущего выноса в отдельный сервис:

```
src/
├── app/        # Next.js App Router: роутинг /[locale]/* + api/* (тонкие контроллеры)
├── views/      # Страницы (FSD pages): landing, create, history, account, auth
├── widgets/    # Крупные блоки: style-gallery, result-viewer, generation-progress…
├── features/   # Действия пользователя: upload-photo, generate-image, share-result…
├── entities/   # Бизнес-сущности: user, style, generation, variant
├── shared/     # UI-кит, api-клиент, i18n, config, analytics, pwa
└── server/     # Бэкенд: services / repositories / storage / auth (service role)
```

Ключевые принципы:

- Импорты только «вниз»: `views → widgets → features → entities → shared`.
- UI-компоненты без бизнес-логики; логика — в `model`-хуках и сторах.
- Промпты стилей живут в БД (`styles.prompt_template`) и никогда не попадают на клиент.
- Кредиты списываются атомарно в Postgres; при ошибке генерации возвращаются.
- Локали: en (по умолчанию, без префикса), ru, tr, es — словари в `messages/`.

## Деплой (заметки)

- Нужен HTTPS-домен: добавить его в Supabase → Auth → URL Configuration и в env.
- На Vercel лимит тела запроса ~4.5MB — для загрузок до 10MB перейти на прямую загрузку в Storage по signed URL.
- Rate limiting сейчас in-memory (один инстанс) — для прода заменить на Upstash Redis в `src/server/lib/rate-limit.ts`.
- `gpt-image-1` отключается OpenAI 23.10.2026 — смена модели через `OPENAI_IMAGE_MODEL`.
