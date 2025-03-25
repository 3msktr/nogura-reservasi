
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
        Filter: {dateRange.from ? formatDate(dateRange.from.toISOString()) : 'Tanggal mulai apapun'} 
        {' sampai '} 
        {dateRange.to ? formatDate(dateRange.to.toISOString()) : 'Tanggal akhir apapun'}
        {' • '} 
        {resultCount} hasil
      </span>
      <Button variant="ghost" size="sm" onClick={onClear}>
        Hapus filter
      </Button>
    </div>
  );
};

export default ActiveFilterDisplay;
