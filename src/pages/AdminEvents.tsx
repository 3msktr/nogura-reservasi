
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Event } from '@/lib/types';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { formatTimeForDB } from '@/utils/dateUtils';
import EventList from '@/components/admin/EventList';
import EventFormDialog from '@/components/admin/EventFormDialog';

const AdminEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<Event> | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
      
      // Format the openingTime and closingTime properly for DB storage
      const now = new Date();
      const formattedOpeningTime = openingTime ? formatTimeForDB(openingTime) : formatTimeForDB(now.toISOString());
      const formattedClosingTime = formatTimeForDB(now.toISOString());
      
      const eventData = {
        name,
        description: description || '',
        date,
        openingtime: formattedOpeningTime,
        closingtime: formattedClosingTime,
        isopen: isOpen !== undefined ? isOpen : false,
        maxreservationsperuser: maxReservationsPerUser || 4
      };
      
      console.log('Saving event with data:', eventData);
      
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

  const handleFieldChange = (field: string, value: any) => {
    if (currentEvent) {
      setCurrentEvent({ ...currentEvent, [field]: value });
    }
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

        <EventList 
          events={events}
          isLoading={isLoading}
          onEdit={openEditEventDialog}
          onDelete={handleDelete}
          onToggleStatus={toggleEventStatus}
        />

        <EventFormDialog
          open={openDialog}
          onOpenChange={setOpenDialog}
          currentEvent={currentEvent}
          isEditing={isEditing}
          onSubmit={handleCreateOrUpdate}
          onFieldChange={handleFieldChange}
        />
      </div>
    </Layout>
  );
};

export default AdminEvents;
