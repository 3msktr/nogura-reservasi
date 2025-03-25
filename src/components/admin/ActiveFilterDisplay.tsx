
import React from 'react';
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { formatDate } from '@/utils/dateUtils';

interface ActiveFilterDisplayProps {
  dateRange: DateRange;
  resultCount: number;
  onClear: () => void;
}

const ActiveFilterDisplay = ({ dateRange, resultCount, onClear }: ActiveFilterDisplayProps) => {
  // Only show if there's an active filter
  if (!dateRange.from && !dateRange.to) return null;

  return (
    <div className="mb-4 p-2 bg-muted rounded-md flex items-center justify-between">
      <span className="text-sm">
        Filtering: {dateRange.from ? formatDate(dateRange.from.toISOString()) : 'Any start date'} 
        {' to '} 
        {dateRange.to ? formatDate(dateRange.to.toISOString()) : 'Any end date'}
        {' • '} 
        {resultCount} results
      </span>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Clear filter
      </Button>
    </div>
  );
};

export default ActiveFilterDisplay;
