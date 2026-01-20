-- Enable RLS on user_balances table (may already be enabled, but this ensures it)
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- Force RLS for table owner as well (extra security)
ALTER TABLE public.user_balances FORCE ROW LEVEL SECURITY;