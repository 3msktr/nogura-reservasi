
import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  isLoggedIn = false,
  isAdmin = false,
  onLogout = () => {}
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar isLoggedIn={isLoggedIn} isAdmin={isAdmin} onLogout={onLogout} />
      <main className="flex-1 pt-16">
        {children}
      </main>
      <footer className="py-6 border-t border-border">
        <div className="container flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Nogura Restaurant. All rights reserved.
          </p>
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
