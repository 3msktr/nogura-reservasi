
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
