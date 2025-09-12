-- Create node_purchases table for tracking node ownership
CREATE TABLE public.node_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  node_type TEXT NOT NULL, -- 'basic', 'premium', 'legendary'
  quantity INTEGER NOT NULL DEFAULT 1,
  price_sol DECIMAL(10,4) NOT NULL,
  transaction_hash TEXT NOT NULL,
  mint_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.node_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own node purchases" 
ON public.node_purchases 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own node purchases" 
ON public.node_purchases 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own node purchases" 
ON public.node_purchases 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create node_rewards table for tracking daily rewards
CREATE TABLE public.node_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  wallet_address TEXT NOT NULL,
  reward_amount DECIMAL(10,4) NOT NULL,
  reward_date DATE NOT NULL DEFAULT CURRENT_DATE,
  transaction_hash TEXT,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.node_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies for node_rewards
CREATE POLICY "Users can view their own node rewards" 
ON public.node_rewards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own node rewards" 
ON public.node_rewards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own node rewards" 
ON public.node_rewards 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_node_purchases_user_id ON public.node_purchases(user_id);
CREATE INDEX idx_node_purchases_wallet ON public.node_purchases(wallet_address);
CREATE INDEX idx_node_rewards_user_id ON public.node_rewards(user_id);
CREATE INDEX idx_node_rewards_date ON public.node_rewards(reward_date);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_node_purchases_updated_at
BEFORE UPDATE ON public.node_purchases
FOR EACH ROW
EXECUTE FUNCTION public.set_timestamp_updated_at();

CREATE TRIGGER update_node_rewards_updated_at
BEFORE UPDATE ON public.node_rewards
FOR EACH ROW
EXECUTE FUNCTION public.set_timestamp_updated_at();