
import { supabase } from '@/integrations/supabase/client';
import { MessageTemplate } from '@/lib/types';
import { toast } from 'sonner';

export const fetchTemplate = async (): Promise<MessageTemplate | null> => {
  try {
    // Fetch the main template (or first one if multiple exist)
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      toast.error('Failed to load message template');
      throw error;
    }

    if (!data) {
      // No template exists
      return null;
    }

    // Map the data to match our MessageTemplate type
    return {
      id: data.id,
      name: data.name,
      content: data.content,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error fetching template:', error);
    toast.error('Failed to load message template');
    throw error;
  }
};

export const fetchLatestTemplate = async (): Promise<MessageTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      content: data.content,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error fetching latest template:', error);
    return null;
  }
};

export const createTemplate = async (name: string, content: string): Promise<MessageTemplate | null> => {
  try {
    const { data, error } = await supabase
      .from('message_templates')
      .insert({
        name,
        content
      })
      .select()
      .single();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }
    
    toast.success('Template created successfully');
    
    if (data) {
      return {
        id: data.id,
        name: data.name,
        content: data.content,
        created_at: data.created_at
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error creating template:', error);
    throw error;
  }
};

export const updateTemplate = async (
  id: string, 
  updates: { name: string; content: string }
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('message_templates')
      .update({
        name: updates.name,
        content: updates.content
      })
      .eq('id', id);

    if (error) {
      console.error('Update error:', error);
      throw error;
    }
    
    toast.success('Template updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating template:', error);
    throw error;
  }
};

export const getDefaultTemplateContent = (): string => {
  return `Hello {guestName},

Your reservation for *{eventName}* has been confirmed!

🗓️ Date: {eventDate}
⏰ Time: {sessionTime}
👥 Seats: {seats}

Please arrive 15 minutes before your scheduled time. We look forward to seeing you!

Best regards,
The Event Team`;
};
