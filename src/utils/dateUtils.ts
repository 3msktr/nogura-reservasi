
export const formatDate = (dateString: string): string => {
  try {
    // Handle cases where the date might be invalid
    if (!dateString || dateString === "null" || dateString === "undefined") {
      return "Date not available";
    }
    
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.error("Invalid date in formatDate:", dateString);
      return "Invalid date";
    }
    
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Date error";
  }
};

export const formatTime = (timeString: string): string => {
  try {
    // Handle cases where the time might be invalid
    if (!timeString || timeString === "null" || timeString === "undefined") {
      return "Time not available";
    }
    
    // Check if timeString is in the format "HH:MM" 
    if (!/^\d{1,2}:\d{2}$/.test(timeString)) {
      // Try to handle ISO date format
      try {
        const date = new Date(timeString);
        if (!isNaN(date.getTime())) {
          return new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          }).format(date);
        }
      } catch (error) {
        console.error("Failed to parse time as date:", error);
      }
      
      console.error("Invalid time format:", timeString);
      return "Invalid time format";
    }
    
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    }).format(date);
  } catch (error) {
    console.error("Error formatting time:", error);
    return "Time error";
  }
};

export const calculateTimeRemaining = (targetDate: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
} => {
  try {
    // Handle invalid input
    if (!targetDate || targetDate === "null" || targetDate === "undefined") {
      console.error("Invalid target date provided to calculateTimeRemaining");
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    const target = new Date(targetDate).getTime();
    
    // Check if target date is valid
    if (isNaN(target)) {
      console.error("Invalid target date in calculateTimeRemaining:", targetDate);
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
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
  } catch (error) {
    console.error("Error calculating time remaining:", error);
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }
};

export const isEventOpen = (openingTime: string, closingTime: string): boolean => {
  try {
    // Handle invalid input
    if (!openingTime || !closingTime) {
      return false;
    }
    
    const now = new Date();
    const opening = new Date(openingTime);
    const closing = new Date(closingTime);
    
    // Check if dates are valid
    if (isNaN(opening.getTime()) || isNaN(closing.getTime())) {
      console.error("Invalid date in isEventOpen:", { openingTime, closingTime });
      return false;
    }
    
    return now >= opening && now <= closing;
  } catch (error) {
    console.error("Error in isEventOpen:", error);
    return false;
  }
};

// Using the more robust implementation from isEventOpen and removing the duplicate function
export const shouldEventBeOpen = (openingTime: string, closingTime: string): boolean => {
  return isEventOpen(openingTime, closingTime);
};

// Enhanced date validation
export const isValidDate = (dateString: string): boolean => {
  try {
    // Handle empty or null values
    if (!dateString || dateString === "null" || dateString === "undefined") {
      return false;
    }
    
    const date = new Date(dateString);
    const valid = !isNaN(date.getTime());
    
    if (!valid) {
      console.error("Invalid date detected:", dateString);
    }
    
    return valid;
  } catch (error) {
    console.error("Error validating date:", error);
    return false;
  }
};
