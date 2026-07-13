// NB: must match the `users.credits` column default (supabase/migrations/0004_free_credits.sql);
// the monthly reset amount is passed from here into ensure_monthly_credits().
export const FREE_MONTHLY_CREDITS = 2;

export const GENERATION_CREDIT_COST = 1;

/**
 * Monthly cap on free-plan generations from one IP, across all accounts —
 * blocks farming free credits with fresh sign-ups. Deliberately above
 * FREE_MONTHLY_CREDITS so a household or office sharing an IP is not locked
 * out after a single account's quota.
 */
export const FREE_MONTHLY_GENERATIONS_PER_IP = 4;
