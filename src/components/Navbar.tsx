
import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NavbarProps {
  isLoggedIn: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  isLoggedIn = false, 
  isAdmin = false,
  onLogout = () => {} 
}) => {
  return (
    <header className="w-full fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="text-xl font-semibold tracking-tight transition-colors">
            NOGURA
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-sm font-medium hover:text-primary/80 transition-colors">
              Events
            </Link>
            {isLoggedIn && (
              <Link to="/my-reservations" className="text-sm font-medium hover:text-primary/80 transition-colors">
                My Reservations
              </Link>
            )}
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium hover:text-primary/80 transition-colors">
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link to="/account" className="p-2 rounded-full hover:bg-secondary transition-colors" title="Manage Account">
                <User size={18} />
              </Link>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={onLogout}
                className="rounded-full"
                title="Log Out"
              >
                <LogOut size={18} />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="outline" size="sm" className="rounded-md">
                  Log In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="rounded-md">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
