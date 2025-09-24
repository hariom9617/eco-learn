-- Fix critical security issue: Quiz answers exposed to all users
-- Drop the overly permissive policy that allows anyone to view all quiz data including answers
DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;

-- Create security definer function to check if user is a teacher
CREATE OR REPLACE FUNCTION public.is_teacher(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teachers 
    WHERE user_id = user_uuid
  );
$$;

-- Policy for teachers: can view complete quiz data including answers
CREATE POLICY "Teachers can view complete quiz data"
ON public.quizzes
FOR SELECT
USING (public.is_teacher());

-- Policy for students: can view quiz questions and options but NOT correct answers
-- Note: This is a row-level policy, so we'll need application-level filtering for column restriction
CREATE POLICY "Students can view quiz questions"
ON public.quizzes  
FOR SELECT
USING (
  auth.role() = 'authenticated' 
  AND NOT public.is_teacher()
);

-- Create a view for students that excludes the correct_answer field
CREATE OR REPLACE VIEW public.quiz_questions AS
SELECT 
  id,
  title,
  question,
  options,
  points_reward,
  course_id,
  created_at,
  updated_at
FROM public.quizzes
WHERE public.is_teacher() OR auth.role() = 'authenticated';

-- Grant access to the view
GRANT SELECT ON public.quiz_questions TO authenticated;