
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, isLoading } = useAuth();
  
  console.log('AdminRoute - User:', user?.id);
  console.log('AdminRoute - Is Admin:', isAdmin);
  console.log('AdminRoute - Is Loading:', isLoading);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('AdminRoute - Redirecting to login (not authenticated)');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.log('AdminRoute - Redirecting to home (not admin)');
    return <Navigate to="/" replace />;
  }

  console.log('AdminRoute - Allowing access to admin page');
  return <>{children}</>;
};

export default AdminRoute;
