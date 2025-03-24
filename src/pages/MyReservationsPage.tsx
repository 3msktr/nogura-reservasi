import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Reservation } from '@/lib/types';
import { formatDate, formatTime } from '@/utils/dateUtils';

// Mock data for reservations
const mockReservations: Reservation[] = [
  {
    id: "r1",
    userId: "u1",
    eventId: "1",
    sessionId: "s1",
    numberOfSeats: 2,
    status: "confirmed",
    createdAt: "2024-06-25T15:23:00",
    // Adding mock event data for display purposes
    event: {
      id: "1",
      name: "Spring Tasting Menu",
      date: "2024-06-30",
    },
    session: {
      time: "13:00",
    }
  },
  {
    id: "r2",
    userId: "u1",
    eventId: "2",
    sessionId: "s4",
    numberOfSeats: 1,
    status: "pending",
    createdAt: "2024-06-25T15:30:00",
    // Adding mock event data for display purposes
    event: {
      id: "2",
      name: "Chef's Table Experience",
      date: "2024-07-15",
    },
    session: {
      time: "16:00",
    }
  }
];

const MyReservationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulate fetching reservations from an API
    setTimeout(() => {
      setReservations(mockReservations);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCancelReservation = (reservationId: string) => {
    // Simulate cancellation process
    setReservations(prev => prev.map(res => 
      res.id === reservationId ? {...res, status: "cancelled" as const} : res
    ));
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
                <div 
                  key={reservation.id}
                  className="bg-white rounded-xl shadow-subtle border border-border p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-semibold">{reservation.event.name}</h2>
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
                      <span>{formatDate(reservation.event.date)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock size={16} className="mr-2 text-muted-foreground" />
                      <span>{formatTime(reservation.session.time)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users size={16} className="mr-2 text-muted-foreground" />
                      <span>{reservation.numberOfSeats} {reservation.numberOfSeats === 1 ? 'Seat' : 'Seats'}</span>
                    </div>
                  </div>
                  
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
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MyReservationsPage;
