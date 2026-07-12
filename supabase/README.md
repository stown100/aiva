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

## 4. Настройка аутентификации

**Authentication → URL Configuration:**

- Site URL: `http://localhost:3000` (на проде — домен приложения)
- Redirect URLs: добавить `http://localhost:3000/api/auth/callback`

Magic link (email OTP) работает из коробки; встроенный почтовый сервис Supabase имеет лимит ~3-4 письма в час — для продакшена подключить SMTP (Settings → Auth → SMTP).

**Google OAuth (опционально):** Authentication → Providers → Google → включить, вставить Client ID/Secret из [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Client, redirect URI указан на той же странице провайдера в Supabase).

## Управление кредитами

Все команды выполняются в **SQL Editor** дашборда (или в Table Editor — таблица `users`, колонка `credits`).

### Как это устроено

- Баланс — `users.credits`. Каждая генерация и каждый regenerate списывают 1 кредит функцией `consume_credit()` (атомарно, при 0 кредитов API вернёт `402 no_credits`).
- При ошибке генерации кредит автоматически возвращается (`refund_credit()`).
- Бесплатный план: 3 кредита в месяц. Сброс ленивый — функция `ensure_monthly_credits()` вызывается сервером при запросе профиля (`/api/me`), cron не нужен. Дата следующего сброса — `users.credits_reset_at`. Сброс не срезает баланс выше 3 (купленные кредиты не сгорают).
- Каждая операция логируется в `credit_transactions` (`generation` / `refund` / `monthly_reset` / `purchase`) — это аудит и задел под платежи.

### Посмотреть баланс

```sql
select email, credits, credits_reset_at, subscription_status from public.users;
```

### Выдать кредиты

```sql
-- конкретному пользователю
update public.users set credits = 10 where email = 'user@example.com';

-- всем (нужен where)
update public.users set credits = 10 where true;
```

Для аудита «правильнее» начислять через транзакцию (баланс + запись в журнал):

```sql
with granted as (
  update public.users set credits = credits + 5
  where email = 'user@example.com'
  returning id
)
insert into public.credit_transactions (user_id, amount, reason)
select id, 5, 'purchase' from granted;
```

### Протестировать месячный сброс

```sql
update public.users
set credits = 0, credits_reset_at = now() - interval '1 day'
where email = 'user@example.com';
```

После этого первый же запрос `/api/me` (обновить страницу приложения) начислит 3 кредита, сдвинет `credits_reset_at` на месяц вперёд и запишет `monthly_reset` в журнал.

### Посмотреть журнал операций

```sql
select t.created_at, u.email, t.amount, t.reason, t.generation_id
from public.credit_transactions t
join public.users u on u.id = t.user_id
order by t.created_at desc
limit 50;
```

### Изменить размер бесплатного плана

Число 3 живёт в двух местах и должно совпадать:

1. `supabase/migrations/0001_schema.sql` — default колонки `credits` и константы внутри `ensure_monthly_credits()` (в живой БД — отредактировать функцию через SQL Editor);
2. `src/shared/config/credits.ts` — `FREE_MONTHLY_CREDITS` (используется в текстах UI).

## Замечания

- Оба бакета приватные, без storage-политик: доступ только у сервера (service role), клиент получает подписанные ссылки с TTL.
- `styles.prompt_template` недоступен клиентским ключам — каталог читается через view `styles_public`.
- Функции `consume_credit` / `refund_credit` / `ensure_monthly_credits` вызываются только сервером (execute у `anon`/`authenticated` отозван).
- Число бесплатных кредитов (3) захардкожено в `0001_schema.sql` и должно совпадать с `FREE_MONTHLY_CREDITS` в `src/shared/config/credits.ts`.
