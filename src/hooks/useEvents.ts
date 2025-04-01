
import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/lib/types';
import { getEvents } from '@/services/eventService';
import { getFromCache, setInCache, clearAllCache, CACHE_KEYS } from '@/utils/cacheUtils';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEvents = useCallback(async (forceRefresh = false) => {
    setIsLoading(true);
    
    // Try to get events from cache first, unless forceRefresh is true
    if (!forceRefresh) {
      const cachedEvents = getFromCache<Event[]>(CACHE_KEYS.EVENTS);
      
      if (cachedEvents) {
        setEvents(cachedEvents);
        setIsLoading(false);
        return;
      }
    }
    
    // If not in cache, forceRefresh is true, or cache expired, fetch from API
    const data = await getEvents();
    setEvents(data);
    
    // Cache the events for 2 minutes (shorter time because event data changes more frequently)
    setInCache(CACHE_KEYS.EVENTS, data, 2);
    
    setIsLoading(false);
  }, []);

  // Function to force a refresh of the data
  const refreshEvents = useCallback(() => {
    return fetchEvents(true);
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    refreshEvents
  };
};
