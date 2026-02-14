
-- DJ Achievement Milestones & On-Chain Badge Claims
CREATE TABLE public.dj_milestones (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  milestone_type text NOT NULL, -- 'first_mix', 'ten_mixes', 'featured_mix'
  mix_count integer NOT NULL DEFAULT 0,
  reached_at timestamp with time zone,
  claim_eligible boolean NOT NULL DEFAULT false,
  claimed boolean NOT NULL DEFAULT false,
  claim_transaction_hash text,
  claimed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, milestone_type)
);

ALTER TABLE public.dj_milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own milestones"
  ON public.dj_milestones FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON public.dj_milestones FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON public.dj_milestones FOR UPDATE
  USING (auth.uid() = user_id);

-- Track completed mixes for counting
CREATE TABLE public.dj_completed_mixes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Untitled Mix',
  duration_seconds integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.dj_completed_mixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mixes"
  ON public.dj_completed_mixes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mixes"
  ON public.dj_completed_mixes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to check and update DJ milestones after a mix is saved
CREATE OR REPLACE FUNCTION public.check_dj_milestones(p_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_mix_count integer;
  v_has_featured boolean;
  v_new_milestones jsonb := '[]'::jsonb;
BEGIN
  -- Count completed mixes
  SELECT count(*) INTO v_mix_count
  FROM dj_completed_mixes WHERE user_id = p_user_id;

  -- Check featured
  SELECT exists(SELECT 1 FROM dj_completed_mixes WHERE user_id = p_user_id AND is_featured = true)
  INTO v_has_featured;

  -- First mix milestone
  IF v_mix_count >= 1 THEN
    INSERT INTO dj_milestones (user_id, milestone_type, mix_count, reached_at, claim_eligible)
    VALUES (p_user_id, 'first_mix', v_mix_count, now(), true)
    ON CONFLICT (user_id, milestone_type) DO UPDATE
    SET mix_count = v_mix_count,
        reached_at = COALESCE(dj_milestones.reached_at, now()),
        claim_eligible = true,
        updated_at = now()
    WHERE NOT dj_milestones.claim_eligible;

    IF FOUND THEN
      v_new_milestones := v_new_milestones || jsonb_build_object('type', 'first_mix', 'name', 'DJ Rookie Badge');
    END IF;
  END IF;

  -- 10 mixes milestone
  IF v_mix_count >= 10 THEN
    INSERT INTO dj_milestones (user_id, milestone_type, mix_count, reached_at, claim_eligible)
    VALUES (p_user_id, 'ten_mixes', v_mix_count, now(), true)
    ON CONFLICT (user_id, milestone_type) DO UPDATE
    SET mix_count = v_mix_count,
        reached_at = COALESCE(dj_milestones.reached_at, now()),
        claim_eligible = true,
        updated_at = now()
    WHERE NOT dj_milestones.claim_eligible;

    IF FOUND THEN
      v_new_milestones := v_new_milestones || jsonb_build_object('type', 'ten_mixes', 'name', 'DJ Regular Badge');
    END IF;
  END IF;

  -- Featured mix milestone
  IF v_has_featured THEN
    INSERT INTO dj_milestones (user_id, milestone_type, mix_count, reached_at, claim_eligible)
    VALUES (p_user_id, 'featured_mix', v_mix_count, now(), true)
    ON CONFLICT (user_id, milestone_type) DO UPDATE
    SET mix_count = v_mix_count,
        reached_at = COALESCE(dj_milestones.reached_at, now()),
        claim_eligible = true,
        updated_at = now()
    WHERE NOT dj_milestones.claim_eligible;

    IF FOUND THEN
      v_new_milestones := v_new_milestones || jsonb_build_object('type', 'featured_mix', 'name', 'DJ Champion Badge');
    END IF;
  END IF;

  RETURN jsonb_build_object('mix_count', v_mix_count, 'new_milestones', v_new_milestones);
END;
$$;
