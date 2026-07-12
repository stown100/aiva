-- AIVA — initial schema
-- Apply order: 0001_schema.sql → 0002_storage.sql → ../seed.sql

-- ============================================================
-- users (mirror of auth.users + app profile)
-- ============================================================
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  language text not null default 'en',
  -- NB: default and monthly reset amount must match FREE_MONTHLY_CREDITS in src/shared/config/credits.ts
  credits int not null default 3 check (credits >= 0),
  credits_reset_at timestamptz not null default now() + interval '1 month',
  subscription_status text not null default 'free'
    check (subscription_status in ('free', 'pro')),
  created_at timestamptz not null default now()
);

-- Mirror every new auth user into public.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, coalesce(new.email, ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- original_images
-- ============================================================
create table public.original_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  storage_path text not null,
  format text not null,
  width int,
  height int,
  size_bytes int,
  created_at timestamptz not null default now()
);

create index original_images_user_idx on public.original_images (user_id, created_at desc);

-- ============================================================
-- styles (prompt_template must NEVER reach the client — see styles_public)
-- ============================================================
create table public.styles (
  id text primary key,
  category text not null
    check (category in ('trending', 'creative', 'professional', 'fun')),
  preview_url text,
  prompt_template text not null,
  prompt_version int not null default 1,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- ============================================================
-- generations
-- ============================================================
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  original_image_id uuid not null references public.original_images (id) on delete cascade,
  style_id text not null references public.styles (id),
  prompt_version int not null default 1,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'completed', 'failed')),
  error_code text,
  created_at timestamptz not null default now()
);

create index generations_user_idx on public.generations (user_id, created_at desc);

-- ============================================================
-- generation_variants
-- ============================================================
create table public.generation_variants (
  id uuid primary key default gen_random_uuid(),
  generation_id uuid not null references public.generations (id) on delete cascade,
  version_number int not null check (version_number > 0),
  storage_path text not null,
  created_at timestamptz not null default now(),
  unique (generation_id, version_number)
);

-- ============================================================
-- credit_transactions (audit trail; groundwork for payments)
-- ============================================================
create table public.credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  amount int not null,
  reason text not null
    check (reason in ('generation', 'refund', 'monthly_reset', 'purchase')),
  generation_id uuid references public.generations (id) on delete set null,
  created_at timestamptz not null default now()
);

create index credit_transactions_user_idx on public.credit_transactions (user_id, created_at desc);

-- ============================================================
-- Row Level Security
-- All writes go through the server (service role bypasses RLS).
-- Authenticated users can only read their own rows; styles are exposed
-- exclusively through the styles_public view (no prompt columns).
-- ============================================================
alter table public.users enable row level security;
alter table public.original_images enable row level security;
alter table public.styles enable row level security;
alter table public.generations enable row level security;
alter table public.generation_variants enable row level security;
alter table public.credit_transactions enable row level security;

create policy users_select_own on public.users
  for select using (auth.uid() = id);

create policy original_images_select_own on public.original_images
  for select using (auth.uid() = user_id);

create policy generations_select_own on public.generations
  for select using (auth.uid() = user_id);

create policy generation_variants_select_own on public.generation_variants
  for select using (
    exists (
      select 1 from public.generations g
      where g.id = generation_id and g.user_id = auth.uid()
    )
  );

create policy credit_transactions_select_own on public.credit_transactions
  for select using (auth.uid() = user_id);

-- Public style catalog without prompt columns.
-- The view runs as its owner, so it can read the RLS-protected table.
create view public.styles_public as
  select id, category, preview_url, sort_order
  from public.styles
  where active;

grant select on public.styles_public to anon, authenticated;

-- ============================================================
-- Credit functions (server-only; atomic against concurrent requests)
-- ============================================================
create or replace function public.consume_credit(p_user_id uuid, p_generation_id uuid default null)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_updated int;
begin
  update public.users
  set credits = credits - 1
  where id = p_user_id and credits > 0;

  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return false;
  end if;

  insert into public.credit_transactions (user_id, amount, reason, generation_id)
  values (p_user_id, -1, 'generation', p_generation_id);

  return true;
end;
$$;

create or replace function public.refund_credit(p_user_id uuid, p_generation_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
  set credits = credits + 1
  where id = p_user_id;

  insert into public.credit_transactions (user_id, amount, reason, generation_id)
  values (p_user_id, 1, 'refund', p_generation_id);
end;
$$;

-- Lazy monthly reset for free users: called by the server before reading
-- the profile / starting a generation, so no cron is needed in the MVP.
create or replace function public.ensure_monthly_credits(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_credits int;
begin
  select credits into v_credits
  from public.users
  where id = p_user_id
    and subscription_status = 'free'
    and credits_reset_at <= now()
  for update;

  if not found then
    return;
  end if;

  update public.users
  set credits = greatest(v_credits, 3),
      credits_reset_at = now() + interval '1 month'
  where id = p_user_id;

  if v_credits < 3 then
    insert into public.credit_transactions (user_id, amount, reason)
    values (p_user_id, 3 - v_credits, 'monthly_reset');
  end if;
end;
$$;

-- Credit functions are callable by the server only
revoke execute on function public.consume_credit(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.refund_credit(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.ensure_monthly_credits(uuid) from public, anon, authenticated;
