
import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/lib/types';
import { getEvents } from '@/services/eventService';
import { getFromCache, setInCache, clearAllCache, CACHE_KEYS, invalidateAllCaches } from '@/utils/cacheUtils';
import { toast } from 'sonner';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEvents = useCallback(async (forceRefresh = false) => {
    // Always show loading indicator briefly when force refreshing
    // This provides visual feedback even when using cached data
    if (forceRefresh) {
      setIsLoading(true);
    }
    
    // Try to get events from cache first, unless forceRefresh is true
    if (!forceRefresh) {
      const cachedEvents = getFromCache<Event[]>(CACHE_KEYS.EVENTS);
      
      if (cachedEvents) {
        console.log('Using cached events data');
        setEvents(cachedEvents);
        setIsLoading(false);
        return;
      }
    } else {
      console.log('Force refreshing events data');
    }
    
    try {
      // If not in cache, forceRefresh is true, or cache expired, fetch from API
      const data = await getEvents();
      setEvents(data);
      
      // Cache the events for 1 minute (shorter time because event data changes more frequently)
      setInCache(CACHE_KEYS.EVENTS, data, 1);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events. Please try refreshing the page.');
      setIsLoading(false);
    }
  }, []);

  // Function to force a refresh of the data
  const refreshEvents = useCallback(() => {
    // Invalidate the events cache before fetching
    invalidateAllCaches();
    return fetchEvents(true);
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
    
    // Set up a polling mechanism to check for new events every 30 seconds
    const intervalId = setInterval(() => {
      fetchEvents(true);
    }, 30000); // 30 seconds
    
    return () => clearInterval(intervalId);
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    refreshEvents
  };
};
