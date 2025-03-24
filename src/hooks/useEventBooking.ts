
import { useState, useEffect } from 'react';
import { Event, Session } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface UseEventBookingProps {
  eventId: string | undefined;
  mockEvents: Event[];
}

export const useEventBooking = ({ eventId, mockEvents }: UseEventBookingProps) => {
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [seatCount, setSeatCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    // Simulate fetching event data
    const foundEvent = mockEvents.find(e => e.id === eventId);
    
    if (foundEvent) {
      setEvent(foundEvent);
    } else {
      toast.error("Event not found");
      navigate("/");
    }
  }, [eventId, navigate, mockEvents]);
  
  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId);
    setSeatCount(1); // Reset seat count when changing session
  };
  
  const getSelectedSessionData = (): Session | undefined => {
    return event?.sessions.find(session => session.id === selectedSession);
  };
  
  const handleReservation = () => {
    setIsLoading(true);
    
    // Simulate reservation process
    setTimeout(() => {
      toast.success("Reservation confirmed successfully!");
      setIsLoading(false);
      navigate("/my-reservations");
    }, 1500);
  };
  
  const selectedSessionData = getSelectedSessionData();
  
  return {
    event,
    selectedSession,
    seatCount,
    isLoading,
    selectedSessionData,
    handleSessionChange,
    setSeatCount,
    handleReservation,
  };
};
