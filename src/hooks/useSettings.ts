
import { useState, useEffect } from 'react';
import { getSettings, SiteSettings } from '@/services/settingsService';

export const useSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    clock_color: 'text-muted-foreground',
    clock_size: 18,
    tagline_text: 'Halal Artisan Ramen. Crafted from Scratch, Served in a Bowl.'
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

  return {
    settings,
    isLoading
  };
};
