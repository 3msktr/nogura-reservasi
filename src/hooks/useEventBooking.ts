
import { useState, useEffect } from 'react';
import { Event, Session } from '@/lib/types';
import { getEventById } from '@/services/eventService';
import { createReservation } from '@/services/reservationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EventBookingProps {
  eventId?: string;
}

export const useEventBooking = ({ eventId }: EventBookingProps) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [seatCount, setSeatCount] = useState(1);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const fetchEvent = async () => {
      setIsLoading(true);
      try {
        const eventData = await getEventById(eventId);
        if (eventData) {
          setEvent(eventData);
          // Reset selection on new event
          setSelectedSession(null);
          setSeatCount(1);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId);
    // Reset seat count when changing sessions
    setSeatCount(1);
  };

  const selectedSessionData = selectedSession
    ? event?.sessions.find(session => session.id === selectedSession)
    : undefined;

  const initiateReservation = () => {
    if (!selectedSession || !selectedSessionData) {
      toast.error('Please select a session');
      return;
    }

    if (seatCount < 1) {
      toast.error('Please select at least one seat');
      return;
    }

    if (seatCount > selectedSessionData.availableSeats) {
      toast.error(`Only ${selectedSessionData.availableSeats} seats available`);
      return;
    }

    setShowConfirmationForm(true);
  };

  const handleConfirmReservation = async (formData: {
    contactName: string;
    phoneNumber: string;
    allergyNotes: string;
  }) => {
    if (!user || !event || !selectedSession) {
      toast.error('Missing required information');
      return;
    }

    setIsLoading(true);
    try {
      await createReservation(
        event.id,
        selectedSession,
        seatCount,
        {
          contactName: formData.contactName,
          phoneNumber: formData.phoneNumber,
          allergyNotes: formData.allergyNotes
        }
      );

      toast.success('Reservation created successfully!');
      setShowConfirmationForm(false);
      // Return to the event list or reservation list page
      window.location.href = '/my-reservations';
    } catch (error) {
      console.error('Error creating reservation:', error);
      toast.error('Failed to create reservation');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    event,
    setEvent,
    isLoading,
    selectedSession,
    seatCount,
    selectedSessionData,
    showConfirmationForm,
    handleSessionChange,
    setSeatCount,
    initiateReservation,
    handleConfirmReservation,
    setShowConfirmationForm
  };
};
