import React from 'react';
import Navbar from './Navbar';
import { useAuth } from '@/contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut, isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        isLoggedIn={!!user} 
        isAdmin={isAdmin}
        onLogout={signOut}
      />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <footer className="bg-background border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Nogura. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
