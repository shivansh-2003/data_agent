import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useLocalStorage('auth_token', null);
  const [user, setUser] = useLocalStorage('auth_user', null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!token);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  const login = async (apiKey, model = 'gpt-4', agentType = 'LangChain Agent') => {
    setIsLoading(true);
    try {
      const response = await fetch('/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: apiKey,
          model_name: model,
          agent_type: agentType
        }),
      });

      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const data = await response.json();
      
      // Save the session ID as the token
      setToken(data.session_id);
      setUser({
        apiKey,
        model,
        agentType,
        sessionId: data.session_id
      });
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (token) {
        // Call API to delete the session
        await fetch(`/sessions/${token}`, {
          method: 'DELETE',
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage and state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const value = {
    token,
    user,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 