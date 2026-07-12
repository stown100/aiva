# Supabase setup

## 1. Создать проект

[supabase.com](https://supabase.com) → New project. После создания взять из **Settings → API**:

| Ключ | Куда положить (`.env.local`) |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key (secret!) | `SUPABASE_SERVICE_ROLE_KEY` |

`.env.local` создать по образцу `.env.example` (в git не попадает).

## 2. Применить миграции

**Вариант A — SQL Editor (без установки CLI):**
Dashboard → SQL Editor → выполнить файлы по порядку:

1. `migrations/0001_schema.sql` — таблицы, RLS, функции кредитов
2. `migrations/0002_storage.sql` — приватные бакеты `originals` / `results`
3. `seed.sql` — 15 стилей с промптами

**Вариант B — Supabase CLI:**

```bash
brew install supabase/tap/supabase
supabase login
supabase link --project-ref <PROJECT_REF>
supabase db push          # применит migrations/*
# seed выполнить через SQL Editor или psql
```

## 3. Проверка

SQL Editor:

```sql
select count(*) from public.styles;          -- 15
select id, name from storage.buckets;        -- originals, results
select * from public.styles_public limit 3;  -- без prompt_template
```

## Замечания

- Оба бакета приватные, без storage-политик: доступ только у сервера (service role), клиент получает подписанные ссылки с TTL.
- `styles.prompt_template` недоступен клиентским ключам — каталог читается через view `styles_public`.
- Функции `consume_credit` / `refund_credit` / `ensure_monthly_credits` вызываются только сервером (execute у `anon`/`authenticated` отозван).
- Число бесплатных кредитов (3) захардкожено в `0001_schema.sql` и должно совпадать с `FREE_MONTHLY_CREDITS` в `src/shared/config/credits.ts`.
