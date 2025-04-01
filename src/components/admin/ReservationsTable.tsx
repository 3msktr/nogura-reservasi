
import React from 'react';
import { Reservation } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar, Clock, User } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/dateUtils';
import ReservationActions from './ReservationActions';

interface ExtendedReservation extends Reservation {
  userName?: string;
}

interface ReservationsTableProps {
  reservations: ExtendedReservation[];
  isLoading: boolean;
  onUpdateStatus: (id: string, newStatus: 'confirmed' | 'cancelled') => void;
  onWhatsAppClick: (reservation: ExtendedReservation) => void;
  onEditClick: (reservation: ExtendedReservation) => void;
  onDeleteClick: (reservation: ExtendedReservation) => void;
}

const ReservationsTable = ({
  reservations,
  isLoading,
  onUpdateStatus,
  onWhatsAppClick,
  onEditClick,
  onDeleteClick
}: ReservationsTableProps) => {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
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
            <TableHead>User</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Seats</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                No reservations found.
              </TableCell>
            </TableRow>
          ) : (
            reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4 text-muted-foreground" />
                    {reservation.userName}
                  </div>
                </TableCell>
                <TableCell>
                  {reservation.contactName ? (
                    <div className="flex flex-col text-sm">
                      <span>{reservation.contactName}</span>
                      {reservation.phoneNumber && (
                        <span className="text-muted-foreground">{reservation.phoneNumber}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">No contact info</span>
                  )}
                </TableCell>
                <TableCell>
                  {reservation.event?.name || 'Unknown Event'}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="flex items-center">
                      <Calendar className="mr-1 h-3 w-3 text-muted-foreground" />
                      {reservation.event?.date ? formatDate(reservation.event.date) : 'Unknown Date'}
                    </span>
                    <span className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {reservation.session?.time ? formatTime(reservation.session.time) : 'Unknown Time'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{reservation.numberOfSeats}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(reservation.status)}`}>
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <ReservationActions 
                    id={reservation.id}
                    eventId={reservation.eventId}
                    status={reservation.status}
                    phoneNumber={reservation.phoneNumber}
                    onUpdateStatus={onUpdateStatus}
                    onWhatsAppClick={() => onWhatsAppClick(reservation)}
                    onEditClick={() => onEditClick(reservation)}
                    onDeleteClick={() => onDeleteClick(reservation)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ReservationsTable;
