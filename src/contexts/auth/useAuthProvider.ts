
import { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { checkIfFirstUser, setUserAdminStatus } from '@/utils/adminUtils';
import { Profile } from './types';

export const useAuthProvider = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }

      console.log('Profile data retrieved:', data);
      setProfile(data as Profile);
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      setProfile(null);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        } else {
          setProfile(null);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          await fetchProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Check if this is the first user
      const isFirstUser = await checkIfFirstUser();
      console.log('Is first user:', isFirstUser);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        throw error;
      }

      // If this is the first user, make them an admin
      if (isFirstUser && data.user) {
        await setUserAdminStatus(data.user.id, true);
      }

      toast.success('Sign up successful! Please check your email to confirm your account.');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful for user:', data.user?.id);
      
      // Always fetch profile after successful sign in to ensure we have the latest data
      if (data.user) {
        await fetchProfile(data.user.id);
      }

      toast.success('Logged in successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Login error details:', error);
      toast.error(error.message || 'Invalid login credentials');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Check if this is the first user (for admin privileges)
      const isFirstUser = await checkIfFirstUser();
      
      console.log("Starting Google sign-in process...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error("Google OAuth error details:", error);
        
        // Provide more specific error messages based on the error code
        if (error.message.includes("invalid_client")) {
          toast.error("OAuth configuration error. Please verify your Google client ID and secret in Supabase.");
        } else {
          toast.error(error.message || 'Error signing in with Google');
        }
        
        throw error;
      }

      // Note: We can't directly set admin status here because the user isn't created yet
      // This happens after OAuth redirect, so we'll handle it in the auth state change listener
      console.log('Google sign in initiated, redirect URL:', data.url);
      
      // User will be redirected to Google login
      // After successful authentication, they'll be redirected back to our app
      // and the onAuthStateChange event will trigger
    } catch (error: any) {
      console.error('Google sign in error details:', error);
      toast.error(error.message || 'Error signing in with Google');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setProfile(null);
      toast.info('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Error signing out');
    }
  };

  const isAdmin = !!profile?.is_admin;

  return {
    session,
    user,
    profile,
    isLoading,
    isAdmin,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
  };
};
