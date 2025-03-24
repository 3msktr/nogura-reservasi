
import { useState, useEffect } from 'react';
import { Event, Session } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getEventById } from '@/services/eventService';
import { createReservation } from '@/services/reservationService';

interface UseEventBookingProps {
  eventId: string | undefined;
}

export const useEventBooking = ({ eventId }: UseEventBookingProps) => {
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [seatCount, setSeatCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        toast.error("Event ID is missing");
        navigate("/");
        return;
      }

      const eventData = await getEventById(eventId);
      
      if (eventData) {
        setEvent(eventData);
      } else {
        toast.error("Event not found");
        navigate("/");
      }
    };
    
    fetchEvent();
  }, [eventId, navigate]);
  
  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId);
    setSeatCount(1); // Reset seat count when changing session
  };
  
  const getSelectedSessionData = (): Session | undefined => {
    return event?.sessions.find(session => session.id === selectedSession);
  };
  
  const handleReservation = async () => {
    if (!event || !selectedSession) {
      toast.error("Please select a session");
      return;
    }
    
    setIsLoading(true);
    
    const success = await createReservation(
      event.id,
      selectedSession,
      seatCount
    );
    
    setIsLoading(false);
    
    if (success) {
      navigate("/my-reservations");
    }
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
