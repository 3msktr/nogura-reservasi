
import { useState, useEffect } from 'react';
import { getSettings, updateSettings, SiteSettings } from '@/services/settingsService';
import { getFromCache, setInCache, removeFromCache, CACHE_KEYS } from '@/utils/cacheUtils';

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
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
      
      // Always fetch fresh settings instead of using cache
      removeFromCache(CACHE_KEYS.SETTINGS);
      
      // If not in cache or expired, fetch from API
      const data = await getSettings();
      setSettings(data);
      
      // Cache the settings for a very short time (5 minutes)
      setInCache(CACHE_KEYS.SETTINGS, data, 5);
      
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
        const newSettings = { ...settings, ...updatedSettings };
        setSettings(newSettings);
        
        // Update cache with new settings
        removeFromCache(CACHE_KEYS.SETTINGS); // Clear old cache
        setInCache(CACHE_KEYS.SETTINGS, newSettings, 5);
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
