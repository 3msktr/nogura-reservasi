import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import CountdownTimer from '@/components/CountdownTimer';
import { Event } from '@/lib/types';
import { formatDate, formatTime, shouldEventBeOpen } from '@/utils/dateUtils';

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

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    setTimeout(() => {
      const foundEvent = mockEvents.find(e => e.id === eventId);
      setEvent(foundEvent || null);
      setIsLoading(false);
    }, 500);
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
  
  const isOpen = event ? shouldEventBeOpen(event.openingTime, event.closingTime) : false;
  const totalSeats = event?.sessions.reduce((acc, session) => acc + session.totalSeats, 0) || 0;
  const availableSeats = event?.sessions.reduce((acc, session) => acc + session.availableSeats, 0) || 0;
  
  return (
    <Layout isLoggedIn={true}>
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
                    <CountdownTimer targetDate={event.openingTime} />
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
