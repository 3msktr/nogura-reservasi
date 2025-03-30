
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/types';
import { toast } from 'sonner';

export interface ExtendedReservation extends Reservation {
  userName?: string;
}

export const fetchReservations = async (): Promise<ExtendedReservation[]> => {
  try {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        event:eventid (id, name, date),
        session:sessionid (time)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const mappedReservations: ExtendedReservation[] = data.map(item => ({
      id: item.id,
      userId: item.userid,
      eventId: item.eventid,
      sessionId: item.sessionid,
      numberOfSeats: item.numberofseats,
      status: item.status as "pending" | "confirmed" | "cancelled",
      createdAt: item.created_at,
      event: item.event,
      session: item.session,
      contactName: item.contact_name,
      phoneNumber: item.phone_number,
      allergyNotes: item.allergy_notes,
    }));

    await Promise.all(
      mappedReservations.map(async (reservation) => {
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', reservation.userId)
            .single();

          if (profileError) throw profileError;
          
          reservation.userName = profile?.full_name || 'Unknown User';
        } catch (error) {
          console.error(`Error fetching profile for ${reservation.userId}:`, error);
          reservation.userName = 'Unknown User';
        }
      })
    );

    return mappedReservations;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    toast.error('Failed to load reservations');
    return [];
  }
};

export const updateReservationStatus = async (
  reservationId: string, 
  newStatus: 'confirmed' | 'cancelled',
  onSuccess: () => void
): Promise<void> => {
  try {
    const { data: reservation, error: fetchError } = await supabase
      .from('reservations')
      .select('sessionid, status, numberofseats')
      .eq('id', reservationId)
      .single();

    if (fetchError) throw fetchError;

    const { error } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', reservationId);

    if (error) throw error;

    // If cancelling a confirmed reservation, update available seats
    if (newStatus === 'cancelled' && reservation.status !== 'cancelled') {
      const { error: updateError } = await supabase.rpc('update_available_seats', {
        p_session_id: reservation.sessionid,
        p_seats_to_reduce: -reservation.numberofseats
      });

      if (updateError) throw updateError;
    }

    // If confirming a cancelled reservation, update available seats
    if (newStatus === 'confirmed' && reservation.status === 'cancelled') {
      const { error: updateError } = await supabase.rpc('update_available_seats', {
        p_session_id: reservation.sessionid,
        p_seats_to_reduce: reservation.numberofseats
      });

      if (updateError) throw updateError;
    }

    toast.success(`Reservation ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`);
    onSuccess();
  } catch (error) {
    console.error(`Error updating reservation:`, error);
    toast.error('Failed to update reservation');
  }
};
