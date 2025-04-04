
export interface Event {
  id: string;
  name: string;
  description: string;
  date: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  maxReservationsPerUser: number;
  sessions: Session[];
}

export interface Session {
  id: string;
  time: string;
  availableSeats: number;
  totalSeats: number;
  eventId: string;
}

export interface Reservation {
  id: string;
  userId: string;
  eventId: string;
  sessionId: string;
  numberOfSeats: number;
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
  // Contact information fields
  contactName?: string;
  phoneNumber?: string;
  allergyNotes?: string;
  // Optional fields for display purposes
  event?: {
    id: string;
    name: string;
    date: string;
  };
  session?: {
    time: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  created_at: string;
}
