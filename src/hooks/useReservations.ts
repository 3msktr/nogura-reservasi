
import { useState, useEffect } from 'react';
import { DateRange } from 'react-day-picker';
import { MessageTemplate } from '@/lib/types';
import { 
  fetchReservations, 
  updateReservationStatus, 
  ExtendedReservation
} from '@/services/reservationsService';
import { 
  fetchMessageTemplates, 
  generateDefaultWhatsAppTemplate, 
  applyTemplateToReservation, 
  sendWhatsAppMessage 
} from '@/services/reservationsTemplates';
import { exportReservationsToExcel } from '@/services/reservationsExport';

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

  // Fetch reservations and templates on component mount
  useEffect(() => {
    loadReservations();
    loadTemplates();
  }, []);

  // Apply date filter when date range or reservations change
  useEffect(() => {
    if (dateRange.from || dateRange.to) {
      filterReservationsByDate();
    } else {
      setFilteredReservations(reservations);
    }
  }, [dateRange, reservations]);

  const loadTemplates = async () => {
    const templates = await fetchMessageTemplates();
    setTemplates(templates);
  };

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const data = await fetchReservations();
      setReservations(data);
      setFilteredReservations(data);
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
    await updateReservationStatus(reservationId, newStatus, loadReservations);
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
    generateWhatsAppTemplate: generateDefaultWhatsAppTemplate,
    applyTemplateToReservation: (templateId: string, reservation: ExtendedReservation) => 
      applyTemplateToReservation(templateId, templates, reservation),
    sendWhatsAppMessage,
    exportToExcel: () => exportReservationsToExcel(filteredReservations)
  };
};
