
/**
 * Utility to completely clear browser site data
 */

// Clear all caches
const clearCaches = async (): Promise<void> => {
  if ('caches' in window) {
    try {
      const cacheNames = await window.caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => window.caches.delete(cacheName))
      );
      console.log('All cache storage cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }
};

// Unregister service workers
const unregisterServiceWorkers = async (): Promise<void> => {
  if ('serviceWorker' in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => registration.unregister())
      );
      console.log('Service workers unregistered');
    } catch (error) {
      console.error('Failed to unregister service workers:', error);
    }
  }
};

// Clear storage (localStorage and sessionStorage)
const clearStorage = (): void => {
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('Local and session storage cleared');
  } catch (error) {
    console.error('Failed to clear storage:', error);
  }
};

// Clear cookies
const clearCookies = (): void => {
  try {
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    console.log('Cookies cleared');
  } catch (error) {
    console.error('Failed to clear cookies:', error);
  }
};

// Main function to clear all site data
export const clearAllSiteData = async (): Promise<void> => {
  await clearCaches();
  await unregisterServiceWorkers();
  clearStorage();
  clearCookies();
};
