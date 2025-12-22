-- Fix complete_solana_tournament to derive admin wallet from auth context instead of client parameter
CREATE OR REPLACE FUNCTION public.complete_solana_tournament(tournament_id_param uuid, winner_wallet_param text, admin_wallet_param text DEFAULT NULL)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  tournament_record RECORD;
  prize_amount DECIMAL(10,4);
  caller_wallet TEXT;
BEGIN
  -- Require authenticated user
  IF auth.uid() IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Authentication required');
  END IF;

  -- Get caller's wallet from JWT or profiles (prefer JWT claim if available)
  caller_wallet := COALESCE(
    auth.jwt() ->> 'wallet_address',
    (SELECT wallet_address FROM public.profiles WHERE id = auth.uid())
  );
  
  IF caller_wallet IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No wallet associated with authenticated user');
  END IF;

  -- Get tournament details
  SELECT * INTO tournament_record
  FROM public.solana_tournaments 
  WHERE id = tournament_id_param;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Tournament not found');
  END IF;
  
  -- Verify caller is the tournament admin (using authenticated wallet, not client-provided)
  IF tournament_record.admin_wallet != caller_wallet AND NOT public.is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Unauthorized: Only tournament admin can complete tournament');
  END IF;
  
  -- Calculate winner's prize (90% of prize pool, 10% goes to admin)
  prize_amount := tournament_record.prize_pool * 0.9;
  
  -- Update tournament status and winner
  UPDATE public.solana_tournaments 
  SET 
    status = 'completed',
    winner_wallet = winner_wallet_param,
    end_time = now(),
    updated_at = now()
  WHERE id = tournament_id_param;
  
  -- Update winner's entry with reward
  UPDATE public.solana_tournament_entries 
  SET 
    placement = 1,
    reward_amount = prize_amount,
    updated_at = now()
  WHERE tournament_id = tournament_id_param AND wallet_address = winner_wallet_param;
  
  RETURN json_build_object('success', true, 'prize_amount', prize_amount, 'completed_by', caller_wallet);
END;
$function$;

-- Fix mutable search_path on functions
-- set_timestamp_updated_at
CREATE OR REPLACE FUNCTION public.set_timestamp_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- update_achievements_updated_at
CREATE OR REPLACE FUNCTION public.update_achievements_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- handle_new_user (already has search_path but uses empty string, update to 'public')
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  
  INSERT INTO public.user_balances (user_id, cctr_balance, claimable_rewards)
  VALUES (new.id, 1000, 0);
  
  RETURN new;
END;
$function$;