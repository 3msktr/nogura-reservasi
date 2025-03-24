
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import EventDetails from '@/components/booking/EventDetails';
import SessionSelector from '@/components/booking/SessionSelector';
import SeatSelector from '@/components/booking/SeatSelector';
import ReservationSummary from '@/components/booking/ReservationSummary';
import { useEventBooking } from '@/hooks/useEventBooking';
import { toast } from 'sonner';

const BookingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const {
    event,
    selectedSession,
    seatCount,
    isLoading,
    selectedSessionData,
    handleSessionChange,
    setSeatCount,
    handleReservation,
  } = useEventBooking({ eventId });
  
  useEffect(() => {
    if (event && !event.isOpen) {
      toast.error("This event is not open for reservations");
      navigate(`/event/${event.id}`);
    }
  }, [event, navigate]);
  
  if (!event) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <div className="animate-pulse">Loading event details...</div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <EventDetails event={event} onBack={() => navigate("/")} />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2 animate-slide-up">
              <SessionSelector 
                sessions={event.sessions}
                selectedSession={selectedSession}
                onSessionChange={handleSessionChange}
              />
              
              {selectedSession && (
                <SeatSelector 
                  seatCount={seatCount}
                  setSeatCount={setSeatCount}
                  maxSeats={Math.min(
                    selectedSessionData?.availableSeats || 1, 
                    event.maxReservationsPerUser
                  )}
                />
              )}
            </div>
            
            <div className="animate-slide-up delay-100">
              <ReservationSummary 
                event={event}
                selectedSessionData={selectedSessionData}
                seatCount={seatCount}
                isLoading={isLoading}
                onReservation={handleReservation}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
