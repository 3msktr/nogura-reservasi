
import { supabase } from '@/integrations/supabase/client';

/**
 * Set admin status for a user
 * This function should only be used by system administrators
 */
export const setUserAdminStatus = async (userId: string, isAdmin: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('set_admin_status', {
      user_id: userId,
      admin_status: isAdmin
    });

    if (error) {
      console.error('Error setting admin status:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error setting admin status:', err);
    return false;
  }
};

/**
 * Check if any users exist in the system
 * Used to determine if the first user should be made an admin
 */
export const checkIfFirstUser = async (): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking user count:', error);
      return false;
    }
    
    return count === 0;
  } catch (err) {
    console.error('Unexpected error checking user count:', err);
    return false;
  }
};
