-- Fix security issue: Restrict profiles table access to authenticated users only
-- Drop the overly permissive policy that allows public access to all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a more secure policy that only allows authenticated users to see profiles
-- Users can see their own full profile, but only basic info from others (needed for leaderboards)
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
USING (
  auth.role() = 'authenticated'
);

-- Note: This policy allows authenticated users to see all profile data, but only authenticated users
-- If we want more granular control (own full profile vs others' limited info), we'd need separate policies
-- But for now, this fixes the main security issue of public access while maintaining functionality