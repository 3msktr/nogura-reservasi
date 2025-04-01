
interface CacheItem<T> {
  data: T;
  expiry: number;
  version: string; // Add version tracking to cache items
}

// Cache version - will be updated whenever we need to invalidate all caches
let CACHE_VERSION = Date.now().toString();

/**
 * Checks if a cached item is still valid based on its expiry time and version
 */
const isCacheValid = <T>(key: string): boolean => {
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return false;
    
    const parsedData = JSON.parse(cachedData) as CacheItem<T>;
    
    // Check both expiry time and version
    return parsedData.expiry > Date.now() && parsedData.version === CACHE_VERSION;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
};

/**
 * Gets data from cache if it exists and is valid
 * @returns The cached data or null if not found or expired
 */
export const getFromCache = <T>(key: string): T | null => {
  try {
    if (!isCacheValid<T>(key)) {
      return null;
    }
    
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;
    
    const parsedData = JSON.parse(cachedData) as CacheItem<T>;
    return parsedData.data;
  } catch (error) {
    console.error('Error getting from cache:', error);
    return null;
  }
};

/**
 * Stores data in cache with an expiry time
 * @param expiryMinutes How long the cache should be valid for in minutes
 */
export const setInCache = <T>(key: string, data: T, expiryMinutes: number): void => {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      expiry: Date.now() + (expiryMinutes * 60 * 1000),
      version: CACHE_VERSION
    };
    
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

/**
 * Removes an item from cache
 */
export const removeFromCache = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from cache:', error);
  }
};

/**
 * Invalidates multiple cache entries by prefix
 */
export const invalidateCacheByPrefix = (prefix: string): void => {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error invalidating cache:', error);
  }
};

/**
 * Invalidates all cache entries by updating the cache version
 * This is more efficient than actually removing items from localStorage
 */
export const invalidateAllCaches = (): void => {
  CACHE_VERSION = Date.now().toString();
  console.log('All caches invalidated with new version:', CACHE_VERSION);
};

/**
 * Clears all cache entries managed by our application
 */
export const clearAllCache = (): void => {
  try {
    // Update cache version to invalidate all future reads
    invalidateAllCaches();
    
    // Also remove items from localStorage to free up space
    Object.keys(CACHE_KEYS).forEach(key => {
      const cacheKey = CACHE_KEYS[key as keyof typeof CACHE_KEYS];
      if (typeof cacheKey === 'string') {
        // Check if it's a prefix key (ends with underscore)
        if (cacheKey.endsWith('_')) {
          // If it's a prefix key, use invalidateCacheByPrefix
          invalidateCacheByPrefix(cacheKey);
        } else {
          // If it's a simple key, remove it directly
          localStorage.removeItem(cacheKey);
        }
      }
    });
  } catch (error) {
    console.error('Error clearing all cache:', error);
  }
};

// Cache key constants for different types of data
export const CACHE_KEYS = {
  EVENTS: 'cache_events',
  EVENT_DETAILS: 'cache_event_',  // Will be used as prefix: cache_event_[eventId]
  SETTINGS: 'cache_settings',
  USER_RESERVATIONS: 'cache_user_reservations'
};

/**
 * Force reload current page bypassing the cache
 */
export const forcePageReload = (): void => {
  window.location.reload();
};

/**
 * Helper function to append cache busting query param to URLs
 */
export const addCacheBustParam = (url: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${Date.now()}`;
};
