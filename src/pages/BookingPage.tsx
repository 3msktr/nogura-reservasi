
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Calendar, Clock, Minus, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Event, Session } from '@/lib/types';
import { formatDate, formatTime } from '@/utils/dateUtils';

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
  }, [eventId, navigate]);
  
  if (!event) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <div className="animate-pulse">Loading event details...</div>
        </div>
      </Layout>
    );
  }
  
  const handleSessionChange = (sessionId: string) => {
    setSelectedSession(sessionId);
    setSeatCount(1); // Reset seat count when changing session
  };
  
  const getSelectedSessionData = (): Session | undefined => {
    return event.sessions.find(session => session.id === selectedSession);
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
  
  return (
    <Layout isLoggedIn={true}>
      <div className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 animate-fade-in">
            <a 
              onClick={() => navigate("/")} 
              className="text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-4 inline-flex items-center"
            >
              ← Back to events
            </a>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">{event.name}</h1>
            <p className="text-muted-foreground mb-6">{event.description}</p>
            
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center text-sm bg-secondary px-4 py-2 rounded-full">
                <Calendar size={16} className="mr-2" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center text-sm bg-secondary px-4 py-2 rounded-full">
                <Users size={16} className="mr-2" />
                <span>Max {event.maxReservationsPerUser} seats per reservation</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="md:col-span-2 animate-slide-up">
              <div className="bg-white rounded-xl shadow-subtle border border-border p-6">
                <h2 className="text-xl font-semibold mb-4">Select a Session</h2>
                
                <div className="space-y-4">
                  {event.sessions.map(session => (
                    <div key={session.id} 
                      className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                        selectedSession === session.id 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'hover:bg-secondary border-border'
                      }`}
                      onClick={() => handleSessionChange(session.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Clock size={18} className="mr-2" />
                          <span className="font-medium">{formatTime(session.time)}</span>
                        </div>
                        <div className="text-sm">
                          <span>{session.availableSeats}</span> of <span>{session.totalSeats}</span> seats available
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {selectedSession && (
                  <div className="mt-8 animate-fade-in">
                    <h3 className="text-lg font-semibold mb-3">Number of Seats</h3>
                    <div className="flex items-center mb-6">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setSeatCount(Math.max(1, seatCount - 1))}
                        disabled={seatCount <= 1}
                      >
                        <Minus size={18} />
                      </Button>
                      <span className="w-12 text-center font-semibold">{seatCount}</span>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setSeatCount(Math.min(selectedSessionData?.availableSeats || 1, event.maxReservationsPerUser, seatCount + 1))}
                        disabled={seatCount >= (Math.min(selectedSessionData?.availableSeats || 1, event.maxReservationsPerUser))}
                      >
                        <Plus size={18} />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="animate-slide-up delay-100">
              <div className="bg-secondary rounded-xl p-6 sticky top-20">
                <h2 className="text-xl font-semibold mb-4">Reservation Summary</h2>
                
                {selectedSession ? (
                  <>
                    <div className="space-y-4 border-b border-border pb-4 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Event</span>
                        <span>{event.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span>{formatDate(event.date)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time</span>
                        <span>{formatTime(selectedSessionData?.time || "")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Seats</span>
                        <span>{seatCount}</span>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      size="lg"
                      disabled={isLoading} 
                      onClick={handleReservation}
                    >
                      {isLoading ? "Processing..." : "Confirm Reservation"}
                    </Button>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Please select a session to continue with your reservation.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingPage;
