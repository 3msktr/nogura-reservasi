
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner = ({ size = 'md', text }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div
        className={`animate-spin rounded-full border-t-transparent border-primary ${sizeClasses[size]}`}
        role="status"
        aria-label="loading"
      />
      {text && <p className="text-muted-foreground animate-pulse">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
