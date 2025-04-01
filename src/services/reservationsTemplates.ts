
import { MessageTemplate } from '@/lib/types';
import { supabase } from '@/integrations/supabase/client';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { ExtendedReservation } from './reservationsService';
import { toast } from 'sonner';

export const fetchMessageTemplates = async (): Promise<MessageTemplate[]> => {
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
    
    return formattedTemplates;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
};

export const generateDefaultWhatsAppTemplate = (reservation: ExtendedReservation): string => {
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

export const applyTemplateToReservation = (
  templateId: string, 
  templates: MessageTemplate[], 
  reservation: ExtendedReservation
): string => {
  if (!reservation) return '';
  
  const template = templates.find(t => t.id === templateId);
  if (!template) return generateDefaultWhatsAppTemplate(reservation);
  
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

export const sendWhatsAppMessage = (phoneNumber: string, message: string): void => {
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
