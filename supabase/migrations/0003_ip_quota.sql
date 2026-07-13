-- AIVA — per-IP quota for free generations
-- Closes the "new account = new free credits" loophole: every free-plan spend
-- is also counted against the caller's IP with a lazy monthly window, so
-- re-registering with a fresh email from the same address gives nothing.
--
-- Privacy: the database never sees a raw IP. The server stores
-- HMAC-SHA256(ip, IP_HASH_SECRET) — see src/server/lib/client-ip.ts.

-- ============================================================
-- free_ip_usage (server-only counter per hashed IP)
-- ============================================================
create table public.free_ip_usage (
  ip_hash text primary key,
  -- NB: the cap lives in FREE_MONTHLY_GENERATIONS_PER_IP (src/shared/config/credits.ts)
  -- and is passed into consume_ip_quota() by the server.
  used int not null default 0 check (used >= 0),
  reset_at timestamptz not null default now() + interval '1 month'
);

-- No policies on purpose: only the server (service role) may touch this table.
alter table public.free_ip_usage enable row level security;

-- The hashed IP a spend was charged against; null when no IP quota was
-- consumed (pro user or unknown IP). Lets the worker refund the quota on failure.
alter table public.generations add column client_ip_hash text;

-- ============================================================
-- IP quota functions (server-only; atomic against concurrent requests)
-- ============================================================
create or replace function public.consume_ip_quota(p_ip_hash text, p_limit int)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used int;
  v_reset timestamptz;
begin
  insert into public.free_ip_usage (ip_hash)
  values (p_ip_hash)
  on conflict (ip_hash) do nothing;

  select used, reset_at into v_used, v_reset
  from public.free_ip_usage
  where ip_hash = p_ip_hash
  for update;

  if v_reset <= now() then
    v_used := 0;
    update public.free_ip_usage
    set used = 0, reset_at = now() + interval '1 month'
    where ip_hash = p_ip_hash;
  end if;

  if v_used >= p_limit then
    return false;
  end if;

  update public.free_ip_usage
  set used = used + 1
  where ip_hash = p_ip_hash;

  return true;
end;
$$;

create or replace function public.refund_ip_quota(p_ip_hash text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.free_ip_usage
  set used = greatest(used - 1, 0)
  where ip_hash = p_ip_hash;
end;
$$;

revoke execute on function public.consume_ip_quota(text, int) from public, anon, authenticated;
revoke execute on function public.refund_ip_quota(text) from public, anon, authenticated;
