
import React, { useState, useEffect } from 'react';
import { calculateTimeRemaining } from '@/utils/dateUtils';

interface CountdownTimerProps {
  targetDate: string;
  onComplete?: () => void;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ 
  targetDate,
  onComplete 
}) => {
  const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(targetDate));
  
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateTimeRemaining(targetDate);
      setTimeRemaining(remaining);
      
      if (remaining.total <= 0) {
        clearInterval(timer);
        onComplete && onComplete();
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate, onComplete]);
  
  const padWithZero = (num: number) => {
    return num.toString().padStart(2, '0');
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-center items-center space-x-4 md:space-x-6">
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-4xl font-semibold w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-black text-white rounded-lg glass-dark animate-scale-in">
            {padWithZero(timeRemaining.days)}
          </div>
          <span className="text-xs md:text-sm mt-2 text-muted-foreground">DAYS</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-4xl font-semibold w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-black text-white rounded-lg glass-dark animate-scale-in delay-100">
            {padWithZero(timeRemaining.hours)}
          </div>
          <span className="text-xs md:text-sm mt-2 text-muted-foreground">HOURS</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-4xl font-semibold w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-black text-white rounded-lg glass-dark animate-scale-in delay-200">
            {padWithZero(timeRemaining.minutes)}
          </div>
          <span className="text-xs md:text-sm mt-2 text-muted-foreground">MINUTES</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-2xl md:text-4xl font-semibold w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-black text-white rounded-lg glass-dark animate-scale-in delay-300">
            {padWithZero(timeRemaining.seconds)}
          </div>
          <span className="text-xs md:text-sm mt-2 text-muted-foreground">SECONDS</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
