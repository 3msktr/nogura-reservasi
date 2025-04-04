
import { useState, useEffect } from 'react';
import { Event, Session } from '@/lib/types';
import { getEventById } from '@/services/eventService';
import { createReservation } from '@/services/reservationService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EventBookingProps {
  eventId?: string;
  isAdmin?: boolean;
}

export const useEventBooking = ({ eventId, isAdmin = false }: EventBookingProps) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [seatCount, setSeatCount] = useState(1);
  const [showConfirmationForm, setShowConfirmationForm] = useState(false);

  console.log("useEventBooking - isAdmin:", isAdmin);

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

  // Check if the event is full (all sessions have 0 available seats)
  const isEventFull = event && event.sessions.every(session => session.availableSeats === 0);

  const initiateReservation = () => {
    if (!event) {
      toast.error('Event details not available');
      return;
    }

    if (isEventFull) {
      toast.error('This event is fully booked');
      return;
    }

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

    // Admin can book even if event is not open
    if (!event.isOpen && !isAdmin) {
      toast.error('This event is not open for reservations');
      return;
    }

    console.log('Initiating reservation with admin override:', isAdmin);
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

    // Double check that the event isn't full
    if (isEventFull) {
      toast.error('This event is now fully booked');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Creating reservation with admin override:', isAdmin);
      const result = await createReservation(
        event.id,
        selectedSession,
        seatCount,
        {
          contactName: formData.contactName,
          phoneNumber: formData.phoneNumber,
          allergyNotes: formData.allergyNotes
        },
        isAdmin // Pass the admin override flag
      );

      if (result) {
        toast.success('Reservation created successfully!');
        setShowConfirmationForm(false);
        // Return to the event list or reservation list page
        window.location.href = '/my-reservations';
      } else {
        toast.error('Failed to create reservation');
      }
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
    isEventFull,
    handleSessionChange,
    setSeatCount,
    initiateReservation,
    handleConfirmReservation,
    setShowConfirmationForm
  };
};
