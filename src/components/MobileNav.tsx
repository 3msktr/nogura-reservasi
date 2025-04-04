
import React from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut, UserCog } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const MobileNav = () => {
  const { user, isAdmin, signOut } = useAuth();
  const isLoggedIn = !!user;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 12H21M3 6H21M3 18H21"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[80%] sm:max-w-sm">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left text-xl font-semibold tracking-tight">
            NOGURA
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col space-y-4">
          <Link
            to="/"
            className="flex items-center py-2 text-base font-medium hover:text-primary/80 transition-colors"
          >
            Events
          </Link>
          
          {isLoggedIn && (
            <Link
              to="/my-reservations"
              className="flex items-center py-2 text-base font-medium hover:text-primary/80 transition-colors"
            >
              My Reservations
            </Link>
          )}
          
          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center py-2 text-base font-medium hover:text-primary/80 transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          
          {isLoggedIn ? (
            <div className="pt-4 border-t space-y-4">
              <Link
                to="/account"
                className="flex items-center gap-2 py-2 text-base font-medium hover:text-primary/80 transition-colors"
              >
                <User size={18} />
                Account
              </Link>
              
              {isAdmin && (
                <Link
                  to="/admin/users"
                  className="flex items-center gap-2 py-2 text-base font-medium hover:text-primary/80 transition-colors"
                >
                  <UserCog size={18} />
                  Manage Users
                </Link>
              )}
              
              <Button 
                variant="ghost" 
                onClick={signOut}
                className="flex w-full items-center justify-start gap-2 px-0 hover:bg-transparent"
              >
                <LogOut size={18} />
                Log Out
              </Button>
            </div>
          ) : (
            <div className="pt-4 border-t space-y-4">
              <Link
                to="/login"
                className="block w-full py-2 text-base font-medium hover:text-primary/80 transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="block w-full py-2 text-base font-medium hover:text-primary/80 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
