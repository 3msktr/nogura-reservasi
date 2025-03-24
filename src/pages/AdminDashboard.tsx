import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Edit, Plus, Trash, Users } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
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

const AdminDashboard: React.FC = () => {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const navigate = useNavigate();
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setEvents(prevEvents => 
        prevEvents.map(event => {
          const shouldBeOpen = shouldEventBeOpen(event.openingTime, event.closingTime);
          
          if (event.isOpen !== shouldBeOpen) {
            if (shouldBeOpen) {
              toast.success(`Event "${event.name}" has automatically opened for reservations`);
            } else {
              toast.info(`Event "${event.name}" has automatically closed for reservations`);
            }
            return { ...event, isOpen: shouldBeOpen };
          }
          return event;
        })
      );
    }, 60000);
    
    setEvents(prevEvents => 
      prevEvents.map(event => {
        const shouldBeOpen = shouldEventBeOpen(event.openingTime, event.closingTime);
        return { ...event, isOpen: shouldBeOpen };
      })
    );
    
    return () => clearInterval(intervalId);
  }, []);
  
  const toggleEventStatus = (eventId: string) => {
    setEvents(prev => 
      prev.map(event => {
        if (event.id === eventId) {
          const updatedEvent = {...event, isOpen: !event.isOpen};
          toast.success(`Event "${event.name}" is now ${updatedEvent.isOpen ? 'open' : 'closed'} for reservations`);
          return updatedEvent;
        }
        return event;
      })
    );
  };
  
  const deleteEvent = (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (eventToDelete) {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success(`Event "${eventToDelete.name}" has been deleted`);
    }
  };
  
  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Button className="flex items-center gap-2">
            <Plus size={16} />
            <span>Create New Event</span>
          </Button>
        </div>
        
        <div className="bg-white rounded-xl shadow-subtle border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4">Event</th>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Sessions</th>
                  <th className="text-left p-4">Capacity</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => {
                  const autoManaged = shouldEventBeOpen(event.openingTime, event.closingTime) === event.isOpen;
                  
                  return (
                    <tr key={event.id} className="border-b border-border hover:bg-secondary/30">
                      <td className="p-4">
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">{event.description}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm">
                          <Calendar size={14} className="mr-2" />
                          {formatDate(event.date)}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm">
                          <Clock size={14} className="mr-2" />
                          {event.sessions.length} sessions
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {event.sessions.map(session => formatTime(session.time)).join(', ')}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center text-sm">
                          <Users size={14} className="mr-2" />
                          {event.sessions.reduce((acc, session) => acc + session.totalSeats, 0)} total seats
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Max {event.maxReservationsPerUser} per user
                        </div>
                      </td>
                      <td className="p-4">
                        {event.isOpen ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Open
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Closed
                          </span>
                        )}
                        <div className="text-xs text-muted-foreground mt-1">
                          {autoManaged ? "Auto-managed" : "Manually set"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => toggleEventStatus(event.id)}
                            className={autoManaged ? "bg-secondary/50" : ""}
                            title={autoManaged ? "This event is automatically managed based on its scheduled times" : "Override automatic status"}
                          >
                            {event.isOpen ? 'Close Event' : 'Open Event'}
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Edit size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => deleteEvent(event.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
