import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  points: number;
  streak: number;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: 'student' | 'teacher') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  updateUserPoints: (points: number) => void;
  updateUserStreak: (streak: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        // Use setTimeout to defer the profile loading to avoid auth state callback deadlock
        setTimeout(() => {
          loadUserProfile(session.user);
        }, 0);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      // Try to load from students table first
      const { data: studentProfile, error: studentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (studentProfile && !studentError) {
        setUser({
          id: studentProfile.user_id,
          name: studentProfile.display_name,
          email: supabaseUser.email || '',
          role: 'student',
          points: studentProfile.points,
          streak: studentProfile.streak,
          avatar: studentProfile.avatar_url || '👨‍🎓'
        });
        setLoading(false);
        return;
      }

      // If not found in students, try teachers table
      const { data: teacherProfile, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', supabaseUser.id)
        .maybeSingle();

      if (teacherProfile && !teacherError) {
        setUser({
          id: teacherProfile.user_id,
          name: teacherProfile.display_name,
          email: supabaseUser.email || '',
          role: 'teacher',
          points: 0, // Teachers don't have points
          streak: 0, // Teachers don't have streaks
          avatar: teacherProfile.avatar_url || '👩‍🏫'
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
    setLoading(false);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return false;
      }

      if (data.user) {
        toast({
          title: "Welcome back! 🌱",
          description: "Successfully logged in",
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
    
    setLoading(false);
    return false;
  };

  const signup = async (name: string, email: string, password: string, role: 'student' | 'teacher'): Promise<boolean> => {
    setLoading(true);
    
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: name,
            role: role
          }
        }
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive"
        });
        setLoading(false);
        return false;
      }

      if (data.user) {
        toast({
          title: "Welcome to EcoLearn! 🎉",
          description: `Account created successfully as ${role}. Please check your email to verify your account.`,
        });
        return true;
      }
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
    
    setLoading(false);
    return false;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast({
      title: "Logged out",
      description: "See you next time! 🌍",
    });
  };

  const updateUserPoints = async (points: number) => {
    if (user && user.role === 'student') {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ points })
          .eq('user_id', user.id);

        if (!error) {
          setUser({ ...user, points });
        }
      } catch (error) {
        console.error('Error updating points:', error);
      }
    }
  };

  const updateUserStreak = async (streak: number) => {
    if (user && user.role === 'student') {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ streak })
          .eq('user_id', user.id);

        if (!error) {
          setUser({ ...user, streak });
        }
      } catch (error) {
        console.error('Error updating streak:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      signup,
      logout,
      loading,
      updateUserPoints,
      updateUserStreak
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};