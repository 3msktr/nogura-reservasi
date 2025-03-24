
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Event, Session } from '@/lib/types';
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
import { Trash2, Edit, Plus, ArrowLeft, Clock } from 'lucide-react';
import { formatTime, formatDate } from '@/utils/dateUtils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const AdminSessions = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentSession, setCurrentSession] = useState<Partial<Session> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const { toast: uiToast } = useToast();

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchSessions();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      setEvent({
        id: data.id,
        name: data.name,
        description: data.description,
        date: data.date,
        isOpen: data.isopen,
        openingTime: data.openingtime,
        closingTime: data.closingtime,
        maxReservationsPerUser: data.maxreservationsperuser,
        sessions: []
      });
    } catch (error) {
      console.error('Error fetching event details:', error);
      toast.error('Failed to load event details');
      navigate('/admin/events');
    }
  };

  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('eventid', eventId)
        .order('time', { ascending: true });

      if (error) throw error;

      setSessions(data.map(session => ({
        id: session.id,
        time: session.time,
        availableSeats: session.availableseats,
        totalSeats: session.totalseats,
        eventId: session.eventid
      })));
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      // Check if any reservations exist for this session
      const { data: reservations, error: checkError } = await supabase
        .from('reservations')
        .select('id')
        .eq('sessionid', id)
        .limit(1);

      if (checkError) throw checkError;

      if (reservations && reservations.length > 0) {
        toast.error('Cannot delete a session that has reservations');
        return;
      }

      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Session deleted successfully');
      fetchSessions();
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!currentSession || !eventId) return;
    
    try {
      const { time, totalSeats } = currentSession;
      
      if (!time || !totalSeats) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      const sessionData = {
        eventid: eventId,
        time,
        totalseats: totalSeats,
        availableseats: isEditing ? currentSession.availableSeats : totalSeats
      };
      
      if (isEditing && currentSession.id) {
        // Update existing session
        const { error } = await supabase
          .from('sessions')
          .update(sessionData)
          .eq('id', currentSession.id);
          
        if (error) throw error;
        toast.success('Session updated successfully');
      } else {
        // Create new session
        const { error } = await supabase
          .from('sessions')
          .insert([sessionData]);
          
        if (error) throw error;
        toast.success('Session created successfully');
      }
      
      setOpenDialog(false);
      setCurrentSession(null);
      fetchSessions();
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session');
    }
  };

  const openNewSessionDialog = () => {
    setCurrentSession({
      time: '09:00:00',
      totalSeats: 30,
      availableSeats: 30,
      eventId: eventId || ''
    });
    setIsEditing(false);
    setOpenDialog(true);
  };

  const openEditSessionDialog = (session: Session) => {
    setCurrentSession(session);
    setIsEditing(true);
    setOpenDialog(true);
  };

  const goBack = () => {
    navigate('/admin/events');
  };

  return (
    <Layout>
      <div className="container py-20">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={goBack}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
        </Button>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{event?.name || 'Sessions'}</h1>
            {event && (
              <p className="text-muted-foreground mt-1">
                {formatDate(event.date)}
              </p>
            )}
          </div>
          <Button onClick={openNewSessionDialog}>
            <Plus className="mr-2 h-4 w-4" /> Add New Session
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
                  <TableHead>Time</TableHead>
                  <TableHead>Available Seats</TableHead>
                  <TableHead>Total Seats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No sessions found. Create your first session!
                    </TableCell>
                  </TableRow>
                ) : (
                  sessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" /> 
                          {formatTime(session.time)}
                        </div>
                      </TableCell>
                      <TableCell>{session.availableSeats}</TableCell>
                      <TableCell>{session.totalSeats}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openEditSessionDialog(session)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDelete(session.id)}
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Edit Session' : 'Create New Session'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrUpdate}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Time
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={currentSession?.time?.substring(0, 5) || ''}
                    onChange={(e) => setCurrentSession({ ...currentSession, time: e.target.value + ':00' })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="totalSeats" className="text-right">
                    Total Seats
                  </Label>
                  <Input
                    id="totalSeats"
                    type="number"
                    min="1"
                    value={currentSession?.totalSeats || ''}
                    onChange={(e) => setCurrentSession({ ...currentSession, totalSeats: parseInt(e.target.value) })}
                    className="col-span-3"
                    required
                  />
                </div>
                {isEditing && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="availableSeats" className="text-right">
                      Available Seats
                    </Label>
                    <Input
                      id="availableSeats"
                      type="number"
                      min="0"
                      max={currentSession?.totalSeats || 0}
                      value={currentSession?.availableSeats || ''}
                      onChange={(e) => setCurrentSession({ ...currentSession, availableSeats: parseInt(e.target.value) })}
                      className="col-span-3"
                      required
                    />
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="submit">{isEditing ? 'Save Changes' : 'Create Session'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default AdminSessions;
