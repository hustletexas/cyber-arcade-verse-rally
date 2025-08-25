
-- Create table for NFT creation orders
CREATE TABLE public.nft_creation_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  creator_name TEXT NOT NULL,
  artwork_url TEXT,
  music_url TEXT,
  nft_type TEXT NOT NULL DEFAULT 'music', -- 'music', 'art', 'hybrid'
  cctr_cost INTEGER NOT NULL DEFAULT 500,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'minting', 'completed', 'failed'
  mint_address TEXT,
  transaction_hash TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nft_creation_orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own NFT orders" 
  ON public.nft_creation_orders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own NFT orders" 
  ON public.nft_creation_orders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own NFT orders" 
  ON public.nft_creation_orders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER set_nft_creation_orders_updated_at
  BEFORE UPDATE ON public.nft_creation_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.set_timestamp_updated_at();

-- Update token_transactions table to include NFT creation type
ALTER TABLE public.token_transactions 
ADD COLUMN IF NOT EXISTS nft_order_id UUID REFERENCES public.nft_creation_orders(id);
