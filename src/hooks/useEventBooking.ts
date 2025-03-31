import { useState, useEffect } from 'react';
import { Event, Session } from '@/lib/types';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { getEventById } from '@/services/eventService';
import { createReservation } from '@/services/reservationService';
import { removeFromCache, CACHE_KEYS } from '@/utils/cacheUtils';

interface UseEventBookingProps {
  eventId: string | undefined;
}

interface ContactInfo {
  contactName: string;
  phoneNumber: string;
  allergyNotes?: string;
}

export const useEventBooking = ({ eventId }: UseEventBookingProps) => {
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [seatCount, setSeatCount] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showConfirmationForm, setShowConfirmationForm] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        toast.error("Event ID is missing");
        navigate("/");
        return;
      }

      // Clear the event cache before fetching
      if (eventId) {
        removeFromCache(`${CACHE_KEYS.EVENT_DETAILS}${eventId}`);
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
  
  const initiateReservation = () => {
    if (!event || !selectedSession) {
      toast.error("Please select a session");
      return;
    }
    
    // Show confirmation form instead of immediately creating reservation
    setShowConfirmationForm(true);
  };
  
  const handleConfirmReservation = async (contactInfo: ContactInfo) => {
    if (!event || !selectedSession) {
      toast.error("Please select a session");
      return;
    }
    
    setIsLoading(true);
    
    const success = await createReservation(
      event.id,
      selectedSession,
      seatCount,
      contactInfo
    );
    
    setIsLoading(false);
    
    if (success) {
      navigate("/my-reservations");
    }
  };
  
  return {
    event,
    selectedSession,
    seatCount,
    isLoading,
    selectedSessionData: getSelectedSessionData(),
    showConfirmationForm,
    handleSessionChange,
    setSeatCount,
    initiateReservation,
    handleConfirmReservation,
    setShowConfirmationForm,
  };
};
