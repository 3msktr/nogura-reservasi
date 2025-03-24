
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Reservation, MessageTemplate } from '@/lib/types';
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
import { Eye, X, Check, Clock, Calendar, User, MessageSquare, Download, Filter } from 'lucide-react';
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
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";

interface ExtendedReservation extends Reservation {
  userName?: string;
}

const AdminReservations = () => {
  const [reservations, setReservations] = useState<ExtendedReservation[]>([]);
  const [filteredReservations, setFilteredReservations] = useState<ExtendedReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWhatsAppDialog, setShowWhatsAppDialog] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<ExtendedReservation | null>(null);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  });
  const [showDateFilter, setShowDateFilter] = useState(false);
  const navigate = useNavigate();

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
      const reservation = reservations.find(r => r.id === reservationId);
      if (!reservation) return;

      const { error } = await supabase
        .from('reservations')
        .update({ status: newStatus })
        .eq('id', reservationId);

      if (error) throw error;

      if (newStatus === 'cancelled' && reservation.status !== 'cancelled') {
        const { error: updateError } = await supabase.rpc('update_available_seats', {
          p_session_id: reservation.sessionId,
          p_seats_to_reduce: -reservation.numberOfSeats
        });

        if (updateError) throw updateError;
      }

      if (newStatus === 'confirmed' && reservation.status === 'cancelled') {
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
    
    // Use the default WhatsApp template when opening the dialog
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
    
    let phoneNumber = selectedReservation.phoneNumber;
    if (phoneNumber.startsWith('+62')) {
      phoneNumber = phoneNumber.substring(3);
    } else if (phoneNumber.startsWith('62')) {
      phoneNumber = phoneNumber.substring(2);
    }
    
    const formattedPhone = `62${phoneNumber}`;
    
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    
    setShowWhatsAppDialog(false);
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

  return (
    <Layout>
      <div className="container py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">All Reservations</h1>
          <div className="flex items-center gap-2">
            <Popover open={showDateFilter} onOpenChange={setShowDateFilter}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter by Date
                  {(dateRange.from || dateRange.to) && (
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
                    <Button variant="outline" size="sm" onClick={clearDateFilter}>
                      Clear
                    </Button>
                    <Button size="sm" onClick={() => setShowDateFilter(false)}>
                      Apply
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" onClick={exportToExcel} className="gap-2">
              <Download className="h-4 w-4" />
              Export to Excel
            </Button>
            
            <Button variant="outline" onClick={() => navigate('/admin/message-templates')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Manage Templates
            </Button>
          </div>
        </div>
        
        {(dateRange.from || dateRange.to) && (
          <div className="mb-4 p-2 bg-muted rounded-md flex items-center justify-between">
            <span className="text-sm">
              Filtering: {dateRange.from ? formatDate(dateRange.from.toISOString()) : 'Any start date'} 
              {' to '} 
              {dateRange.to ? formatDate(dateRange.to.toISOString()) : 'Any end date'}
              {' • '} 
              {filteredReservations.length} results
            </span>
            <Button variant="ghost" size="sm" onClick={clearDateFilter}>
              Clear filter
            </Button>
          </div>
        )}

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
                {filteredReservations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No reservations found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReservations.map((reservation) => (
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
