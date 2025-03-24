
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
          .eq("eventId", event.id)
          .order("time", { ascending: true });

        if (sessionsError) throw sessionsError;

        return {
          ...event,
          sessions: sessions as Session[]
        };
      })
    );

    return eventsWithSessions as Event[];
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
      .eq("eventId", eventId)
      .order("time", { ascending: true });

    if (sessionsError) throw sessionsError;

    return {
      ...event,
      sessions: sessions as Session[]
    } as Event;
  } catch (error) {
    console.error("Error fetching event details:", error);
    toast.error("Failed to load event details");
    return null;
  }
};
