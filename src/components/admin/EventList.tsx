
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '@/utils/dateUtils';
import { Event } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Calendar, Edit, Lock, LockOpen, Trash2 } from 'lucide-react';

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (event: Event) => void;
}

const EventList = ({ events, isLoading, onEdit, onDelete, onToggleStatus }: EventListProps) => {
  const navigate = useNavigate();

  const handleViewSessions = (eventId: string) => {
    navigate(`/admin/events/${eventId}/sessions`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Sessions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No events found. Create your first event!
              </TableCell>
            </TableRow>
          ) : (
            events.map((event) => (
              <TableRow key={event.id}>
                <TableCell className="font-medium">{event.name}</TableCell>
                <TableCell>{formatDate(event.date)}</TableCell>
                <TableCell>
                  <EventStatusCell 
                    event={event} 
                    onToggleStatus={onToggleStatus} 
                  />
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleViewSessions(event.id)}
                  >
                    <Calendar className="h-4 w-4 mr-2" /> 
                    Manage Sessions
                  </Button>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => onEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

// Nested component for event status cell
const EventStatusCell = ({ event, onToggleStatus }: { event: Event; onToggleStatus: (event: Event) => void }) => (
  <div className="flex items-center gap-2">
    <span className={`px-2 py-1 rounded-full text-xs flex items-center ${event.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {event.isOpen ? (
        <>
          <LockOpen className="h-3 w-3 mr-1" />
          <span>Open</span>
        </>
      ) : (
        <>
          <Lock className="h-3 w-3 mr-1" />
          <span>Closed</span>
        </>
      )}
    </span>
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => onToggleStatus(event)}
    >
      {event.isOpen ? 'Close' : 'Open'}
    </Button>
  </div>
);

export default EventList;
