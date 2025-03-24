
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Reservation } from '@/lib/types';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Eye, X, Check, Clock, Calendar, User, MessageSquare } from 'lucide-react';
import { formatDate, formatTime } from '@/utils/dateUtils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExtendedReservation extends Reservation {
  userName?: string;
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

const AdminReservations = () => {
  const [reservations, setReservations] = useState<ExtendedReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ExtendedReservation | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchReservations();
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('id, name, content')
        .order('name');

      if (error) throw error;
      setTemplates(data || []);
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

      // Map the data to match our expected structure
      const mappedReservations: ExtendedReservation[] = data.map(item => ({
        id: item.id,
        userId: item.userid,
        eventId: item.eventid,
        sessionId: item.sessionid,
        numberOfSeats: item.numberofseats,
        status: item.status as "pending" | "confirmed" | "cancelled", // Explicitly cast to the union type
        createdAt: item.created_at,
        event: item.event,
        session: item.session,
        contactName: item.contact_name,
        phoneNumber: item.phone_number,
        allergyNotes: item.allergy_notes,
      }));

      // Fetch user names
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
    } catch (error) {
      console.error('Error fetching reservations:', error);
      toast.error('Failed to load reservations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (reservationId: string, newStatus: 'confirmed' | 'cancelled') => {
    try {
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      // Update the reservation status
      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId);

      if (error) throw error;

      // If we're cancelling a reservation, we need to free up the seats
      if (newStatus === 'cancelled' && reservation.status !== 'cancelled') {
        // Free up the seats by using a negative value for p_seats_to_reduce
        const { error: updateError } = await supabase.rpc('update_available_seats', {
          p_session_id: reservation.sessionId,
          p_seats_to_reduce: -reservation.numberOfSeats // negative to increase available seats
        });

        if (updateError) throw updateError;
      }

      // If we're confirming a previously cancelled reservation, we need to take the seats
      if (newStatus === 'confirmed' && reservation.status === 'cancelled') {
        // Take the seats by using a positive value for p_seats_to_reduce
        const { error: updateError } = await supabase.rpc('update_available_seats', {
          p_session_id: reservation.sessionId,
          p_seats_to_reduce: reservation.numberOfSeats
        });

        if (updateError) throw updateError;
      }

      toast.success(`Reservation ${newStatus === 'confirmed' ? 'confirmed' : 'cancelled'} successfully`);
      fetchReservations();
    } catch (error) {
      console.error(`Error updating reservation:`, error);
      toast.error('Failed to update reservation');
    }
  };

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

  const handleWhatsAppClick = (reservation: ExtendedReservation) => {
    setSelectedReservation(reservation);
    
    // Generate the WhatsApp message from template or default
    const message = generateWhatsAppTemplate(reservation);
    
    setWhatsappMessage(message);
    setSelectedTemplateId('');
    setShowWhatsAppDialog(true);
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

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    
    if (!selectedReservation) return;
    
    const template = templates.find(t => t.id === templateId);
    if (!template) return;
    
    // Replace placeholders with actual values
    const eventName = selectedReservation.event?.name || 'our event';
    const eventDate = selectedReservation.event?.date ? formatDate(selectedReservation.event.date) : 'the scheduled date';
    const sessionTime = selectedReservation.session?.time ? formatTime(selectedReservation.session.time) : 'the scheduled time';
    const seats = selectedReservation.numberOfSeats;
    const guestName = selectedReservation.contactName || 'Guest';
    
    let message = template.content;
    message = message.replace(/\{guestName\}/g, guestName);
    message = message.replace(/\{eventName\}/g, eventName);
    message = message.replace(/\{eventDate\}/g, eventDate);
    message = message.replace(/\{sessionTime\}/g, sessionTime);
    message = message.replace(/\{seats\}/g, seats.toString());
    
    setWhatsappMessage(message);
  };

  const handleSendWhatsApp = () => {
    if (!selectedReservation || !selectedReservation.phoneNumber) {
      toast.error("No phone number available for this reservation");
      return;
    }
    
    // Format the phone number (remove +62 if it exists, as we'll add it in the URL)
    let phoneNumber = selectedReservation.phoneNumber;
    if (phoneNumber.startsWith('+62')) {
      phoneNumber = phoneNumber.substring(3);
    } else if (phoneNumber.startsWith('62')) {
      phoneNumber = phoneNumber.substring(2);
    }
    
    // Format the phone number for WhatsApp (include country code)
    const formattedPhone = `62${phoneNumber}`;
    
    // Encode the message for a URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Create the WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    // Open in a new tab
    window.open(whatsappUrl, '_blank');
    
    // Close the dialog
    setShowWhatsAppDialog(false);
  };

  return (
    <Layout>
      <div className="container py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Reservations</h1>
          <Button variant="outline" onClick={() => navigate('/admin/message-templates')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Manage Message Templates
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
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
                      <TableCell className="text-right space-x-1">
                        {reservation.status !== 'confirmed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(reservation.id, 'confirmed')}
                            title="Confirm Reservation"
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                        )}
                        {reservation.status !== 'cancelled' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(reservation.id, 'cancelled')}
                            title="Cancel Reservation"
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                        {reservation.status === 'confirmed' && reservation.phoneNumber && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleWhatsAppClick(reservation)}
                            title="Send WhatsApp Message"
                          >
                            <MessageSquare className="h-4 w-4 text-green-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/event/${reservation.eventId}`)}
                          title="View Event"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* WhatsApp Message Dialog */}
      <Dialog open={showWhatsAppDialog} onOpenChange={setShowWhatsAppDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>WhatsApp Confirmation Message</DialogTitle>
            <DialogDescription>
              Choose a template or customize the message before sending.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">
                Choose Template
              </label>
              <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.length === 0 ? (
                    <SelectItem value="none" disabled>No templates available</SelectItem>
                  ) : (
                    templates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <Textarea 
              value={whatsappMessage} 
              onChange={(e) => setWhatsappMessage(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWhatsAppDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendWhatsApp} className="bg-green-600 hover:bg-green-700">
              <MessageSquare className="mr-2 h-4 w-4" />
              Open in WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminReservations;
