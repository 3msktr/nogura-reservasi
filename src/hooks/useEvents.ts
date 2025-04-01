
import { useState, useEffect } from 'react';
import { Event, Session } from '@/lib/types';
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
      setEvents(currentEvents => {
        // Check if the event already exists in our state
        const eventExists = currentEvents.some(event => event.id === updatedEvent.id);
        
        if (eventExists) {
          // Update the existing event
          return currentEvents.map(event => 
            event.id === updatedEvent.id ? updatedEvent : event
          );
        } else {
          // Add the new event to the list
          return [...currentEvents, updatedEvent];
        }
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return { events, isLoading };
};
