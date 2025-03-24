
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDate, formatTime, shouldEventBeOpen } from '@/utils/dateUtils';
import { Event } from '@/lib/types';
import CountdownTimer from './CountdownTimer';

interface EventCardProps {
  event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const isOpen = shouldEventBeOpen(event.openingTime, event.closingTime);
  const totalSeats = event.sessions.reduce((acc, session) => acc + session.totalSeats, 0);
  const availableSeats = event.sessions.reduce((acc, session) => acc + session.availableSeats, 0);
  
  return (
    <div className="bg-white rounded-xl shadow-subtle-lg border border-border overflow-hidden hover-lift animate-fade-in">
      <div className="p-6">
        <div className="flex flex-col mb-4">
          <h3 className="text-xl font-semibold mb-2">{event.name}</h3>
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
          
          {isOpen ? (
            <div className="mt-4">
              <Link to={`/booking/${event.id}`}>
                <Button className="w-full" size="lg">
                  Book Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="p-4 bg-secondary rounded-lg">
                <h4 className="text-sm font-medium mb-2 text-center">Reservations open in</h4>
                <CountdownTimer targetDate={event.openingTime} />
              </div>
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
