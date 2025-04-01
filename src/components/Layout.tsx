
import React from 'react';
import Navbar from './Navbar';
import RefreshButton from './RefreshButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto flex justify-end mt-2">
        <RefreshButton />
      </div>
      <main className="flex-1 pt-4">
        {children}
      </main>
      <footer className="bg-secondary/50 py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} NOGURA. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
