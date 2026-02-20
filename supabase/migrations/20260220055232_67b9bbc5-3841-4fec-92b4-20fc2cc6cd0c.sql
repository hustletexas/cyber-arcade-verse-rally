
-- Fix: Set the public_profiles view to SECURITY INVOKER (uses querying user's permissions)
ALTER VIEW public.public_profiles SET (security_invoker = on);
