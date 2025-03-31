
import { useState, useEffect } from 'react';
import { Event } from '@/lib/types';
import { getEvents } from '@/services/eventService';
import { getFromCache, setInCache, CACHE_KEYS } from '@/utils/cacheUtils';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      
      // Try to get events from cache first
      const cachedEvents = getFromCache<Event[]>(CACHE_KEYS.EVENTS);
      
      if (cachedEvents) {
        setEvents(cachedEvents);
        setIsLoading(false);
        return;
      }
      
      // If not in cache or expired, fetch from API
      const data = await getEvents();
      setEvents(data);
      
      // Cache the events for 5 minutes (shorter time because event data changes more frequently)
      setInCache(CACHE_KEYS.EVENTS, data, 5);
      
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  return {
    events,
    isLoading
  };
};
