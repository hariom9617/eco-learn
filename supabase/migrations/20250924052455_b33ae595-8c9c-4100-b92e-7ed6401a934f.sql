-- Fix the difficulty constraint to match the form values
ALTER TABLE eco_quests DROP CONSTRAINT eco_quests_difficulty_check;
ALTER TABLE eco_quests ADD CONSTRAINT eco_quests_difficulty_check CHECK (difficulty IN ('Easy', 'Medium', 'Hard'));

-- Create separate teachers table
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on teachers table
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

-- Create policies for teachers table
CREATE POLICY "Teachers are viewable by everyone" 
ON public.teachers 
FOR SELECT 
USING (true);

CREATE POLICY "Teachers can update their own profile" 
ON public.teachers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can insert their own profile" 
ON public.teachers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for timestamps on teachers table
CREATE TRIGGER update_teachers_updated_at
BEFORE UPDATE ON public.teachers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the handle_new_user function to create appropriate profile based on role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF COALESCE(NEW.raw_user_meta_data->>'role', 'student') = 'teacher' THEN
    INSERT INTO public.teachers (user_id, display_name)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email)
    );
  ELSE
    INSERT INTO public.profiles (user_id, display_name, role)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      'student'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Enable realtime for profiles table (for leaderboard updates)
ALTER TABLE profiles REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE profiles;

-- Enable realtime for eco_quests table (for quest notifications)
ALTER TABLE eco_quests REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE eco_quests;