
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/components/admin/UsersTable';

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
    
    // Try to fetch all users from the auth API (this may fail due to permissions)
    let userEmails: Record<string, string> = {};
    
    try {
      // Using the admin API to fetch user emails if possible
      const { data, error } = await supabase.auth.admin.listUsers();
      
      if (!error && data) {
        // If admin API succeeded, map user IDs to emails
        const users = data.users || [];
        users.forEach(user => {
          if (user && user.email) {
            userEmails[user.id] = user.email;
          }
        });
      }
    } catch (adminError) {
      console.warn('Admin API access failed:', adminError);
    }
    
    // If we couldn't get emails via admin API, at least add the current user's email
    if (Object.keys(userEmails).length === 0 && currentUser) {
      userEmails[currentUser.id] = currentUser.email || '';
    }
    
    // Combine profile data with email data (using fallbacks where needed)
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
