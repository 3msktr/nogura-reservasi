
import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/lib/types';
import { getEvents } from '@/services/eventService';
import { getFromCache, setInCache, removeFromCache, CACHE_KEYS, invalidateCacheByPrefix, clearAllCache } from '@/utils/cacheUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const clearEventCache = useCallback(() => {
    console.log('Clearing event cache');
    removeFromCache(CACHE_KEYS.EVENTS);
    invalidateCacheByPrefix(CACHE_KEYS.EVENT_DETAILS);
  }, []);

  const fetchEvents = useCallback(async (bypassCache = true) => { // Always bypass cache by default
    setIsLoading(true);
    
    try {
      // Only try to get events from cache if not bypassing
      const cachedEvents = !bypassCache ? getFromCache<Event[]>(CACHE_KEYS.EVENTS) : null;
      
      if (cachedEvents) {
        console.log('Using cached events data');
        setEvents(cachedEvents);
        setIsLoading(false);
        return;
      }
      
      console.log('Fetching fresh events data from API');
      // If not in cache or expired, fetch from API
      const data = await getEvents();
      
      if (!data || data.length === 0) {
        console.log('No events data received from API');
      } else {
        console.log(`Received ${data.length} events from API`);
      }
      
      setEvents(data);
      
      // Cache the events for a very short time (1 minute)
      setInCache(CACHE_KEYS.EVENTS, data, 1);
      setLastUpdated(Date.now());
      
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Force refetch events (for manual refresh)
  const refetchEvents = useCallback(() => {
    clearEventCache();
    return fetchEvents(true);
  }, [fetchEvents, clearEventCache]);

  useEffect(() => {
    // Initial fetch - always get fresh data
    fetchEvents(true);
    
    // Listen for auth state changes to clear cache when user logs out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, clearing all cache');
        clearAllCache(); // Clear all cache on sign out
      } else if (event === 'SIGNED_IN') {
        console.log('User signed in, refreshing data');
        refetchEvents(); // Refresh all data on sign in
      }
    });

    // Set up realtime subscription for events table changes with immediate refresh
    const channel = supabase
      .channel('events-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'events'
        },
        (payload) => {
          console.log('Events table changed:', payload.eventType);
          refetchEvents();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events
          schema: 'public',
          table: 'sessions'
        },
        (payload) => {
          console.log('Sessions table changed:', payload.eventType);
          refetchEvents();
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        // Do an immediate refresh when subscription is established
        if (status === 'SUBSCRIBED') {
          refetchEvents();
        }
      });

    // Set up a periodic refresh (every 30 seconds)
    const refreshInterval = setInterval(() => {
      console.log('Performing periodic refresh');
      refetchEvents();
    }, 30000);

    // Clean up subscriptions when component unmounts
    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(channel);
      clearInterval(refreshInterval);
    };
  }, [fetchEvents, refetchEvents, clearEventCache]);

  return {
    events,
    isLoading,
    lastUpdated,
    refetchEvents
  };
};
