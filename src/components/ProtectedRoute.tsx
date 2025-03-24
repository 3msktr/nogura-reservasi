
import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  useEffect(() => {
    const checkAuth = async () => {
      // Allow a short delay for auth to initialize fully
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsCheckingAuth(false);
    };
    
    checkAuth();
  }, []);

  console.log('ProtectedRoute - User:', user?.id);
  console.log('ProtectedRoute - Is Loading:', isLoading);
  console.log('ProtectedRoute - Is Checking Auth:', isCheckingAuth);

  if (isLoading || isCheckingAuth) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute - Redirecting to login (not authenticated)');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  console.log('ProtectedRoute - Allowing access to protected page');
  return <>{children}</>;
};

export default ProtectedRoute;
