
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import CountdownTimer from '@/components/CountdownTimer';
import { Event } from '@/lib/types';
import { formatDate, formatTime, shouldEventBeOpen, isValidDate } from '@/utils/dateUtils';
import { getEventById } from '@/services/eventService';
import { toast } from 'sonner';

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        console.error('No eventId provided');
        toast.error('Event ID is missing');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching event with ID:', eventId);
        const data = await getEventById(eventId);
        
        if (!data) {
          console.error('Event not found:', eventId);
          toast.error('Event not found');
          setIsLoading(false);
          return;
        }
        
        console.log('Event data received:', data);
        setEvent(data);
        
        // Validate opening and closing times
        const openingValid = isValidDate(data.openingTime);
        const closingValid = isValidDate(data.closingTime);
        
        if (!openingValid || !closingValid) {
          console.error('Invalid date values in event:', { 
            openingTime: data.openingTime, 
            closingTime: data.closingTime,
            openingValid,
            closingValid
          });
          toast.error('There was an issue with the event dates. Please contact support.');
        }
        
        // Calculate if the event is open
        const open = shouldEventBeOpen(data.openingTime, data.closingTime);
        console.log('Event open status:', open);
        setIsOpen(open);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId]);
  
  const handleCountdownComplete = () => {
    console.log('Countdown completed, updating isOpen state');
    setIsOpen(true);
    toast.success("Reservations are now open!");
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <div className="animate-pulse">Loading event details...</div>
        </div>
      </Layout>
    );
  }
  
  if (!event) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Event Not Found</h2>
            <p className="mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <Link to="/">
              <Button>Return to Events</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  const totalSeats = event.sessions.reduce((acc, session) => acc + session.totalSeats, 0) || 0;
  const availableSeats = event.sessions.reduce((acc, session) => acc + session.availableSeats, 0) || 0;
  
  // Log to debug countdown timer issues
  console.log('Event detail render - opening time:', event.openingTime);
  console.log('Is valid opening date:', isValidDate(event.openingTime));
  console.log('Current isOpen state:', isOpen);
  
  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-4 inline-flex items-center"
          >
            ← Back to events
          </Link>
          
          <div className="bg-white rounded-xl shadow-subtle border border-border overflow-hidden">
            <div className="p-6 md:p-8">
              <h1 className="text-3xl font-bold mb-4">{event.name}</h1>
              <p className="text-muted-foreground mb-6">{event.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center text-sm bg-secondary px-4 py-2 rounded-full">
                  <Calendar size={16} className="mr-2" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-sm bg-secondary px-4 py-2 rounded-full">
                  <Clock size={16} className="mr-2" />
                  <span>{event.sessions.length} sessions available</span>
                </div>
                <div className="flex items-center text-sm bg-secondary px-4 py-2 rounded-full">
                  <Users size={16} className="mr-2" />
                  <span>{availableSeats} of {totalSeats} seats available</span>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Available Sessions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {event.sessions.map((session) => (
                    <div key={session.id} className="bg-secondary rounded-lg p-4">
                      <div className="font-medium mb-2">{formatTime(session.time)}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {session.availableSeats} of {session.totalSeats} seats available
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {isOpen ? (
                <div className="mt-8">
                  <Link to={`/booking/${event.id}`}>
                    <Button size="lg">Proceed to Booking</Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-8 bg-secondary rounded-xl p-6">
                  <h3 className="text-lg font-medium mb-4 text-center">Reservations opening soon</h3>
                  <div className="mb-6">
                    {isValidDate(event.openingTime) ? (
                      <CountdownTimer 
                        targetDate={event.openingTime} 
                        onComplete={handleCountdownComplete}
                      />
                    ) : (
                      <div className="text-center text-sm text-muted-foreground">
                        Opening time information is unavailable.
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Reservations for this event will open on {formatDate(event.openingTime)} at {formatTime(event.openingTime)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetailPage;
