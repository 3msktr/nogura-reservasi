
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
