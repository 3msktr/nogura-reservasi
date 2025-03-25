
import React from 'react';
import { Button } from "@/components/ui/button";
import { Filter } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { formatDate } from '@/utils/dateUtils';

interface DateFilterPopoverProps {
  showDateFilter: boolean;
  setShowDateFilter: (show: boolean) => void;
  dateRange: DateRange;
  setDateRange: (date: DateRange | undefined) => void;
  onClear: () => void;
  filteredCount?: number;
}

const DateFilterPopover = ({
  showDateFilter,
  setShowDateFilter,
  dateRange,
  setDateRange,
  onClear,
  filteredCount
}: DateFilterPopoverProps) => {
  const hasActiveFilter = dateRange.from || dateRange.to;

  return (
    <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter by Date
          {hasActiveFilter && (
            <span className="ml-1 h-2 w-2 rounded-full bg-primary"></span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="end">
        <div className="space-y-4">
          <h4 className="font-medium">Filter by Event Date</h4>
          <DateRangePicker
            date={dateRange}
            onDateChange={(date) => setDateRange(date)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear
            </Button>
            <Button size="sm" onClick={() => setShowDateFilter(false)}>
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DateFilterPopover;
