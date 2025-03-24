
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Lock, LockOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { Event } from '@/lib/types';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const totalSeats = event.sessions.reduce((acc, session) => acc + session.totalSeats, 0);
  const availableSeats = event.sessions.reduce((acc, session) => acc + session.availableSeats, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-subtle-lg border border-border overflow-hidden hover-lift animate-fade-in">
      <div className="p-6">
        <div className="flex flex-col mb-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold">{event.name}</h3>
            <div className={`px-2 py-1 rounded-full text-xs flex items-center ${event.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {event.isOpen ? (
                <>
                  <LockOpen className="h-3 w-3 mr-1" />
                  <span>Open</span>
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  <span>Closed</span>
                </>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{event.description}</p>
          
          <div className="flex flex-col space-y-2 mb-6">
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar size={16} className="mr-2" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock size={16} className="mr-2" />
              <span>{event.sessions.length} sessions available</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Users size={16} className="mr-2" />
              <span>{availableSeats} of {totalSeats} seats available</span>
            </div>
          </div>
          
          {event.isOpen ? (
            <div className="mt-4">
              <Link to={`/booking/${event.id}`}>
                <Button className="w-full" size="lg">
                  Book Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4">
              <Link to={`/event/${event.id}`}>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
