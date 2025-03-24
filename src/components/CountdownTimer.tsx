
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
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-center items-center space-x-2 md:space-x-4">
        <div className="flex flex-col items-center">
          <div className="text-base md:text-xl font-semibold w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-black text-white rounded-lg glass-dark animate-scale-in">
            {padWithZero(timeRemaining.days)}
          </div>
          <span className="text-xs mt-1 text-muted-foreground">DAYS</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-base md:text-xl font-semibold w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-black text-white rounded-lg glass-dark animate-scale-in delay-100">
            {padWithZero(timeRemaining.hours)}
          </div>
          <span className="text-xs mt-1 text-muted-foreground">HOURS</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-base md:text-xl font-semibold w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-black text-white rounded-lg glass-dark animate-scale-in delay-200">
            {padWithZero(timeRemaining.minutes)}
          </div>
          <span className="text-xs mt-1 text-muted-foreground">MINS</span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="text-base md:text-xl font-semibold w-12 h-12 md:w-14 md:h-14 flex items-center justify-center bg-black text-white rounded-lg glass-dark animate-scale-in delay-300">
            {padWithZero(timeRemaining.seconds)}
          </div>
          <span className="text-xs mt-1 text-muted-foreground">SECS</span>
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
