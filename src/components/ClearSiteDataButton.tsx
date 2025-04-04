
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

      // Note: We're not clearing cookies as requested

      // Show success toast
      toast.success("Data cleared successfully", {
        description: "Reloading page..."
      });

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Error clearing site data:', error);
      toast.error("Error clearing data", {
        description: "Please try again"
      });
    }
  };
  
  return (
    <Button onClick={clearSiteData} variant="outline" size="icon" className="h-10 w-10">
      <RefreshCw size={16} />
    </Button>
  );
};

export default ClearSiteDataButton;
