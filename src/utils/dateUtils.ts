
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(date);
};

export const calculateTimeRemaining = (targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} => {
  const target = new Date(targetDate).getTime();
  const now = new Date().getTime();
  const difference = target - now;
  
  // Return all zeros if the target date is in the past
  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      total: 0
    };
  }
  
  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((difference % (1000 * 60)) / 1000);
  
  return {
    days,
    hours,
    minutes,
    seconds,
    total: difference
  };
};

export const isEventOpen = (openingTime: string, closingTime: string): boolean => {
  const now = new Date();
  const opening = new Date(openingTime);
  const closing = new Date(closingTime);
  
  return now >= opening && now <= closing;
};
