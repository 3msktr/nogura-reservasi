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
        event:eventid (id, name, date),
        session:sessionid (time)
      `)
      .eq("userid", user.user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    
    return data.map(item => ({
      id: item.id,
      userId: item.userid,
      eventId: item.eventid,
      sessionId: item.sessionid,
      numberOfSeats: item.numberofseats,
      status: item.status,
      createdAt: item.created_at,
      event: item.event,
      session: item.session
    })) as Reservation[];
  } catch (error) {
    console.error("Error fetching user reservations:", error);
    toast.error("Failed to load your reservations");
    return [];
  }
};

export const checkExistingReservation = async (eventId: string, isAdminOverride: boolean = false): Promise<boolean> => {
  try {
    if (isAdminOverride) {
      console.log("Admin override: skipping existing reservation check");
      return false;
    }
    
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
    
    return !!data;
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
  },
  isAdminOverride: boolean = false
): Promise<boolean> => {
  try {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      toast.error("You must be logged in to make a reservation");
      return false;
    }

    const hasExistingReservation = await checkExistingReservation(eventId, isAdminOverride);
    if (hasExistingReservation) {
      toast.error("You already have a reservation for this event");
      return false;
    }

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

    if (!isAdminOverride) {
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("isopen")
        .eq("id", eventId)
        .single();
        
      if (eventError) throw eventError;
      
      if (!event.isopen) {
        toast.error("This event is not open for reservations");
        return false;
      }
    } else {
      console.log("Admin override: skipping event.isopen check");
    }

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
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("sessionid, numberofseats, status")
      .eq("id", reservationId)
      .single();

    if (fetchError) throw fetchError;
    
    if (reservation.status === "cancelled") {
      return true;
    }

    const { error } = await supabase
      .from("reservations")
      .update({ status: "cancelled" })
      .eq("id", reservationId);

    if (error) throw error;

    const { error: updateError } = await supabase.rpc('update_available_seats', {
      p_session_id: reservation.sessionid,
      p_seats_to_reduce: -reservation.numberofseats
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

export const updateReservation = async (
  reservationId: string, 
  updates: {
    numberOfSeats?: number;
    contactName?: string;
    phoneNumber?: string;
    allergyNotes?: string;
    status?: "confirmed" | "cancelled" | "pending";
  }
): Promise<boolean> => {
  try {
    const { data: currentReservation, error: fetchError } = await supabase
      .from("reservations")
      .select("numberofseats, sessionid, status")
      .eq("id", reservationId)
      .single();

    if (fetchError) throw fetchError;

    const updateData: any = {};
    
    if (updates.numberOfSeats !== undefined) {
      updateData.numberofseats = updates.numberOfSeats;
    }
    
    if (updates.contactName !== undefined) {
      updateData.contact_name = updates.contactName;
    }
    
    if (updates.phoneNumber !== undefined) {
      updateData.phone_number = updates.phoneNumber ? `+62${updates.phoneNumber.replace(/^\+62/, '')}` : null;
    }
    
    if (updates.allergyNotes !== undefined) {
      updateData.allergy_notes = updates.allergyNotes;
    }
    
    if (updates.status !== undefined) {
      updateData.status = updates.status;
    }

    const { error } = await supabase
      .from("reservations")
      .update(updateData)
      .eq("id", reservationId);

    if (error) throw error;

    if (updates.numberOfSeats !== undefined && updates.numberOfSeats !== currentReservation.numberofseats) {
      const seatDifference = currentReservation.numberofseats - updates.numberOfSeats;
      
      if (currentReservation.status !== "cancelled" && updates.status !== "cancelled") {
        const { error: updateSeatsError } = await supabase.rpc('update_available_seats', {
          p_session_id: currentReservation.sessionid,
          p_seats_to_reduce: seatDifference
        });

        if (updateSeatsError) throw updateSeatsError;
      }
    }

    if (updates.status === "cancelled" && currentReservation.status !== "cancelled") {
      const { error: updateSeatsError } = await supabase.rpc('update_available_seats', {
        p_session_id: currentReservation.sessionid,
        p_seats_to_reduce: -currentReservation.numberofseats
      });

      if (updateSeatsError) throw updateSeatsError;
    }

    if (currentReservation.status === "cancelled" && updates.status === "confirmed") {
      const seatsToReduce = updates.numberOfSeats !== undefined ? updates.numberOfSeats : currentReservation.numberofseats;
      
      const { error: updateSeatsError } = await supabase.rpc('update_available_seats', {
        p_session_id: currentReservation.sessionid,
        p_seats_to_reduce: seatsToReduce
      });

      if (updateSeatsError) throw updateSeatsError;
    }

    toast.success("Reservation updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating reservation:", error);
    toast.error("Failed to update reservation");
    return false;
  }
};

export const deleteReservation = async (reservationId: string): Promise<boolean> => {
  try {
    const { data: reservation, error: fetchError } = await supabase
      .from("reservations")
      .select("sessionid, numberofseats, status")
      .eq("id", reservationId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from("reservations")
      .delete()
      .eq("id", reservationId);

    if (error) throw error;

    if (reservation.status !== "cancelled") {
      const { error: updateError } = await supabase.rpc('update_available_seats', {
        p_session_id: reservation.sessionid,
        p_seats_to_reduce: -reservation.numberofseats
      });

      if (updateError) throw updateError;
    }

    toast.success("Reservation deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting reservation:", error);
    toast.error("Failed to delete reservation");
    return false;
  }
};
