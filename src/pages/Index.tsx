
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import EventCard from '@/components/EventCard';
import { Event } from '@/lib/types';

// Mock data for events
const mockEvents: Event[] = [
  {
    id: "1",
    name: "Spring Tasting Menu",
    description: "Experience our exclusive spring tasting menu featuring the finest seasonal ingredients, prepared with precision and artistry by our executive chef.",
    date: "2024-06-30",
    isOpen: false,
    openingTime: "2024-06-25T10:00:00",
    closingTime: "2024-06-30T18:00:00",
    maxReservationsPerUser: 4,
    sessions: [
      {
        id: "s1",
        time: "13:00",
        availableSeats: 20,
        totalSeats: 30,
        eventId: "1"
      },
      {
        id: "s2",
        time: "17:00",
        availableSeats: 25,
        totalSeats: 30,
        eventId: "1"
      },
      {
        id: "s3",
        time: "20:00",
        availableSeats: 15,
        totalSeats: 30,
        eventId: "1"
      }
    ]
  },
  {
    id: "2",
    name: "Chef's Table Experience",
    description: "Join us for an intimate dining experience at our Chef's Table. Watch as our culinary team prepares an exclusive tasting menu right before your eyes.",
    date: "2024-07-15",
    isOpen: true,
    openingTime: "2024-06-20T10:00:00",
    closingTime: "2024-07-14T23:59:59",
    maxReservationsPerUser: 2,
    sessions: [
      {
        id: "s4",
        time: "16:00",
        availableSeats: 8,
        totalSeats: 10,
        eventId: "2"
      },
      {
        id: "s5",
        time: "21:00",
        availableSeats: 6,
        totalSeats: 10,
        eventId: "2"
      }
    ]
  },
  {
    id: "3",
    name: "Summer Wine Pairing Dinner",
    description: "A special evening featuring a six-course tasting menu perfectly paired with exceptional wines from around the world, selected by our sommelier.",
    date: "2024-08-05",
    isOpen: false,
    openingTime: "2024-07-25T10:00:00",
    closingTime: "2024-08-04T23:59:59",
    maxReservationsPerUser: 4,
    sessions: [
      {
        id: "s6",
        time: "14:00",
        availableSeats: 30,
        totalSeats: 40,
        eventId: "3"
      },
      {
        id: "s7",
        time: "20:00",
        availableSeats: 25,
        totalSeats: 40,
        eventId: "3"
      }
    ]
  }
];

const Index: React.FC = () => {
  const [events] = useState<Event[]>(mockEvents);

  return (
    <Layout>
      <section className="relative py-20 px-4 md:py-32 overflow-hidden">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Nogura Restaurant<br />Reservation System
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Secure your seat at our exclusive dining events. Limited availability, extraordinary experiences.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, index) => (
              <div key={event.id} style={{ animationDelay: `${index * 100}ms` }}>
                <EventCard event={event} />
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="bg-secondary py-20 px-4">
        <div className="container max-w-7xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our unique war ticket reservation system ensures everyone has a fair chance to secure their seats.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto">
            <div className="bg-background p-8 rounded-xl shadow-subtle flex flex-col items-center text-center animate-slide-up delay-100">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 text-lg font-medium">1</div>
              <h3 className="text-xl font-semibold mb-2">Watch the Timer</h3>
              <p className="text-muted-foreground">Monitor the countdown timer to know exactly when reservations will open.</p>
            </div>
            
            <div className="bg-background p-8 rounded-xl shadow-subtle flex flex-col items-center text-center animate-slide-up delay-200">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 text-lg font-medium">2</div>
              <h3 className="text-xl font-semibold mb-2">Select Your Session</h3>
              <p className="text-muted-foreground">Choose your preferred time slot from the available sessions.</p>
            </div>
            
            <div className="bg-background p-8 rounded-xl shadow-subtle flex flex-col items-center text-center animate-slide-up delay-300">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4 text-lg font-medium">3</div>
              <h3 className="text-xl font-semibold mb-2">Confirm Your Seats</h3>
              <p className="text-muted-foreground">Quickly secure your reservation before all seats are taken.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
