
import { useState, useEffect, useCallback } from 'react';
import { Event } from '@/lib/types';
import { getEvents } from '@/services/eventService';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    refreshEvents: fetchEvents
  };
};
