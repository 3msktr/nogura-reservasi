
import { supabase } from "@/integrations/supabase/client";
import { Reservation } from "@/lib/types";
import { toast } from "sonner";
import { getFromCache, setInCache, removeFromCache, CACHE_KEYS } from "@/utils/cacheUtils";

export const getUserReservations = async (): Promise<Reservation[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    // Try to get from cache first
    const cacheKey = `${CACHE_KEYS.USER_RESERVATIONS}_${user.user.id}`;
    const cachedReservations = getFromCache<Reservation[]>(cacheKey);
    
    if (cachedReservations) {
      return cachedReservations;
    }

    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        event:eventid (id, name, date),
        session:sessionid (time)
      `)
      .eq("userid", user.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    // Map database column names to our interface properties
    const mappedReservations = data.map(item => ({
      id: item.id,
      userId: item.userid,
      eventId: item.eventid,
      sessionId: item.sessionid,
      numberOfSeats: item.numberofseats,
      status: item.status,
      createdAt: item.created_at,
      event: item.event,
      session: item.session,
      contactName: item.contact_name,
      phoneNumber: item.phone_number,
      allergyNotes: item.allergy_notes
    })) as Reservation[];
    
    // Cache the user's reservations for 5 minutes
    setInCache(cacheKey, mappedReservations, 5);
    
    return mappedReservations;
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    toast.error("Failed to load your reservations");
    return [];
  }
};

// New function to check if a user already has an active reservation for this event
export const checkExistingReservation = async (eventId: string): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      toast.error("You must be logged in to make a reservation");
      return false;
    }

    const { data, error } = await supabase
      .from("reservations")
      .select("id")
      .eq("userid", user.user.id)
      .eq("eventid", eventId)
      .eq("status", "confirmed")
      .maybeSingle();

    if (error) throw error;
    
    return !!data; // Returns true if a reservation was found, false otherwise
  } catch (error) {
    console.error("Error checking existing reservation:", error);
    return false;
  }
};

export const createReservation = async (
  eventId: string,
  sessionId: string,
  numberOfSeats: number,
  contactInfo?: {
    contactName: string;
    phoneNumber: string;
    allergyNotes?: string;
  }
): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      toast.error("You must be logged in to make a reservation");
      return false;
    }

    // Check if the user already has an active reservation for this event
    const hasExistingReservation = await checkExistingReservation(eventId);
    if (hasExistingReservation) {
      toast.error("You already have a reservation for this event");
      return false;
    }

    // First, check if there are enough available seats
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("availableseats")
      .eq("id", sessionId)
      .single();

    if (sessionError) throw sessionError;

    if (session.availableseats < numberOfSeats) {
      toast.error("Not enough seats available. Please try again.");
      return false;
    }

    // Create the reservation with contact information
    const { error } = await supabase.from("reservations").insert({
      userid: user.user.id,
      eventid: eventId,
      sessionid: sessionId,
      numberofseats: numberOfSeats,
      status: "confirmed",
      contact_name: contactInfo?.contactName,
      phone_number: contactInfo?.phoneNumber ? `+62${contactInfo.phoneNumber}` : null,
      allergy_notes: contactInfo?.allergyNotes
    });

    if (error) throw error;

    // Update the available seats using our new function
    const { error: updateError } = await supabase.rpc('update_available_seats', {
      p_session_id: sessionId,
      p_seats_to_reduce: numberOfSeats
    });

    if (updateError) throw updateError;

    // Invalidate caches that are now stale
    removeFromCache(`${CACHE_KEYS.USER_RESERVATIONS}_${user.user.id}`);
    removeFromCache(`${CACHE_KEYS.EVENT_DETAILS}${eventId}`);
    removeFromCache(CACHE_KEYS.EVENTS);

    toast.success("Reservation confirmed successfully!");
    return true;
  } catch (error) {
    console.error("Error creating reservation:", error);
    toast.error("Failed to create reservation. Please try again.");
    return false;
  }
};

export const cancelReservation = async (reservationId: string): Promise<boolean> => {
  try {
    // Get the reservation details first to know how many seats to free up
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("sessionid, numberofseats, status")
      .eq("id", reservationId)
      .single();

    if (fetchError) throw fetchError;
    
    // If already cancelled, don't proceed
    if (reservation.status === "cancelled") {
      return true;
    }

    // Update the reservation status
    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", reservationId);

    if (error) throw error;

    // Free up the seats by using a negative value for p_seats_to_reduce
    const { error: updateError } = await supabase.rpc('update_available_seats', {
      p_session_id: reservation.sessionid,
      p_seats_to_reduce: -reservation.numberofseats // negative to increase available seats
    });

    if (updateError) throw updateError;

    // Invalidate relevant caches
    const { data: user } = await supabase.auth.getUser();
    if (user.user) {
      removeFromCache(`${CACHE_KEYS.USER_RESERVATIONS}_${user.user.id}`);
    }
    
    // We don't know the event ID here, so we invalidate all event caches
    removeFromCache(CACHE_KEYS.EVENTS);

    toast.success("Reservation cancelled successfully");
    return true;
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    toast.error("Failed to cancel reservation");
    return false;
  }
};
