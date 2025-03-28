
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
  clock_color?: string;
  clock_size?: number;
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
  
  // Create a properly typed parsed data object
  let parsedData: SiteSettings = { 
    id: data.id,
    tagline_text: data.tagline_text,
    how_it_works_title: data.how_it_works_title,
    how_it_works_description: data.how_it_works_description,
    clock_color: data.clock_color,
    clock_size: data.clock_size,
    updated_at: data.updated_at
  };
  
  // Handle how_it_works_steps with proper type conversion based on what we might receive
  if (data.how_it_works_steps) {
    try {
      // If it's already an array of objects with the right structure, use it directly
      if (Array.isArray(data.how_it_works_steps) && 
          data.how_it_works_steps.length > 0 && 
          typeof data.how_it_works_steps[0] === 'object' &&
          'title' in data.how_it_works_steps[0] &&
          'description' in data.how_it_works_steps[0]) {
        parsedData.how_it_works_steps = data.how_it_works_steps as Array<{title: string; description: string}>;
      } 
      // If it's a string (JSON), parse it
      else if (typeof data.how_it_works_steps === 'string') {
        const parsed = JSON.parse(data.how_it_works_steps);
        if (Array.isArray(parsed)) {
          parsedData.how_it_works_steps = parsed as Array<{title: string; description: string}>;
        }
      }
      // If it's an object but not an array (from JSONB column)
      else if (typeof data.how_it_works_steps === 'object' && !Array.isArray(data.how_it_works_steps)) {
        // Some databases might return JSONB in various formats
        // Try to convert any format into our expected array format
        if ('steps' in data.how_it_works_steps) {
          parsedData.how_it_works_steps = (data.how_it_works_steps as any).steps;
        } else {
          // Convert object to array if possible
          const steps = Object.values(data.how_it_works_steps);
          if (steps.length > 0 && typeof steps[0] === 'object') {
            parsedData.how_it_works_steps = steps as Array<{title: string; description: string}>;
          }
        }
      }
    } catch (e) {
      console.error('Error parsing how_it_works_steps:', e);
      parsedData.how_it_works_steps = [];
    }
  }
  
  // Fallback if parsing failed or how_it_works_steps is missing or empty
  if (!parsedData.how_it_works_steps || parsedData.how_it_works_steps.length === 0) {
    parsedData.how_it_works_steps = [
      { title: 'Watch the Timer', description: 'Monitor the countdown timer to know exactly when reservations will open.' },
      { title: 'Select Your Session', description: 'Choose your preferred time slot from the available sessions.' },
      { title: 'Confirm Your Seats', description: 'Quickly secure your reservation before all seats are taken.' }
    ];
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
      clock_color: settings.clock_color,
      clock_size: settings.clock_size,
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
