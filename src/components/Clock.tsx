
import React, { useState, useEffect } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

const Clock: React.FC = () => {
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
    <div className="bg-background border border-border rounded-lg p-4 flex items-center justify-center shadow-sm mx-auto max-w-sm">
      <ClockIcon className="mr-2" size={20} />
      <p className="text-lg font-medium">{currentTime}</p>
    </div>
  );
};

export default Clock;
