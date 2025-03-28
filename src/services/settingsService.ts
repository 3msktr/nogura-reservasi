
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  id?: string;
  clock_color?: string;
  clock_size?: number;
  clock_font_size?: number;
  tagline_text?: string;
  updated_at?: string;
}

export const getSettings = async (): Promise<SiteSettings> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error) {
    console.error('Error fetching settings:', error);
    return {
      clock_color: 'text-muted-foreground',
      clock_size: 18,
      clock_font_size: 16,
      tagline_text: 'Halal Artisan Ramen. Crafted from Scratch, Served in a Bowl.'
    };
  }
  
  return data || {
    clock_color: 'text-muted-foreground',
    clock_size: 18,
    clock_font_size: 16,
    tagline_text: 'Halal Artisan Ramen. Crafted from Scratch, Served in a Bowl.'
  };
};

export const updateSettings = async (settings: SiteSettings): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Updating settings with:', settings);
    
    // Ensure we have a default ID if none is provided
    const settingsToUpdate = {
      id: settings.id || 'default', 
      clock_color: settings.clock_color,
      clock_size: settings.clock_size,
      clock_font_size: settings.clock_font_size,
      tagline_text: settings.tagline_text,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('site_settings')
      .upsert(settingsToUpdate)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating settings:', error);
      return { success: false, error: error.message };
    }
    
    console.log('Settings updated successfully:', data);
    return { success: true };
  } catch (error: any) {
    console.error('Unexpected error updating settings:', error);
    return { success: false, error: error.message };
  }
};
