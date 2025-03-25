
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Users, Lock, LockOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Layout from '@/components/Layout';
import { Event } from '@/lib/types';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { getEventById } from '@/services/eventService';
import { toast } from 'sonner';

const EventDetailPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) {
        console.error('No eventId provided');
        toast.error('ID Acara tidak ada');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching event with ID:', eventId);
        const data = await getEventById(eventId);
        
        if (!data) {
          console.error('Event not found:', eventId);
          toast.error('Acara tidak ditemukan');
          setIsLoading(false);
          return;
        }
        
        console.log('Event data received:', data);
        setEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
        toast.error('Gagal memuat detail acara');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvent();
  }, [eventId]);
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 flex items-center justify-center">
          <div className="animate-pulse">Memuat detail acara...</div>
        </div>
      </Layout>
    );
  }
  
  if (!event) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Acara Tidak Ditemukan</h2>
            <p className="mb-6">Acara yang Anda cari tidak ada atau telah dihapus.</p>
            <Link to="/">
              <Button>Kembali ke Acara</Button>
            </Link>
          </div>
        </div>
      </Layout>
    );
  }
  
  const totalSeats = event.sessions.reduce((acc, session) => acc + session.totalSeats, 0) || 0;
  const availableSeats = event.sessions.reduce((acc, session) => acc + session.availableSeats, 0) || 0;
  
  return (
    <Layout>
      <div className="container py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/" 
            className="text-sm text-muted-foreground hover:text-foreground cursor-pointer mb-4 inline-flex items-center"
          >
            ← Kembali ke acara
          </Link>
          
          <div className="bg-white rounded-xl shadow-subtle border border-border overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold">{event.name}</h1>
                <div className={`px-3 py-1 rounded-full text-sm flex items-center ${event.isOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {event.isOpen ? (
                    <>
                      <LockOpen className="h-4 w-4 mr-1" />
                      <span>Terbuka untuk Booking</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-1" />
                      <span>Tutup untuk Booking</span>
                    </>
                  )}
                </div>
              </div>
              
              <p className="text-muted-foreground mb-6">{event.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center text-sm bg-secondary px-4 py-2 rounded-full">
                  <Calendar size={16} className="mr-2" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <div className="flex items-center text-sm bg-secondary px-4 py-2 rounded-full">
                  <Clock size={16} className="mr-2" />
                  <span>{event.sessions.length} sesi tersedia</span>
                </div>
                <div className="flex items-center text-sm bg-secondary px-4 py-2 rounded-full">
                  <Users size={16} className="mr-2" />
                  <span>{availableSeats} dari {totalSeats} kursi tersedia</span>
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Sesi yang Tersedia</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {event.sessions.map((session) => (
                    <div key={session.id} className="bg-secondary rounded-lg p-4">
                      <div className="font-medium mb-2">{formatTime(session.time)}</div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {session.availableSeats} dari {session.totalSeats} kursi tersedia
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {event.isOpen ? (
                <div className="mt-8">
                  <Link to={`/booking/${event.id}`}>
                    <Button size="lg">Lanjut ke Booking</Button>
                  </Link>
                </div>
              ) : (
                <div className="mt-8 bg-secondary rounded-xl p-6">
                  <h3 className="text-lg font-medium mb-4 text-center">Reservasi Tidak Tersedia</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    Acara ini saat ini tidak terbuka untuk reservasi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EventDetailPage;
