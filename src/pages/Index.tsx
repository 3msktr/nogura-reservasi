
import React from 'react';
import Layout from '@/components/Layout';
import EventCard from '@/components/EventCard';
import Clock from '@/components/Clock';
import { useEvents } from '@/hooks/useEvents';
import { useSettings } from '@/hooks/useSettings';

const Index: React.FC = () => {
  const { events, isLoading } = useEvents();
  const { settings } = useSettings();

  return (
    <Layout>
      <section className="relative py-20 px-4 md:py-32 overflow-hidden">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Reservasi Nogura
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {settings.tagline_text || 'Halal Artisan Ramen. Crafted from Scratch, Served in a Bowl.'}
            </p>
          </div>
          
          <Clock 
            textColor={settings.clock_color} 
            iconSize={settings.clock_size}
            fontSize={settings.clock_font_size}
          />
          
          <div className="mt-12">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse text-lg">Loading events...</div>
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
        </div>
      </section>
      
      <section className="bg-secondary py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {settings.how_it_works_title || 'How It Works'}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {settings.how_it_works_description || 
                'Our unique war ticket reservation system ensures everyone has a fair chance to secure their seats.'}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            {(settings.how_it_works_steps || []).map((step, index) => (
              <div 
                key={index} 
                className="bg-background p-8 rounded-xl shadow-subtle flex flex-col items-center text-center animate-slide-up" 
                style={{ animationDelay: `${(index + 1) * 100}ms` }}
              >
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 text-lg font-medium">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
