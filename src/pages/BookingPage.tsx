
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import EventDetails from '@/components/booking/EventDetails';
import SessionSelector from '@/components/booking/SessionSelector';
import SeatSelector from '@/components/booking/SeatSelector';
import ReservationSummary from '@/components/booking/ReservationSummary';
import ReservationConfirmationForm from '@/components/booking/ReservationConfirmationForm';
import { useEventBooking } from '@/hooks/useEventBooking';
import { toast } from 'sonner';
import { checkExistingReservation } from '@/services/reservationService';
import { subscribeToSessionUpdates } from '@/services/eventService';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

const BookingPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [hasExistingReservation, setHasExistingReservation] = useState(false);
  const { user, isAdmin } = useAuth();
  
  console.log("BookingPage - isAdmin:", isAdmin);
  console.log("BookingPage - User:", user?.id);
  
  const {
    event,
    selectedSession,
    seatCount,
    isLoading,
    selectedSessionData,
    showConfirmationForm,
    handleSessionChange,
    setSeatCount,
    initiateReservation,
    handleConfirmReservation,
    setShowConfirmationForm,
    setEvent
  } = useEventBooking({ eventId, isAdmin });
  
  useEffect(() => {
    if (!user) {
      toast.error("You must be logged in to make a reservation");
      navigate("/login");
      return;
    }
    
    if (event) {
      // Allow booking if admin, even if event is not open
      if (!event.isOpen && !isAdmin) {
        toast.error("This event is not open for reservations");
        navigate(`/event/${event.id}`);
        return;
      }
      
      const totalAvailableSeats = event.sessions.reduce(
        (sum, session) => sum + session.availableSeats, 0
      );
      
      if (totalAvailableSeats === 0) {
        toast.error("This event is fully booked");
        navigate(`/event/${event.id}`);
      }
    }
  }, [event, navigate, isAdmin, user]);

  useEffect(() => {
    const checkReservation = async () => {
      if (eventId) {
        const exists = await checkExistingReservation(eventId);
        setHasExistingReservation(exists);
      }
    };
    
    checkReservation();
  }, [eventId]);
  
  useEffect(() => {
    if (!eventId) return;
    
    const unsubscribe = subscribeToSessionUpdates(eventId, (updatedSessions) => {
      // Update the event with the latest session data
      setEvent((currentEvent) => {
        if (!currentEvent) return currentEvent;
        
        const updatedEvent = {
          ...currentEvent,
          sessions: updatedSessions
        };
        
        // Check if event is fully booked now
        const totalAvailableSeats = updatedSessions.reduce(
          (sum, session) => sum + session.availableSeats, 0
        );
        
        if (totalAvailableSeats === 0 && !showConfirmationForm) {
          toast("This event is now fully booked");
          navigate(`/event/${eventId}`);
        }
        
        return updatedEvent;
      });
    });
    
    return () => {
      unsubscribe();
    };
  }, [eventId, navigate, setEvent, showConfirmationForm]);
  
  if (!event) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <div className="animate-pulse">Loading event details...</div>
        </div>
      </Layout>
    );
  }
  
  // Calculate max seats for the selected session
  const maxSeats = selectedSessionData 
    ? (isAdmin 
        ? selectedSessionData.availableSeats  // For admins, use all available seats
        : Math.min(selectedSessionData.availableSeats, event.maxReservationsPerUser)) // For regular users, respect limit
    : 1;
  
  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <EventDetails event={event} onBack={() => navigate("/")} />
          
          {hasExistingReservation ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-8 text-center">
              <h3 className="text-lg font-medium text-amber-800 mb-2">You already have a reservation for this event</h3>
              <p className="text-amber-700 mb-4">Each user can only book once per event.</p>
              <button 
                onClick={() => navigate("/my-reservations")} 
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded transition-colors"
              >
                View My Reservations
              </button>
            </div>
          ) : (
            <>
              {showConfirmationForm ? (
                <div className="animate-fade-in max-w-md mx-auto my-8">
                  <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-2">Confirm Your Reservation</h2>
                      <p className="text-muted-foreground text-sm">
                        Please provide your contact details to complete the reservation.
                      </p>
                    </div>
                    
                    <ReservationConfirmationForm 
                      onSubmit={handleConfirmReservation} 
                      isLoading={isLoading}
                      event={event}
                      selectedSessionData={selectedSessionData}
                      seatCount={seatCount}
                    />
                    
                    <button 
                      className="mt-4 text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmationForm(false)}
                    >
                      ← Back to selection
                    </button>
                  </div>
                </div>
              ) : (
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
                        maxSeats={maxSeats}
                        isAdmin={isAdmin}
                      />
                    )}
                    
                    {isAdmin && !event.isOpen && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-700 flex items-center gap-1">
                          <ShieldAlert className="h-4 w-4" />
                          Admin Override Active
                        </p>
                        <p className="text-xs text-blue-600">
                          You can book this closed event and select up to the maximum available seats.
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="animate-slide-up delay-100">
                    <ReservationSummary 
                      event={event}
                      selectedSessionData={selectedSessionData}
                      seatCount={seatCount}
                      isLoading={isLoading}
                      onReservation={initiateReservation}
                      isAdmin={isAdmin}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
