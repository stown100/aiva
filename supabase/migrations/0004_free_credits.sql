-- AIVA — free plan lowered to 2 credits/month
-- Also removes the hardcoded amount from ensure_monthly_credits(): the server
-- now passes FREE_MONTHLY_CREDITS (src/shared/config/credits.ts), so the only
-- number left in the DB is the default for brand-new accounts below.

-- NB: must match FREE_MONTHLY_CREDITS in src/shared/config/credits.ts
alter table public.users alter column credits set default 2;

-- Same lazy monthly reset as before, amount comes from the caller.
drop function public.ensure_monthly_credits(uuid);

create function public.ensure_monthly_credits(p_user_id uuid, p_free_credits int)
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
  set credits = greatest(v_credits, p_free_credits),
      credits_reset_at = now() + interval '1 month'
  where id = p_user_id;

  if v_credits < p_free_credits then
    insert into public.credit_transactions (user_id, amount, reason)
    values (p_user_id, p_free_credits - v_credits, 'monthly_reset');
  end if;
end;
$$;

revoke execute on function public.ensure_monthly_credits(uuid, int) from public, anon, authenticated;
