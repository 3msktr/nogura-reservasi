
import { supabase } from "@/integrations/supabase/client";
import { Event, Session } from "@/lib/types";
import { toast } from "sonner";

export const getEvents = async (): Promise<Event[]> => {
  try {
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) throw error;

    // For each event, fetch its sessions
    const eventsWithSessions = await Promise.all(
      events.map(async (event) => {
        const { data: sessions, error: sessionsError } = await supabase
          .from("sessions")
          .select("*")
          .eq("eventid", event.id)
          .order("time", { ascending: true });

        if (sessionsError) throw sessionsError;

        return {
          ...event,
          sessions: sessions.map(session => ({
            id: session.id,
            time: session.time,
            availableSeats: session.availableseats,
            totalSeats: session.totalseats,
            eventId: session.eventid
          })) as Session[]
        };
      })
    );

    // Map database column names to our interface properties
    return eventsWithSessions.map(event => ({
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date,
      isOpen: event.isopen,
      openingTime: event.openingtime,
      closingTime: event.closingtime,
      maxReservationsPerUser: event.maxreservationsperuser,
      sessions: event.sessions
    })) as Event[];
  } catch (error) {
    console.error("Error fetching events:", error);
    toast.error("Failed to load events");
    return [];
  }
};

export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) throw error;

    const { data: sessions, error: sessionsError } = await supabase
      .from("sessions")
      .select("*")
      .eq("eventid", eventId)
      .order("time", { ascending: true });

    if (sessionsError) throw sessionsError;

    // Map database column names to our interface properties
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      date: event.date,
      isOpen: event.isopen,
      openingTime: event.openingtime,
      closingTime: event.closingtime,
      maxReservationsPerUser: event.maxreservationsperuser,
      sessions: sessions.map(session => ({
        id: session.id,
        time: session.time,
        availableSeats: session.availableseats,
        totalSeats: session.totalseats,
        eventId: session.eventid
      })) as Session[]
    } as Event;
  } catch (error) {
    console.error("Error fetching event details:", error);
    toast.error("Failed to load event details");
    return null;
  }
};

// Setup realtime subscription for events table
export const subscribeToEventUpdates = (callback: (event: Event) => void) => {
  // Enable realtime for the events table
  const channel = supabase
    .channel('events-channel')
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'events',
      },
      async (payload) => {
        console.log('Event updated:', payload);
        
        // When an event is updated, fetch the complete event with sessions
        if (payload.new && payload.new.id) {
          const eventId = payload.new.id;
          const updatedEvent = await getEventById(eventId);
          
          if (updatedEvent) {
            callback(updatedEvent);
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'events',
      },
      async (payload) => {
        console.log('New event created:', payload);
        
        // Fetch all events again to update the list
        const events = await getEvents();
        if (events && events.length > 0) {
          // Return the newly created event if it exists
          if (payload.new && payload.new.id) {
            const newEvent = events.find(event => event.id === payload.new.id);
            if (newEvent) {
              callback(newEvent);
            }
          }
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'DELETE',
        schema: 'public',
        table: 'events',
      },
      (payload) => {
        console.log('Event deleted:', payload);
        // We'll handle this in the useEvents hook
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};

// Setup realtime subscription for sessions table
export const subscribeToSessionUpdates = (eventId: string, callback: (sessions: Session[]) => void) => {
  const channel = supabase
    .channel(`sessions-channel-${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'sessions',
        filter: `eventid=eq.${eventId}`
      },
      async () => {
        // When any session changes, fetch all sessions for this event
        const { data, error } = await supabase
          .from('sessions')
          .select('*')
          .eq('eventid', eventId)
          .order('time', { ascending: true });

        if (error) {
          console.error('Error fetching updated sessions:', error);
          return;
        }

        // Map database column names to our interface properties
        const updatedSessions = data.map(session => ({
          id: session.id,
          time: session.time,
          availableSeats: session.availableseats,
          totalSeats: session.totalseats,
          eventId: session.eventid
        })) as Session[];

        callback(updatedSessions);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
