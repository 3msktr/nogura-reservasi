
interface CacheItem<T> {
  data: T;
  expiry: number;
}

/**
 * Checks if a cached item is still valid based on its expiry time
 */
const isCacheValid = <T>(key: string): boolean => {
  try {
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return false;
    
    const parsedData = JSON.parse(cachedData) as CacheItem<T>;
    return parsedData.expiry > Date.now();
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
      expiry: Date.now() + (expiryMinutes * 60 * 1000)
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

// Cache key constants for different types of data
export const CACHE_KEYS = {
  EVENTS: 'cache_events',
  EVENT_DETAILS: 'cache_event_',  // Will be used as prefix: cache_event_[eventId]
  SETTINGS: 'cache_settings',
  USER_RESERVATIONS: 'cache_user_reservations'
};
