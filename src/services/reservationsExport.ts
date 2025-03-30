
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { ExtendedReservation } from './reservationsService';
import { toast } from 'sonner';

export const exportReservationsToExcel = (reservations: ExtendedReservation[]): void => {
  try {
    const exportData = reservations.map(reservation => ({
      'Event': reservation.event?.name || 'Unknown Event',
      'Date': reservation.event?.date ? formatDate(reservation.event.date) : 'Unknown Date',
      'Time': reservation.session?.time ? formatTime(reservation.session.time) : 'Unknown Time',
      'Status': reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1),
      'User': reservation.userName,
      'Contact Name': reservation.contactName || 'N/A',
      'Phone': reservation.phoneNumber || 'N/A',
      'Seats': reservation.numberOfSeats,
      'Allergy Notes': reservation.allergyNotes || 'None',
      'Reservation Date': new Date(reservation.createdAt).toLocaleDateString()
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Reservations');
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const fileName = `Reservations_${today}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
    
    toast.success('Reservations exported successfully');
  } catch (error) {
    console.error('Error exporting reservations:', error);
    toast.error('Failed to export reservations');
  }
};
