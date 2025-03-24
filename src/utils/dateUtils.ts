
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

// Simplified isEventOpen and shouldEventBeOpen to just rely on the isOpen flag from the database
export const isEventOpen = (event: { isOpen: boolean }): boolean => {
  return event.isOpen;
};

export const shouldEventBeOpen = (event: { isOpen: boolean }): boolean => {
  return isEventOpen(event);
};

// Enhanced date validation
export const isValidDate = (dateString: string): boolean => {
  try {
    // Handle empty or null values
    if (!dateString || dateString === "null" || dateString === "undefined") {
      return false;
    }
    
    // If dateString is just a time (e.g., "09:00:00"), it's valid for our purposes
    if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(dateString)) {
      return true;
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
