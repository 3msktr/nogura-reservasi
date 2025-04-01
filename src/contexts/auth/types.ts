
import { Session, User } from '@supabase/supabase-js';

export type Profile = {
  id: string;
  full_name: string | null;
  is_admin: boolean;
  phone_number: string | null;
};

export type AuthContextType = {
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
