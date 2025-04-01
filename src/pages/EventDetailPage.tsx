
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Users, Lock, LockOpen, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Event } from '@/lib/types';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { getEventById, subscribeToSessionUpdates } from '@/services/eventService';
import { toast } from 'sonner';

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
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
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Failed to load event details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();

    // Subscribe to real-time updates for sessions
    let unsubscribeFromSessions: (() => void) | undefined;
    
    if (eventId) {
      unsubscribeFromSessions = subscribeToSessionUpdates(eventId, (updatedSessions) => {
        setEvent((currentEvent) => {
          if (currentEvent && currentEvent.id === eventId) {
            return {
              ...currentEvent,
              sessions: updatedSessions
            };
          }
          return currentEvent;
        });
      });
    }
    
    return () => {
      if (unsubscribeFromSessions) {
        unsubscribeFromSessions();
      }
    };
  }, [eventId]);
  
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
  const isFull = availableSeats === 0;
  
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
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">{event.name}</h1>
                <div className="flex space-x-2">
                  {isFull && (
                    <div className="px-3 py-1 rounded-full text-sm flex items-center bg-orange-100 text-orange-800">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      <span>Full Booked</span>
                    </div>
                  )}
                  <div className={`px-3 py-1 rounded-full text-sm flex items-center ${event.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {event.isOpen ? (
                      <>
                        <LockOpen className="h-4 w-4 mr-1" />
                        <span>Open for Booking</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        <span>Closed for Booking</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
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
                    <div key={session.id} className={`rounded-lg p-4 ${
                      session.availableSeats === 0 
                        ? 'bg-orange-50 border border-orange-200' 
                        : 'bg-secondary'
                    }`}>
                      <div className="font-medium mb-2">{formatTime(session.time)}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {session.availableSeats} of {session.totalSeats} seats available
                      </div>
                      {session.availableSeats === 0 && (
                        <div className="text-xs text-orange-600 flex items-center">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Full
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {event.isOpen ? (
                <div className="mt-8">
                  {isFull ? (
                    <div className="mt-8 bg-orange-50 rounded-xl p-6">
                      <h3 className="text-lg font-medium mb-4 text-center">Full Booked</h3>
                      <p className="text-sm text-muted-foreground text-center">
                        All seats for this event have been booked. Please check back later or try another event.
                      </p>
                    </div>
                  ) : (
                    <Link to={`/booking/${event.id}`}>
                      <Button size="lg">Proceed to Booking</Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="mt-8 bg-secondary rounded-xl p-6">
                  <h3 className="text-lg font-medium mb-4 text-center">Reservations Unavailable</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    This event is currently not open for reservations.
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
