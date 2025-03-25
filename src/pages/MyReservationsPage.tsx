import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Reservation } from '@/lib/types';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { getUserReservations, cancelReservation } from '@/services/reservationService';

const MyReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      const data = await getUserReservations();
      setReservations(data);
      setIsLoading(false);
    };

    fetchReservations();
  }, []);

  const handleCancelReservation = async (reservationId: string) => {
    const success = await cancelReservation(reservationId);
    if (success) {
      setReservations(prev => prev.map(res => 
        res.id === reservationId ? {...res, status: "cancelled" as const} : res
      ));
    }
  };

  const ReservationCard = ({ reservation, onCancel }: { reservation: Reservation, onCancel: () => void }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">{reservation.event?.name}</h2>
          <div className={`px-3 py-1 rounded-full text-sm ${
            reservation.status === 'confirmed' ? 'bg-green-100 text-green-800' :
            reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center text-sm">
            <Calendar size={16} className="mr-2 text-muted-foreground" />
            <span>{reservation.event?.date ? formatDate(reservation.event.date) : 'Date not available'}</span>
          </div>
          <div className="flex items-center text-sm">
            <Clock size={16} className="mr-2 text-muted-foreground" />
            <span>{reservation.session?.time ? formatTime(reservation.session.time) : 'Time not available'}</span>
          </div>
          <div className="flex items-center text-sm">
            <Users size={16} className="mr-2 text-muted-foreground" />
            <span>{reservation.numberOfSeats} {reservation.numberOfSeats === 1 ? 'Seat' : 'Seats'}</span>
          </div>
        </div>
        
        {reservation.contactName && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="font-medium text-sm mb-2">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              {reservation.contactName && (
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p>{reservation.contactName}</p>
                </div>
              )}
              {reservation.phoneNumber && (
                <div>
                  <p className="text-muted-foreground">Phone</p>
                  <p>{reservation.phoneNumber}</p>
                </div>
              )}
              {reservation.allergyNotes && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-muted-foreground">Allergy Notes</p>
                  <p>{reservation.allergyNotes}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {reservation.status !== 'cancelled' && (
          <Button 
            variant="outline" 
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => handleCancelReservation(reservation.id)}
          >
            Cancel Reservation
          </Button>
        )}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-8">My Reservations</h1>
          
          {isLoading ? (
            <div className="animate-pulse">Loading your reservations...</div>
          ) : reservations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-6">You don't have any reservations yet.</p>
              <Button onClick={() => navigate('/')}>Browse Events</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {reservations.map(reservation => (
                <ReservationCard key={reservation.id} reservation={reservation} onCancel={() => handleCancelReservation(reservation.id)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyReservationsPage;
