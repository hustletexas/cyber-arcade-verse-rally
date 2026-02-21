
-- Match proof submissions for AI Tournament Referee
CREATE TABLE public.match_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.tournament_matches(id) ON DELETE CASCADE,
  tournament_id UUID NOT NULL REFERENCES public.arcade_tournaments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  screenshot_url TEXT NOT NULL,
  clip_url TEXT,
  match_code TEXT,
  session_token TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'needs_review', 'rejected')),
  ai_confidence NUMERIC(5,2),
  ai_reasons JSONB DEFAULT '[]'::jsonb,
  reviewer_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Only one submission per user per match
CREATE UNIQUE INDEX idx_match_submissions_unique ON public.match_submissions(match_id, user_id);
CREATE INDEX idx_match_submissions_status ON public.match_submissions(verification_status);
CREATE INDEX idx_match_submissions_tournament ON public.match_submissions(tournament_id);

-- Enable RLS
ALTER TABLE public.match_submissions ENABLE ROW LEVEL SECURITY;

-- Users can submit their own proof
CREATE POLICY "Users can submit their own proof"
ON public.match_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can view their own submissions
CREATE POLICY "Users can view their own submissions"
ON public.match_submissions
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions"
ON public.match_submissions
FOR SELECT
USING (public.is_admin());

-- Admins can update submissions (for manual review)
CREATE POLICY "Admins can update submissions"
ON public.match_submissions
FOR UPDATE
USING (public.is_admin());

-- Tournament admins can view submissions for their tournaments
CREATE POLICY "Tournament admins can view their tournament submissions"
ON public.match_submissions
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM arcade_tournaments t
  WHERE t.id = match_submissions.tournament_id
  AND t.admin_id = auth.uid()
));

-- Trigger for updated_at
CREATE TRIGGER update_match_submissions_updated_at
BEFORE UPDATE ON public.match_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Support tickets table
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  wallet_address TEXT,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'tournament', 'payout', 'wallet', 'pass', 'bug', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  ai_summary TEXT,
  admin_notes TEXT,
  resolved_by UUID,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_user ON public.support_tickets(user_id);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Users can create tickets
CREATE POLICY "Users can create support tickets"
ON public.support_tickets
FOR INSERT
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets
FOR SELECT
USING (auth.uid() = user_id);

-- Admins can manage all tickets
CREATE POLICY "Admins can manage all tickets"
ON public.support_tickets
FOR ALL
USING (public.is_admin());

-- Trigger for updated_at
CREATE TRIGGER update_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for proof screenshots
INSERT INTO storage.buckets (id, name, public) 
VALUES ('match-proofs', 'match-proofs', false);

-- Users can upload their own proofs
CREATE POLICY "Users can upload match proofs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'match-proofs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can view their own proofs
CREATE POLICY "Users can view their own proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'match-proofs' AND (auth.uid()::text = (storage.foldername(name))[1] OR public.is_admin()));
