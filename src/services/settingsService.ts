
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  id?: string;
  tagline_text?: string;
  how_it_works_title?: string;
  how_it_works_description?: string;
  how_it_works_steps?: Array<{
    title: string;
    description: string;
  }>;
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
      tagline_text: 'Halal Artisan Ramen. Crafted from Scratch, Served in a Bowl.',
      how_it_works_title: 'How It Works',
      how_it_works_description: 'Our unique war ticket reservation system ensures everyone has a fair chance to secure their seats.',
      how_it_works_steps: [
        { title: 'Watch the Timer', description: 'Monitor the countdown timer to know exactly when reservations will open.' },
        { title: 'Select Your Session', description: 'Choose your preferred time slot from the available sessions.' },
        { title: 'Confirm Your Seats', description: 'Quickly secure your reservation before all seats are taken.' }
      ]
    };
  }
  
  // Ensure how_it_works_steps is properly parsed as an array of objects
  let parsedData: SiteSettings = { ...data };
  
  // Parse how_it_works_steps if it's a string or JSON object
  if (data.how_it_works_steps) {
    try {
      // If it's already an array, use it directly
      if (Array.isArray(data.how_it_works_steps)) {
        parsedData.how_it_works_steps = data.how_it_works_steps;
      } 
      // If it's a string (JSON), parse it
      else if (typeof data.how_it_works_steps === 'string') {
        parsedData.how_it_works_steps = JSON.parse(data.how_it_works_steps);
      }
      // If it's an object but not an array (from JSONB column)
      else if (typeof data.how_it_works_steps === 'object') {
        // Some databases return JSONB as an object directly
        parsedData.how_it_works_steps = data.how_it_works_steps;
      }
    } catch (e) {
      console.error('Error parsing how_it_works_steps:', e);
      parsedData.how_it_works_steps = [];
    }
  }
  
  return parsedData;
};

export const updateSettings = async (settings: SiteSettings): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Updating settings with:', settings);
    
    // Ensure we have a default ID if none is provided
    const settingsToUpdate = {
      id: settings.id || 'default', 
      tagline_text: settings.tagline_text,
      how_it_works_title: settings.how_it_works_title,
      how_it_works_description: settings.how_it_works_description,
      how_it_works_steps: settings.how_it_works_steps,
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
