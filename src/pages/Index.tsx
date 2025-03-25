
import React from 'react';
import Layout from '@/components/Layout';
import EventCard from '@/components/EventCard';
import { useEvents } from '@/hooks/useEvents';

const Index: React.FC = () => {
  const { events, isLoading } = useEvents();

  return (
    <Layout>
      <section className="relative py-20 px-4 md:py-32 overflow-hidden">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Sistem Reservasi<br />Restoran Nogura
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Amankan tempat Anda di acara makan eksklusif kami. Ketersediaan terbatas, pengalaman luar biasa.
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-lg">Memuat acara...</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map((event, index) => (
                <div key={event.id} style={{ animationDelay: `${index * 100}ms` }}>
                  <EventCard event={event} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      <section className="bg-secondary py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cara Kerjanya</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Sistem reservasi tiket war kami yang unik memastikan semua orang memiliki kesempatan yang sama untuk mendapatkan tempat mereka.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="bg-background p-8 rounded-xl shadow-subtle flex flex-col items-center text-center animate-slide-up delay-100">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 text-lg font-medium">1</div>
              <h3 className="text-xl font-semibold mb-2">Pantau Timer</h3>
              <p className="text-muted-foreground">Pantau timer countdown untuk mengetahui kapan reservasi akan dibuka.</p>
            </div>
            
            <div className="bg-background p-8 rounded-xl shadow-subtle flex flex-col items-center text-center animate-slide-up delay-200">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 text-lg font-medium">2</div>
              <h3 className="text-xl font-semibold mb-2">Pilih Sesi Anda</h3>
              <p className="text-muted-foreground">Pilih slot waktu yang Anda inginkan dari sesi yang tersedia.</p>
            </div>
            
            <div className="bg-background p-8 rounded-xl shadow-subtle flex flex-col items-center text-center animate-slide-up delay-300">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 text-lg font-medium">3</div>
              <h3 className="text-xl font-semibold mb-2">Konfirmasi Tempat Anda</h3>
              <p className="text-muted-foreground">Segera amankan reservasi Anda sebelum semua tempat terisi.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
