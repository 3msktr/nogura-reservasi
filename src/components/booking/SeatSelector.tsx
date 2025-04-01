
import React from 'react';
import { Minus, Plus, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SeatSelectorProps {
  seatCount: number;
  setSeatCount: (count: number) => void;
  maxSeats: number;
  minSeats?: number;
  isAdmin?: boolean;
}

const SeatSelector: React.FC<SeatSelectorProps> = ({
  seatCount,
  setSeatCount,
  maxSeats,
  minSeats = 1,
  isAdmin = false
}) => {
  return (
    <div className="mt-8 animate-fade-in">
      <h3 className="text-lg font-semibold mb-3">Number of Seats</h3>
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setSeatCount(Math.max(minSeats, seatCount - 1))}
          disabled={seatCount <= minSeats}
        >
          <Minus size={18} />
        </Button>
        <span className="w-12 text-center font-semibold">{seatCount}</span>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setSeatCount(Math.min(maxSeats, seatCount + 1))}
          disabled={seatCount >= maxSeats}
        >
          <Plus size={18} />
        </Button>
      </div>
      
      {isAdmin && (
        <p className="text-sm text-blue-600 flex items-center gap-1">
          <ShieldAlert className="h-3.5 w-3.5" />
          Admin can book up to {maxSeats} seats
        </p>
      )}
    </div>
  );
};

export default SeatSelector;
