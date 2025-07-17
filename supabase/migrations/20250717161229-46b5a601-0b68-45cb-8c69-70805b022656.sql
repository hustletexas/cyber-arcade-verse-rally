-- Create prizes table for redeemable prizes
CREATE TABLE public.prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  prize_type TEXT NOT NULL DEFAULT 'physical', -- 'physical', 'digital', 'token'
  contract_address TEXT, -- Solana contract address for NFT/token prizes
  metadata_uri TEXT, -- IPFS URI for NFT metadata
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_prizes table to track won prizes
CREATE TABLE public.user_prizes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prize_id UUID NOT NULL REFERENCES public.prizes(id),
  source_type TEXT NOT NULL, -- 'raffle', 'tournament'
  source_id UUID NOT NULL, -- raffle_id or tournament_id
  won_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  redemption_transaction_hash TEXT, -- Solana transaction hash
  wallet_address TEXT, -- Solana wallet address used for redemption
  shipping_address TEXT, -- For physical prizes
  redemption_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'redeemed', 'shipped', 'delivered'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.prizes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_prizes ENABLE ROW LEVEL SECURITY;

-- Create policies for prizes table
CREATE POLICY "Anyone can view active prizes" 
ON public.prizes 
FOR SELECT 
USING (is_active = true);

-- Create policies for user_prizes table  
CREATE POLICY "Users can view their own prizes" 
ON public.user_prizes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own prizes" 
ON public.user_prizes 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_prizes_user_id ON public.user_prizes(user_id);
CREATE INDEX idx_user_prizes_source ON public.user_prizes(source_type, source_id);
CREATE INDEX idx_user_prizes_status ON public.user_prizes(redemption_status);

-- Insert default prizes
INSERT INTO public.prizes (name, description, image_url, prize_type) VALUES
('Gaming PC RTX 4090', 'High-end gaming PC with RTX 4090 graphics card', '/lovable-uploads/3fc5f3c0-2b28-4cff-acdc-7c3896ee635b.png', 'physical'),
('PlayStation 5', 'Sony PlayStation 5 gaming console', '/lovable-uploads/8820a165-f5a8-4d8a-b9d4-8dca31666e27.png', 'physical'),
('Meta Quest 3', 'Virtual reality headset', '/lovable-uploads/5fbf2609-10c6-421a-a9dc-34513c43cea0.png', 'physical'),
('Legendary NFT', 'Exclusive legendary NFT collectible', '/lovable-uploads/89628fec-79c5-4251-b4cb-915cceb7e9b0.png', 'digital'),
('Epic NFT', 'Rare epic NFT collectible', '/lovable-uploads/7b8388cc-637c-4b0e-9a7e-d1fda1b2a279.png', 'digital'),
('Rare NFT', 'Valuable rare NFT collectible', '/lovable-uploads/6347bc0d-7044-4d7c-8264-0d89f8640c08.png', 'digital');