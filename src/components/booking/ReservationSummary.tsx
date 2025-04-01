
import React from 'react';
import { Button } from '@/components/ui/button';
import { Event, Session } from '@/lib/types';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { CalendarClock, ChevronRight, Users, ShieldAlert } from 'lucide-react';

interface ReservationSummaryProps {
  event: Event;
  selectedSessionData?: Session;
  seatCount: number;
  isLoading: boolean;
  onReservation: () => void;
  isAdmin?: boolean;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  event,
  selectedSessionData,
  seatCount,
  isLoading,
  onReservation,
  isAdmin = false
}) => {
  const isEventOpen = event.isOpen;
  const isFormComplete = !!selectedSessionData && seatCount > 0;
  
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Reservation Summary</h3>
      
      <div className="space-y-4 mb-6">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Event</h4>
          <p className="font-medium">{event.name}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-1">Date</h4>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            <p>{formatDate(event.date)}</p>
          </div>
        </div>
        
        {selectedSessionData && (
          <>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Time</h4>
              <p>{formatTime(selectedSessionData.time)}</p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Seats</h4>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <p>{seatCount}</p>
              </div>
            </div>
          </>
        )}
      </div>
      
      {!isEventOpen && isAdmin && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-sm">
          <p className="font-medium text-amber-800 flex items-center gap-1">
            <ShieldAlert className="h-4 w-4" />
            Admin Override
          </p>
          <p className="text-amber-700">You can book this event even though it's not open for regular users.</p>
        </div>
      )}
      
      <Button 
        onClick={onReservation}
        disabled={!isFormComplete || (isLoading || (!isEventOpen && !isAdmin))}
        className="w-full"
      >
        {isAdmin && !isEventOpen ? "Admin Book Now" : "Proceed to Confirmation"}
        <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default ReservationSummary;
