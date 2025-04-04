
import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ClockButton: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Update the time every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Format time as HH:MM:SS AM/PM with capitalized AM/PM
  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).replace(/(am|pm)/i, (match) => match.toUpperCase());
  
  return (
    <Button variant="ghost" className="flex items-left gap-2 text-center">
      <Clock size={16} />
      <span className="text-base font-semibold">{formattedTime}</span>
    </Button>
  );
};

export default ClockButton;
