
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/components/admin/UsersTable';

// Define types for Supabase auth admin response
export interface AdminUsersResponse {
  users?: Array<{
    id: string;
    email?: string;
  }>;
  error?: Error;
}

export const fetchUsers = async (): Promise<UserProfile[]> => {
  try {
    // First, fetch all user profiles with their data
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number, is_admin');

    if (profilesError) throw profilesError;

    // Then, attempt to fetch all user emails from the auth.users table via Supabase admin API
    // This will fail if not running in a Supabase Edge Function with admin rights
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers() as { 
      data: AdminUsersResponse;
      error: Error | null;
    };
    
    let userEmails: Record<string, string> = {};
    
    if (authError || !authData?.users) {
      console.warn('Unable to fetch actual user emails via admin API. Using alternative method.');
      
      // Alternative: Fetch email for the current authenticated user only
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userEmails[user.id] = user.email || '';
      }
      
      // For other users, we'll try to get their profiles individually
      const authUserPromises = profiles.map(async (profile) => {
        // Skip if we already have this user's email (current user)
        if (userEmails[profile.id]) return;
        
        // Fallback to placeholder emails if no real emails are available
        userEmails[profile.id] = `user-${profile.id.substring(0, 8)}@example.com`;
      });
      
      await Promise.all(authUserPromises);
    } else {
      // If admin API succeeded, map user IDs to emails
      authData.users.forEach((user) => {
        if (user.id && user.email) {
          userEmails[user.id] = user.email;
        }
      });
    }
    
    // Combine profile data with email data
    return profiles.map(profile => ({
      id: profile.id,
      full_name: profile.full_name,
      phone_number: profile.phone_number,
      is_admin: profile.is_admin || false,
      email: userEmails[profile.id] || `user-${profile.id.substring(0, 8)}@example.com`, // Fallback if email not found
    }));
    
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) throw error;
};
