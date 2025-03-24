
import { supabase } from "@/integrations/supabase/client";
import { Reservation } from "@/lib/types";
import { toast } from "sonner";

export const getUserReservations = async (): Promise<Reservation[]> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from("reservations")
      .select(`
        *,
        event:eventId (id, name, date),
        session:sessionId (time)
      `)
      .eq("userId", user.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return data as Reservation[];
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    toast.error("Failed to load your reservations");
    return [];
  }
};

export const createReservation = async (
  eventId: string,
  sessionId: string,
  numberOfSeats: number
): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      toast.error("You must be logged in to make a reservation");
      return false;
    }

    // First, check if there are enough available seats
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("availableSeats")
      .eq("id", sessionId)
      .single();

    if (sessionError) throw sessionError;

    if (session.availableSeats < numberOfSeats) {
      toast.error("Not enough seats available. Please try again.");
      return false;
    }

    // Create the reservation
    const { error } = await supabase.from("reservations").insert({
      userId: user.user.id,
      eventId,
      sessionId,
      numberOfSeats,
      status: "confirmed"
    });

    if (error) throw error;

    // Update the available seats
    const { error: updateError } = await supabase.rpc('update_available_seats', {
      p_session_id: sessionId,
      p_seats_to_reduce: numberOfSeats
    });

    if (updateError) throw updateError;

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
      .select("sessionId, numberOfSeats, status")
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

    // Free up the seats
    const { error: updateError } = await supabase.rpc('update_available_seats', {
      p_session_id: reservation.sessionId,
      p_seats_to_reduce: -reservation.numberOfSeats // negative to increase available seats
    });

    if (updateError) throw updateError;

    toast.success("Reservation cancelled successfully");
    return true;
  } catch (error) {
    console.error("Error cancelling reservation:", error);
    toast.error("Failed to cancel reservation");
    return false;
  }
};
