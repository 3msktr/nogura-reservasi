
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Event } from '@/lib/types';
import EventDetails from '@/components/booking/EventDetails';
import SessionSelector from '@/components/booking/SessionSelector';
import SeatSelector from '@/components/booking/SeatSelector';
import ReservationSummary from '@/components/booking/ReservationSummary';
import { useEventBooking } from '@/hooks/useEventBooking';

// Mock data
const mockEvents: Event[] = [
  {
    id: "1",
    name: "Spring Tasting Menu",
    description: "Experience our exclusive spring tasting menu featuring the finest seasonal ingredients, prepared with precision and artistry by our executive chef.",
    date: "2024-06-30",
    isOpen: false,
    openingTime: "2024-06-25T10:00:00",
    closingTime: "2024-06-30T18:00:00",
    maxReservationsPerUser: 4,
    sessions: [
      {
        id: "s1",
        time: "13:00",
        availableSeats: 20,
        totalSeats: 30,
        eventId: "1"
      },
      {
        id: "s2",
        time: "17:00",
        availableSeats: 25,
        totalSeats: 30,
        eventId: "1"
      },
      {
        id: "s3",
        time: "20:00",
        availableSeats: 15,
        totalSeats: 30,
        eventId: "1"
      }
    ]
  },
  {
    id: "2",
    name: "Chef's Table Experience",
    description: "Join us for an intimate dining experience at our Chef's Table. Watch as our culinary team prepares an exclusive tasting menu right before your eyes.",
    date: "2024-07-15",
    isOpen: true,
    openingTime: "2024-06-20T10:00:00",
    closingTime: "2024-07-14T23:59:59",
    maxReservationsPerUser: 2,
    sessions: [
      {
        id: "s4",
        time: "16:00",
        availableSeats: 8,
        totalSeats: 10,
        eventId: "2"
      },
      {
        id: "s5",
        time: "21:00",
        availableSeats: 6,
        totalSeats: 10,
        eventId: "2"
      }
    ]
  },
];

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
  } = useEventBooking({ eventId, mockEvents });
  
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
