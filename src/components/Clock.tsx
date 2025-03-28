
import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

interface ClockProps {
  textColor?: string;
  iconSize?: number;
}

const Clock: React.FC<ClockProps> = ({ 
  textColor = 'text-muted-foreground',
  iconSize = 18 
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      });
      setCurrentTime(formattedTime);
    };
    
    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="flex items-center justify-center py-2 mx-auto animate-fade-in">
      <ClockIcon className={`mr-2 ${textColor}`} size={iconSize} />
      <p className={`text-base font-medium ${textColor}`}>{currentTime}</p>
    </div>
  );
};

export default Clock;
