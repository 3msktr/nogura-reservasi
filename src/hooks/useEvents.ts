
import { useState, useEffect } from 'react';
import { Event } from '@/lib/types';
import { getEvents } from '@/services/eventService';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      const data = await getEvents();
      setEvents(data);
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  return {
    events,
    isLoading
  };
};
