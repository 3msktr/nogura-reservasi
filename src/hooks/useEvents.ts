
import { useState, useEffect } from 'react';
import { Event } from '@/lib/types';
import { getEvents } from '@/services/eventService';
import { getFromCache, setInCache, removeFromCache, CACHE_KEYS } from '@/utils/cacheUtils';
import { supabase } from '@/integrations/supabase/client';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Listen for auth state changes to clear cache when user logs out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing event cache');
        removeFromCache(CACHE_KEYS.EVENTS);
        // Clear any other user-specific caches
        Object.values(CACHE_KEYS).forEach(key => {
          if (typeof key === 'string' && 
              (key.includes('user') || key.startsWith(CACHE_KEYS.EVENT_DETAILS))) {
            removeFromCache(key);
          }
        });
      }
    });

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

    // Clean up subscription when component unmounts
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    events,
    isLoading
  };
};
