import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Quiz = Database['public']['Tables']['quizzes']['Row'];
type QuizForStudent = Omit<Quiz, 'correct_answer'>;

/**
 * Safely fetch quiz data based on user role
 * - Students: Get quiz questions without answers
 * - Teachers: Get complete quiz data including answers
 */
export async function fetchQuizzes(courseId?: string) {
  try {
    // Check if user is a teacher
    const { data: teacherData } = await supabase
      .from('teachers')
      .select('user_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
      .maybeSingle();

    const isTeacher = !!teacherData;

    // Build query
    let query = supabase.from('quizzes').select('*');
    
    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data: quizzes, error } = await query;

    if (error) {
      throw error;
    }

    // Filter out sensitive data for students
    if (!isTeacher && quizzes) {
      return quizzes.map(quiz => {
        const { correct_answer, ...safeQuiz } = quiz;
        return safeQuiz as QuizForStudent;
      });
    }

    return quizzes || [];
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    throw error;
  }
}

/**
 * Fetch a single quiz with role-based filtering
 */
export async function fetchQuizById(quizId: string) {
  try {
    // Check if user is a teacher
    const { data: teacherData } = await supabase
      .from('teachers')
      .select('user_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
      .maybeSingle();

    const isTeacher = !!teacherData;

    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select('*')
      .eq('id', quizId)
      .single();

    if (error) {
      throw error;
    }

    // Filter out sensitive data for students
    if (!isTeacher && quiz) {
      const { correct_answer, ...safeQuiz } = quiz;
      return safeQuiz as QuizForStudent;
    }

    return quiz;
  } catch (error) {
    console.error('Error fetching quiz:', error);
    throw error;
  }
}

/**
 * Submit a quiz attempt (students only)
 */
export async function submitQuizAttempt(
  quizId: string,
  selectedAnswer: number,
  correctAnswer: number
) {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) {
      throw new Error('User not authenticated');
    }

    // Check if user is a student (not a teacher)
    const { data: teacherData } = await supabase
      .from('teachers')
      .select('user_id')
      .eq('user_id', user.data.user.id)
      .maybeSingle();

    if (teacherData) {
      throw new Error('Teachers cannot submit quiz attempts');
    }

    const isCorrect = selectedAnswer === correctAnswer;
    
    // Get quiz points
    const { data: quiz } = await supabase
      .from('quizzes')
      .select('points_reward')
      .eq('id', quizId)
      .single();

    const pointsEarned = isCorrect ? (quiz?.points_reward || 0) : 0;

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert({
        quiz_id: quizId,
        user_id: user.data.user.id,
        selected_answer: selectedAnswer,
        is_correct: isCorrect,
        points_earned: pointsEarned
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Update user points if correct
    if (isCorrect && pointsEarned > 0) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('points')
        .eq('user_id', user.data.user.id)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ points: profile.points + pointsEarned })
          .eq('user_id', user.data.user.id);
      }
    }

    return {
      ...data,
      is_correct: isCorrect,
      points_earned: pointsEarned
    };
  } catch (error) {
    console.error('Error submitting quiz attempt:', error);
    throw error;
  }
}

/**
 * Check if current user is a teacher
 */
export async function isCurrentUserTeacher(): Promise<boolean> {
  try {
    const user = await supabase.auth.getUser();
    if (!user.data.user) return false;

    const { data: teacherData } = await supabase
      .from('teachers')
      .select('user_id')
      .eq('user_id', user.data.user.id)
      .maybeSingle();

    return !!teacherData;
  } catch (error) {
    console.error('Error checking teacher status:', error);
    return false;
  }
}

export type { Quiz, QuizForStudent };