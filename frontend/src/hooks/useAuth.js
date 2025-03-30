import { useState, useEffect, useCallback } from 'react';
import useLocalStorage from './useLocalStorage';

/**
 * Custom hook for handling authentication state and operations.
 * Manages user login, logout, and session persistence.
 * 
 * @returns {Object} Authentication state and methods
 */
const useAuth = () => {
  // Store auth data in localStorage for persistence across page refreshes
  const [storedUser, setStoredUser] = useLocalStorage('auth_user', null);
  const [storedToken, setStoredToken] = useLocalStorage('auth_token', null);
  
  // Local state for loading and error handling
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  const isAuthenticated = Boolean(storedToken && storedUser);

  // Login function
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be an API call to your authentication endpoint
      // For demo purposes, we're simulating a successful login
      const mockResponse = {
        user: {
          id: '123',
          name: 'Demo User',
          email: credentials.email,
          role: 'user'
        },
        token: 'mock-jwt-token-' + Math.random().toString(36).substring(2)
      };
      
      // Store authentication data
      setStoredUser(mockResponse.user);
      setStoredToken(mockResponse.token);
      
      return mockResponse.user;
    } catch (err) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setStoredUser, setStoredToken]);

  // Logout function
  const logout = useCallback(() => {
    setStoredUser(null);
    setStoredToken(null);
  }, [setStoredUser, setStoredToken]);

  // Update user profile
  const updateProfile = useCallback((userData) => {
    if (storedUser && storedToken) {
      setStoredUser({ ...storedUser, ...userData });
    }
  }, [storedUser, storedToken, setStoredUser]);

  return {
    user: storedUser,
    token: storedToken,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
    updateProfile
  };
};

export default useAuth;