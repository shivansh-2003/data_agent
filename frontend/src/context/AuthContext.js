import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const authService = new AuthService();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const session = authService.getCurrentSession();
        
        if (session) {
          setToken(session.token);
          setUser(session.user);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  // Login function
  const login = async (apiKey, model = 'gpt-4', agentType = 'LangChain Agent') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authService.createSession(apiKey, model, agentType);
      
      if (response && response.session_id) {
        const userData = {
          sessionId: response.session_id,
          apiKey,
          model,
          agentType,
          createdAt: new Date().toISOString()
        };
        
        setToken(response.session_id);
        setUser(userData);
        setIsAuthenticated(true);
        
        return response;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to authenticate');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    
    try {
      if (token) {
        await authService.deleteSession(token);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      // Clear auth state regardless of API success
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  // Verify the current session
  const verifySession = async () => {
    if (!token) return false;
    
    try {
      const status = await authService.getSessionStatus(token);
      return status && status.active;
    } catch (err) {
      console.error('Session verification error:', err);
      return false;
    }
  };

  // Check API health
  const checkApiHealth = async () => {
    try {
      return await authService.healthCheck();
    } catch (err) {
      console.error('API health check error:', err);
      throw err;
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    login,
    logout,
    verifySession,
    checkApiHealth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;