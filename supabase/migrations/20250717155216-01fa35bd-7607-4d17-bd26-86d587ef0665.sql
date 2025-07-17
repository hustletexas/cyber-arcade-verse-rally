-- Create NFT purchases table
CREATE TABLE public.nft_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nft_id TEXT NOT NULL,
  nft_name TEXT NOT NULL,
  price DECIMAL(20,8) NOT NULL,
  currency TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  transaction_hash TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.nft_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own purchases" 
ON public.nft_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own purchases" 
ON public.nft_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases" 
ON public.nft_purchases 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_nft_purchases_user_id ON public.nft_purchases(user_id);
CREATE INDEX idx_nft_purchases_status ON public.nft_purchases(status);