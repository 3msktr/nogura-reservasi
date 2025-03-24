
import React from 'react';
import { Calendar, Users } from 'lucide-react';
import { Event } from '@/lib/types';
import { formatDate } from '@/utils/dateUtils';

interface EventDetailsProps {
  event: Event;
  onBack: () => void;
}

const EventDetails: React.FC<EventDetailsProps> = ({ event, onBack }) => {
  return (
    <div className="mb-10 animate-fade-in">
      <a 
        onClick={onBack} 
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
  );
};

export default EventDetails;
