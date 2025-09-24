-- Fix RLS so teachers (from teachers table) can create eco quests and notifications
-- Eco quests: replace INSERT policy to reference public.teachers instead of profiles
DROP POLICY IF EXISTS "Teachers can create eco-quests" ON public.eco_quests;

CREATE POLICY "Teachers can create eco-quests"
ON public.eco_quests
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
  )
);

-- Notifications: replace INSERT policy to reference public.teachers instead of profiles
DROP POLICY IF EXISTS "Teachers can create notifications" ON public.notifications;

CREATE POLICY "Teachers can create notifications"
ON public.notifications
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.teachers t
    WHERE t.user_id = auth.uid()
  )
);
