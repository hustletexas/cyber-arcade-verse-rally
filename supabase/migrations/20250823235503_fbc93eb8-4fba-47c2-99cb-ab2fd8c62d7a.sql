
-- 1) Create table to track one NFT mint per wallet
CREATE TABLE IF NOT EXISTS public.nft_mints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  nft_name TEXT NOT NULL,
  mint_address TEXT NOT NULL,
  transaction_hash TEXT NOT NULL,
  metadata JSONB,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2) Enforce only one mint per wallet
CREATE UNIQUE INDEX IF NOT EXISTS nft_mints_wallet_address_unique
  ON public.nft_mints (wallet_address);

-- Helpful index for queries by user
CREATE INDEX IF NOT EXISTS nft_mints_user_id_idx
  ON public.nft_mints (user_id);

-- 3) Enable Row Level Security
ALTER TABLE public.nft_mints ENABLE ROW LEVEL SECURITY;

-- 4) RLS policies: users can only access their own rows
DO $$
BEGIN
  -- SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'nft_mints' AND policyname = 'Users can view their own mints'
  ) THEN
    CREATE POLICY "Users can view their own mints"
      ON public.nft_mints
      FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  -- INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'nft_mints' AND policyname = 'Users can create their own mints'
  ) THEN
    CREATE POLICY "Users can create their own mints"
      ON public.nft_mints
      FOR INSERT
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'nft_mints' AND policyname = 'Users can update their own mints'
  ) THEN
    CREATE POLICY "Users can update their own mints"
      ON public.nft_mints
      FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- 5) Optional: keep updated_at fresh on updates
CREATE OR REPLACE FUNCTION public.set_timestamp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'set_timestamp_updated_at_nft_mints'
  ) THEN
    CREATE TRIGGER set_timestamp_updated_at_nft_mints
      BEFORE UPDATE ON public.nft_mints
      FOR EACH ROW
      EXECUTE FUNCTION public.set_timestamp_updated_at();
  END IF;
END
$$;
