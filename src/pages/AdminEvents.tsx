
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/lib/types';
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
import { Trash2, Edit, Plus, Calendar, LockOpen, Lock } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<Event> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      setEvents(data.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        date: event.date,
        isOpen: event.isopen,
        openingTime: event.openingtime,
        closingTime: event.closingtime,
        maxReservationsPerUser: event.maxreservationsperuser,
        sessions: []
      })));
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // First delete all sessions associated with this event
      const { error: sessionsError } = await supabase
        .from('sessions')
        .delete()
        .eq('eventid', id);
      
      if (sessionsError) throw sessionsError;

      // Then delete the event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const toggleEventStatus = async (event: Event) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({ isopen: !event.isOpen })
        .eq('id', event.id);

      if (error) throw error;

      toast.success(`Event ${!event.isOpen ? 'opened' : 'closed'} for reservations`);
      fetchEvents();
    } catch (error) {
      console.error('Error toggling event status:', error);
      toast.error('Failed to update event status');
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentEvent) return;
    
    try {
      const { name, description, date, openingTime, isOpen, maxReservationsPerUser } = currentEvent;
      
      if (!name || !date) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const eventData = {
        name,
        description: description || '',
        date,
        openingtime: openingTime || new Date().toISOString(),
        // Add closingtime with default value (now)
        closingtime: new Date().toISOString(),
        isopen: isOpen !== undefined ? isOpen : false,
        maxreservationsperuser: maxReservationsPerUser || 4
      };
      
      if (isEditing && currentEvent.id) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', currentEvent.id);
          
        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([eventData]);
          
        if (error) throw error;
        toast.success('Event created successfully');
      }
      
      setOpenDialog(false);
      setCurrentEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    }
  };

  const handleViewSessions = (eventId: string) => {
    navigate(`/admin/events/${eventId}/sessions`);
  };

  const openNewEventDialog = () => {
    setCurrentEvent({
      name: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      openingTime: new Date().toISOString(),
      isOpen: false,
      maxReservationsPerUser: 4
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const openEditEventDialog = (event: Event) => {
    setCurrentEvent(event);
    setIsEditing(true);
    setOpenDialog(true);
  };

  return (
    <Layout>
      <div className="container py-20">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <Button onClick={openNewEventDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add New Event
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
                            onClick={() => toggleEventStatus(event)}
                          >
                            {event.isOpen ? 'Close' : 'Open'}
                          </Button>
                        </div>
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
                          onClick={() => openEditEventDialog(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(event.id)}
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
        )}

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={currentEvent?.name || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, name: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={currentEvent?.description || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={currentEvent?.date?.substring(0, 10) || ''}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, date: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="isOpen" className="text-right">
                    Status
                  </Label>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Switch
                      id="isOpen"
                      checked={currentEvent?.isOpen || false}
                      onCheckedChange={(checked) => setCurrentEvent({ ...currentEvent, isOpen: checked })}
                    />
                    <Label htmlFor="isOpen" className="text-sm text-muted-foreground">
                      {currentEvent?.isOpen ? 'Open for Reservations' : 'Closed for Reservations'}
                    </Label>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxReservations" className="text-right">
                    Max Reservations
                  </Label>
                  <Input
                    id="maxReservations"
                    type="number"
                    min="1"
                    value={currentEvent?.maxReservationsPerUser || 4}
                    onChange={(e) => setCurrentEvent({ ...currentEvent, maxReservationsPerUser: parseInt(e.target.value) })}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{isEditing ? 'Save Changes' : 'Create Event'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminEvents;
