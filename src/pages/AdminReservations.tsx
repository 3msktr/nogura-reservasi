
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/types';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, X, Check, Clock, Calendar, User } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/dateUtils';

interface ExtendedReservation extends Reservation {
  userName?: string;
}

const AdminReservations = () => {
  const [reservations, setReservations] = useState<ExtendedReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          event:eventid (id, name, date),
          session:sessionid (time)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map the data to match our expected structure
      const mappedReservations: ExtendedReservation[] = data.map(item => ({
        id: item.id,
        userId: item.userid,
        eventId: item.eventid,
        sessionId: item.sessionid,
        numberOfSeats: item.numberofseats,
        status: item.status,
        createdAt: item.created_at,
        event: item.event,
        session: item.session
      }));

      // Fetch user names
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

      setReservations(mappedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (reservationId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      // Update the reservation status
      const { error } = await supabase
        .from('reservations')
        .update({ status })
        .eq('id', reservationId);

      if (error) throw error;

      // If we're cancelling a reservation, we need to free up the seats
      if (status === 'cancelled' && reservation.status !== 'cancelled') {
        // Free up the seats by using a negative value for p_seats_to_reduce
        const { error: updateError } = await supabase.rpc('update_available_seats', {
          p_session_id: reservation.sessionId,
          p_seats_to_reduce: -reservation.numberOfSeats // negative to increase available seats
        });

        if (updateError) throw updateError;
      }

      // If we're confirming a previously cancelled reservation, we need to take the seats
      if (status === 'confirmed' && reservation.status === 'cancelled') {
        // Take the seats by using a positive value for p_seats_to_reduce
        const { error: updateError } = await supabase.rpc('update_available_seats', {
          p_session_id: reservation.sessionId,
          p_seats_to_reduce: reservation.numberOfSeats
        });

        if (updateError) throw updateError;
      }

      toast.success(`Reservation ${status === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`);
      fetchReservations();
    } catch (error) {
      console.error(`Error updating reservation:`, error);
      toast.error('Failed to update reservation');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Layout>
      <div className="container py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Reservations</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Seats</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No reservations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  reservations.map((reservation) => (
                    <TableRow key={reservation.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-muted-foreground" />
                          {reservation.userName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {reservation.event?.name || 'Unknown Event'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="flex items-center">
                            <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                            {reservation.event?.date ? formatDate(reservation.event.date) : 'Unknown Date'}
                          </span>
                          <span className="flex items-center text-sm text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {reservation.session?.time ? formatTime(reservation.session.time) : 'Unknown Time'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{reservation.numberOfSeats}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(reservation.status)}`}>
                          {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        {reservation.status !== 'confirmed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}
                            disabled={reservation.status === 'confirmed'}
                            title="Confirm Reservation"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        {reservation.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}
                            disabled={reservation.status === 'cancelled'}
                            title="Cancel Reservation"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/event/${reservation.eventId}`)}
                          title="View Event"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminReservations;
