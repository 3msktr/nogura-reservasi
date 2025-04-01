export const clearAppCache = async () => {
  // Clear application cache
  if ('caches' in window) {
    const cacheKeys = await caches.keys();
    await Promise.all(cacheKeys.map(key => caches.delete(key)));
  }

  // Clear local storage
  localStorage.clear();

  // Clear session storage
  sessionStorage.clear();
};

export const setupCacheInvalidation = () => {
  const BUILD_ID = process.env.NEXT_PUBLIC_BUILD_ID || Date.now().toString();
  const CACHE_KEY = 'app_version';

  const storedVersion = localStorage.getItem(CACHE_KEY);
  
  if (storedVersion !== BUILD_ID) {
    clearAppCache().then(() => {
      localStorage.setItem(CACHE_KEY, BUILD_ID);
      window.location.reload(true);
    });
  }
};