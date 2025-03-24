
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
    
    // For authenticated users, we'll try to get their auth data
    // This will include email information
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    
    // Then, attempt to fetch all users from the auth API
    // This might succeed if we have admin privileges
    const { data: usersList, error: usersListError } = await supabase.auth.admin.listUsers();
    
    let userEmails: Record<string, string> = {};
    
    if (usersListError || !usersList?.users) {
      console.warn('Using alternative method to get user emails due to admin API limitations');
      
      // If we can't get the list of all users, at least we can get the current user's email
      if (currentUser) {
        userEmails[currentUser.id] = currentUser.email || '';
      }
      
      // For other users, attempt to get their emails from a public view if available
      // Or fall back to placeholder emails
      const { data: publicUserEmails, error: publicEmailsError } = await supabase
        .from('public_user_emails')
        .select('user_id, email');
        
      if (!publicEmailsError && publicUserEmails) {
        publicUserEmails.forEach(item => {
          userEmails[item.user_id] = item.email;
        });
      }
      
      // For any remaining users without emails, use placeholders
      profiles.forEach(profile => {
        if (!userEmails[profile.id]) {
          userEmails[profile.id] = `user-${profile.id.substring(0, 8)}@example.com`;
        }
      });
    } else {
      // If admin API succeeded, map user IDs to emails
      usersList.users.forEach(user => {
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
  try {
    // First check if user exists before attempting to delete
    const { data: profile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (checkError) {
      console.error('Error checking user existence:', checkError);
      throw new Error('User not found');
    }
    
    // Delete the user's profile
    const { error: deleteError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Error deleting user profile:', deleteError);
      throw deleteError;
    }
    
    // Note: We can't directly delete from auth.users as it requires admin privileges
    // This would need to be handled by a Supabase Edge Function or a custom server
    console.log('User profile deleted successfully. Note: The auth record may still exist.');
  } catch (error) {
    console.error('Error in deleteUser function:', error);
    throw error;
  }
};
