
import { useState, useEffect } from 'react';
import { getSettings, updateSettings, SiteSettings } from '@/services/settingsService';

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    clock_color: 'text-muted-foreground',
    clock_size: 18,
    clock_font_size: 16,
    tagline_text: 'Halal Artisan Ramen. Crafted from Scratch, Served in a Bowl.',
    how_it_works_title: 'How It Works',
    how_it_works_description: 'Our unique war ticket reservation system ensures everyone has a fair chance to secure their seats.',
    how_it_works_steps: [
      { title: 'Watch the Timer', description: 'Monitor the countdown timer to know exactly when reservations will open.' },
      { title: 'Select Your Session', description: 'Choose your preferred time slot from the available sessions.' },
      { title: 'Confirm Your Seats', description: 'Quickly secure your reservation before all seats are taken.' }
    ]
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      const data = await getSettings();
      setSettings(data);
      setIsLoading(false);
    };

    fetchSettings();
  }, []);

  const saveSettings = async (updatedSettings: SiteSettings): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await updateSettings({
        ...settings,
        ...updatedSettings
      });
      
      if (result.success) {
        setSettings(prev => ({ ...prev, ...updatedSettings }));
      }
      
      return result;
    } catch (error: any) {
      console.error('Error saving settings:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    settings,
    isLoading,
    saveSettings
  };
};
