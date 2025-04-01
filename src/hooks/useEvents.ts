
import { useState, useEffect } from 'react';
import { Event } from '@/lib/types';
import { getEvents, subscribeToEventUpdates } from '@/services/eventService';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await getEvents();
        setEvents(data);
      } catch (error) {
        console.error('Error in useEvents hook:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();

    // Subscribe to real-time updates for events
    const unsubscribe = subscribeToEventUpdates((updatedEvent) => {
      setEvents(currentEvents => 
        currentEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { events, isLoading };
};
