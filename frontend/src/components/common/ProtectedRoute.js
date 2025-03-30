import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

/**
 * Protected Route Component
 * Wraps routes that require authentication
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, verifySession } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      if (isAuthenticated) {
        try {
          const isValid = await verifySession();
          setIsSessionValid(isValid);
        } catch (error) {
          console.error('Error verifying session:', error);
          setIsSessionValid(false);
        }
      }
      setIsVerifying(false);
    };

    checkSession();
  }, [isAuthenticated, verifySession]);

  // Show loader while auth is initializing or verifying
  if (isLoading || isVerifying) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 64px)' 
      }}>
        <Loader message="Verifying authentication..." />
      </div>
    );
  }

  // Redirect to login if not authenticated or session invalid
  if (!isAuthenticated || !isSessionValid) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render children if authenticated and session valid
  return children;
};

export default ProtectedRoute;