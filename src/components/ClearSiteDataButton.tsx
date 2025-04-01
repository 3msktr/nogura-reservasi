
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const ClearSiteDataButton: React.FC = () => {
  const clearSiteData = async () => {
    try {
      // 1. Unregister service worker
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }

      // 2. Clear local and session storage
      localStorage.clear();
      sessionStorage.clear();

      // 3. Clear cache storage
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(key => caches.delete(key)));
      }

      // Show success toast
      toast("Data cleared successfully", {
        description: "Reloading page..."
      });

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload(true);
      }, 1000);
    } catch (error) {
      console.error('Error clearing site data:', error);
      toast("Error clearing data", {
        description: "Please try again",
        variant: "destructive"
      });
    }
  };
  
  return (
    <Button onClick={clearSiteData} variant="outline" className="flex items-center gap-2 text-right">
      <RefreshCw size={16} />
      <span className="text-right">Reload Page</span>
    </Button>
  );
};

export default ClearSiteDataButton;
