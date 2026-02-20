
-- Fix: Drop and recreate tournament_standings_secure view with wallet masking
DROP VIEW IF EXISTS public.tournament_standings_secure;

CREATE VIEW public.tournament_standings_secure
WITH (security_invoker = true) AS
SELECT
  id, tournament_id, user_id, placement, wins, losses, points,
  prize_amount_usd, prize_amount_usdc, finalized, finalized_at, created_at,
  CASE
    WHEN user_id = (SELECT auth.uid()) OR public.is_admin()
    THEN wallet_address
    ELSE public.mask_wallet_address(wallet_address)
  END as wallet_address
FROM public.tournament_standings;
