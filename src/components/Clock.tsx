
import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';
import { formatDistance } from 'date-fns';
import { useEvents } from '@/hooks/useEvents';

const Clock: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [nextEventDate, setNextEventDate] = useState<Date | null>(null);
  const [showClock, setShowClock] = useState(false);
  const { events } = useEvents();
  
  useEffect(() => {
    // Find the next upcoming event that's not open yet
    if (events && events.length > 0) {
      const upcomingEvents = events
        .filter(event => !event.isOpen && new Date(event.date) > new Date())
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      if (upcomingEvents.length > 0) {
        const nextEvent = upcomingEvents[0];
        const eventDate = new Date(nextEvent.date);
        
        // Subtract 1 day to show the clock when it's 1 day before the event
        const openingDate = new Date(eventDate);
        openingDate.setDate(openingDate.getDate() - 1);
        
        setNextEventDate(openingDate);
        
        // Only show the clock if the event is opening within the next 7 days
        const today = new Date();
        const daysDifference = Math.ceil((openingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference <= 7) {
          setShowClock(true);
        }
      }
    }
  }, [events]);
  
  useEffect(() => {
    if (!nextEventDate) return;
    
    const updateRemainingTime = () => {
      const now = new Date();
      
      if (now >= nextEventDate) {
        setTimeRemaining('Reservations are opening now!');
        return;
      }
      
      const distance = formatDistance(nextEventDate, now, { addSuffix: true });
      setTimeRemaining(`Reservations open ${distance}`);
    };
    
    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);
    
    return () => clearInterval(interval);
  }, [nextEventDate]);
  
  if (!showClock) return null;
  
  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-6 flex flex-col items-center animate-pulse hover:animate-none transition-all shadow-lg mx-auto max-w-md">
      <div className="flex items-center mb-2">
        <ClockIcon className="mr-2" size={24} />
        <h3 className="text-xl font-semibold">Countdown to Reservations</h3>
      </div>
      <p className="text-lg font-medium text-center">{timeRemaining}</p>
    </div>
  );
};

export default Clock;
