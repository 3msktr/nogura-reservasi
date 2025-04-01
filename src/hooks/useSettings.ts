
import { useState, useEffect, useCallback } from 'react';
import { getSettings, updateSettings, SiteSettings } from '@/services/settingsService';
import { getFromCache, setInCache, removeFromCache, clearAllCache, CACHE_KEYS, invalidateAllCaches } from '@/utils/cacheUtils';
import { toast } from 'sonner';

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

  const fetchSettings = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    
    // Try to get settings from cache first, unless forceRefresh is true
    if (!forceRefresh) {
      const cachedSettings = getFromCache<SiteSettings>(CACHE_KEYS.SETTINGS);
      
      if (cachedSettings) {
        console.log('Using cached settings data');
        setSettings(cachedSettings);
        setIsLoading(false);
        return;
      }
    } else {
      console.log('Force refreshing settings data');
    }
    
    try {
      // If not in cache, forceRefresh is true, or expired, fetch from API
      const data = await getSettings();
      setSettings(data);
      
      // Cache the settings for 5 minutes
      setInCache(CACHE_KEYS.SETTINGS, data, 5);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
      setIsLoading(false);
    }
  }, []);

  // Function to force a refresh of the settings
  const refreshSettings = useCallback(() => {
    invalidateAllCaches();
    return fetchSettings(true);
  }, [fetchSettings]);

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
        setInCache(CACHE_KEYS.SETTINGS, newSettings, 5);
        
        // Clear all caches after settings update to ensure fresh data
        clearAllCache();
        
        toast.success('Settings saved successfully');
      }
      
      return result;
    } catch (error: any) {
      console.error('Error saving settings:', error);
      return { success: false, error: error.message };
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    isLoading,
    saveSettings,
    refreshSettings
  };
};
