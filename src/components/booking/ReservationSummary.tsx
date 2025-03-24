
import React from 'react';
import { Button } from '@/components/ui/button';
import { Event, Session } from '@/lib/types';
import { formatDate, formatTime } from '@/utils/dateUtils';

interface ReservationSummaryProps {
  event: Event;
  selectedSessionData?: Session;
  seatCount: number;
  isLoading: boolean;
  onReservation: () => void;
}

const ReservationSummary: React.FC<ReservationSummaryProps> = ({
  event,
  selectedSessionData,
  seatCount,
  isLoading,
  onReservation
}) => {
  return (
    <div className="bg-secondary rounded-xl p-6 sticky top-20">
      <h2 className="text-xl font-semibold mb-4">Reservation Summary</h2>
      
      {selectedSessionData ? (
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
              <span>{formatTime(selectedSessionData.time)}</span>
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
            onClick={onReservation}
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
  );
};

export default ReservationSummary;
