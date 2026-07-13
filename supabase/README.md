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
3. `migrations/0003_ip_quota.sql` — лимит бесплатных генераций на IP (анти-абьюз мультиаккаунтов)
4. `migrations/0004_free_credits.sql` — бесплатный план 2 кредита; размер сброса передаёт сервер
5. `seed.sql` — 15 стилей с промптами

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
- Бесплатный план: `FREE_MONTHLY_CREDITS` (сейчас 2) кредита в месяц. Сброс ленивый — функция `ensure_monthly_credits()` вызывается сервером при запросе профиля (`/api/me`), размер сброса сервер передаёт параметром, cron не нужен. Дата следующего сброса — `users.credits_reset_at`. Сброс не срезает баланс выше лимита (купленные кредиты не сгорают).
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

После этого первый же запрос `/api/me` (обновить страницу приложения) начислит `FREE_MONTHLY_CREDITS` кредитов, сдвинет `credits_reset_at` на месяц вперёд и запишет `monthly_reset` в журнал.

### Лимит на IP (анти-абьюз мультиаккаунтов)

Помимо баланса аккаунта, каждая генерация free-пользователя считается по IP (таблица `free_ip_usage`, функция `consume_ip_quota()`): не более `FREE_MONTHLY_GENERATIONS_PER_IP` (`src/shared/config/credits.ts`) бесплатных генераций в месяц с одного адреса, сколько бы аккаунтов с него ни регистрировали. При превышении API отвечает тем же `402 no_credits` — механика не видна абьюзеру. Pro-пользователей лимит не касается; при неизвестном IP (локальная разработка) проверка пропускается. При ошибке генерации счётчик IP возвращается вместе с кредитом.

**Приватность:** сырые IP в базу не попадают — сервер хранит только `HMAC-SHA256(ip, IP_HASH_SECRET)` (`src/server/lib/client-ip.ts`). Секрет задаётся в env (`IP_HASH_SECRET`, генерация: `openssl rand -hex 32`); его ротация обнуляет все накопленные IP-квоты. Восстановить адрес из хеша нельзя, поэтому разблокировка делается через последнюю генерацию пожаловавшегося пользователя:

```sql
-- посмотреть расход по IP-хешам
select ip_hash, used, reset_at from public.free_ip_usage order by used desc limit 50;

-- разблокировать IP пользователя (ложное срабатывание: офис, общий Wi-Fi)
update public.free_ip_usage set used = 0
where ip_hash = (
  select g.client_ip_hash from public.generations g
  join public.users u on u.id = g.user_id
  where u.email = 'user@example.com' and g.client_ip_hash is not null
  order by g.created_at desc limit 1
);
```

### Посмотреть журнал операций

```sql
select t.created_at, u.email, t.amount, t.reason, t.generation_id
from public.credit_transactions t
join public.users u on u.id = t.user_id
order by t.created_at desc
limit 50;
```

### Изменить размер бесплатного плана

Число живёт в двух местах и должно совпадать:

1. `src/shared/config/credits.ts` — `FREE_MONTHLY_CREDITS`: сервер передаёт его в `ensure_monthly_credits()`, из него же берутся числа в текстах UI;
2. default колонки `users.credits` — стартовый баланс нового аккаунта (`supabase/migrations/0004_free_credits.sql`; в живой БД: `alter table public.users alter column credits set default N;`).

## Замечания

- Оба бакета приватные, без storage-политик: доступ только у сервера (service role), клиент получает подписанные ссылки с TTL.
- `styles.prompt_template` недоступен клиентским ключам — каталог читается через view `styles_public`.
- Функции `consume_credit` / `refund_credit` / `ensure_monthly_credits` / `consume_ip_quota` / `refund_ip_quota` вызываются только сервером (execute у `anon`/`authenticated` отозван).
- Число бесплатных кредитов задаётся `FREE_MONTHLY_CREDITS` в `src/shared/config/credits.ts`; в БД захардкожен только default колонки `users.credits` (см. «Изменить размер бесплатного плана»).
