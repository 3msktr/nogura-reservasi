import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { checkIfFirstUser, setUserAdminStatus } from '@/utils/adminUtils';
import { removeFromCache, CACHE_KEYS } from '@/utils/cacheUtils';

type Profile = {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  phone_number: string | null;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.id);
        
        if (event === 'SIGNED_OUT') {
          console.log('Signing out - clearing all user cache');
          clearAllUserCache();
          setSession(null);
          setUser(null);
          setProfile(null);
        } else {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
          
          if (currentSession?.user) {
            await fetchProfile(currentSession.user.id);
          } else {
            setProfile(null);
          }
        }
      }
    );

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

  const clearAllUserCache = () => {
    Object.values(CACHE_KEYS).forEach(key => {
      removeFromCache(key);
    });
    
    try {
      localStorage.removeItem('supabase.auth.token');
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('supabase') || key.includes('user') || key.includes('cache'))) {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  };

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

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
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
      
      clearAllUserCache();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        throw error;
      }

      console.log('Sign in successful for user:', data.user?.id);
      
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
      const isFirstUser = await checkIfFirstUser();
      
      console.log("Starting Google sign-in process...");
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            prompt: 'select_account',
            access_type: 'offline',
            hd: 'domain.com',
          },
        },
      });

      if (error) {
        console.error("Google OAuth error details:", error);
        throw error;
      }

      console.log('Google sign in initiated, redirect URL:', data.url);
    } catch (error: any) {
      console.error('Google sign in error details:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out - clearing cache and session data');
      
      clearAllUserCache();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      setProfile(null);
      setUser(null);
      setSession(null);
      
      toast.info('Logged out successfully');
      navigate('/');
    } catch (error: any) {
      console.error('Error during sign out:', error);
      toast.error(error.message || 'Error signing out');
    }
  };

  const isAdmin = !!profile?.is_admin;

  const value = {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
