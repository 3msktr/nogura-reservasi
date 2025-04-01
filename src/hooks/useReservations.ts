import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Reservation, MessageTemplate } from '@/lib/types';
import { toast } from 'sonner';
import { DateRange } from 'react-day-picker';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { deleteReservation, updateReservation } from '@/services/reservationService';

interface ExtendedReservation extends Reservation {
  userName?: string;
}

export const useReservations = () => {
  const [reservations, setReservations] = useState<ExtendedReservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ExtendedReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  useEffect(() => {
    fetchReservations();
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      filterReservationsByDate();
    } else {
      setFilteredReservations(reservations);
    }
  }, [dateRange, reservations]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const formattedTemplates: MessageTemplate[] = (data || []).map(template => ({
        id: template.id,
        name: template.name,
        content: template.content,
        created_at: template.created_at
      }));
      
      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchReservations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          event:eventid (id, name, date),
          session:sessionid (time)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedReservations: ExtendedReservation[] = data.map(item => ({
        id: item.id,
        userId: item.userid,
        eventId: item.eventid,
        sessionId: item.sessionid,
        numberOfSeats: item.numberofseats,
        status: item.status as "pending" | "confirmed" | "cancelled",
        createdAt: item.created_at,
        event: item.event,
        session: item.session,
        contactName: item.contact_name,
        phoneNumber: item.phone_number,
        allergyNotes: item.allergy_notes,
      }));

      await Promise.all(
        mappedReservations.map(async (reservation) => {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('id', reservation.userId)
              .single();

            if (profileError) throw profileError;
            
            reservation.userName = profile?.full_name || 'Unknown User';
          } catch (error) {
            console.error(`Error fetching profile for ${reservation.userId}:`, error);
            reservation.userName = 'Unknown User';
          }
        })
      );

      setReservations(mappedReservations);
      setFilteredReservations(mappedReservations);
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setIsLoading(false);
    }
  };

  const filterReservationsByDate = () => {
    if (!dateRange.from && !dateRange.to) {
      setFilteredReservations(reservations);
      return;
    }

    const filtered = reservations.filter(reservation => {
      if (!reservation.event?.date) return false;
      
      const eventDate = new Date(reservation.event.date);
      
      if (dateRange.from && dateRange.to) {
        return eventDate >= dateRange.from && eventDate <= dateRange.to;
      } else if (dateRange.from) {
        return eventDate >= dateRange.from;
      } else if (dateRange.to) {
        return eventDate <= dateRange.to;
      }
      
      return true;
    });
    
    setFilteredReservations(filtered);
  };

  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined });
    setFilteredReservations(reservations);
    setShowDateFilter(false);
  };

  const handleUpdateStatus = async (reservationId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      const success = await updateReservation(reservationId, { status: newStatus });
      if (success) {
        fetchReservations();
      }
    } catch (error) {
      console.error(`Error updating reservation:`, error);
      toast.error('Failed to update reservation');
    }
  };

  const handleEditReservation = async (
    reservationId: string,
    updates: {
      numberOfSeats?: number;
      contactName?: string;
      phoneNumber?: string;
      allergyNotes?: string;
      status?: "confirmed" | "cancelled" | "pending";
    }
  ) => {
    try {
      const success = await updateReservation(reservationId, updates);
      if (success) {
        fetchReservations();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error editing reservation:`, error);
      toast.error('Failed to edit reservation');
      return false;
    }
  };

  const handleDeleteReservation = async (reservationId: string) => {
    try {
      const success = await deleteReservation(reservationId);
      if (success) {
        fetchReservations();
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Error deleting reservation:`, error);
      toast.error('Failed to delete reservation');
      return false;
    }
  };

  const generateWhatsAppTemplate = (reservation: ExtendedReservation): string => {
    const eventName = reservation.event?.name || 'our event';
    const eventDate = reservation.event?.date ? formatDate(reservation.event.date) : 'the scheduled date';
    const sessionTime = reservation.session?.time ? formatTime(reservation.session.time) : 'the scheduled time';
    const seats = reservation.numberOfSeats;
    const guestName = reservation.contactName || 'Guest';

    return `Hello ${guestName},

Your reservation for *${eventName}* has been confirmed!

🗓️ Date: ${eventDate}
⏰ Time: ${sessionTime}
👥 Seats: ${seats}

Please arrive 15 minutes before your scheduled time. We look forward to seeing you!

Best regards,
The Event Team`;
  };
  
  const applyTemplateToReservation = (templateId: string, reservation: ExtendedReservation): string => {
    if (!reservation) return '';
    
    const template = templates.find(t => t.id === templateId);
    if (!template) return generateWhatsAppTemplate(reservation);
    
    const eventName = reservation.event?.name || 'our event';
    const eventDate = reservation.event?.date ? formatDate(reservation.event.date) : 'the scheduled date';
    const sessionTime = reservation.session?.time ? formatTime(reservation.session.time) : 'the scheduled time';
    const seats = reservation.numberOfSeats;
    const guestName = reservation.contactName || 'Guest';
    
    let message = template.content;
    message = message.replace(/\{guestName\}/g, guestName);
    message = message.replace(/\{eventName\}/g, eventName);
    message = message.replace(/\{eventDate\}/g, eventDate);
    message = message.replace(/\{sessionTime\}/g, sessionTime);
    message = message.replace(/\{seats\}/g, seats.toString());
    
    return message;
  };

  const sendWhatsAppMessage = (phoneNumber: string, message: string) => {
    if (!phoneNumber) {
      toast.error("No phone number available for this reservation");
      return;
    }
    
    let formattedPhone = phoneNumber;
    if (formattedPhone.startsWith('+62')) {
      formattedPhone = formattedPhone.substring(3);
    } else if (formattedPhone.startsWith('62')) {
      formattedPhone = formattedPhone.substring(2);
    }
    
    formattedPhone = `62${formattedPhone}`;
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredReservations.map(reservation => ({
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

  return {
    reservations,
    filteredReservations,
    isLoading,
    dateRange,
    setDateRange,
    showDateFilter,
    setShowDateFilter,
    templates,
    clearDateFilter,
    handleUpdateStatus,
    handleEditReservation,
    handleDeleteReservation,
    generateWhatsAppTemplate,
    applyTemplateToReservation,
    sendWhatsAppMessage,
    exportToExcel
  };
};
