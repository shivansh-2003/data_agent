import config from '../config';
import { createApiClient } from './api';

/**
 * Session Management Service
 * Handles authentication session with the backend API
 */
class SessionService {
  constructor() {
    this.api = createApiClient();
    this.sessionKey = config.auth.tokenKey;
    this.userKey = config.auth.userKey;
    this.sessionExpiryKey = 'session_expiry';
    this.pingInterval = null;
    this.sessionTimeoutMs = config.auth.sessionTimeout || 3600000; // Default 1 hour
  }

  /**
   * Get session data from localStorage
   * @returns {Object|null} Session data or null if not found
   */
  getSession() {
    try {
      const token = localStorage.getItem(this.sessionKey);
      const userData = localStorage.getItem(this.userKey);
      const expiry = localStorage.getItem(this.sessionExpiryKey);
      
      if (!token || !userData) {
        return null;
      }
      
      const session = {
        token,
        user: JSON.parse(userData),
        expiry: expiry ? new Date(expiry) : null
      };
      
      // Check if session has expired
      if (session.expiry && new Date() > session.expiry) {
        this.clearSession();
        return null;
      }
      
      return session;
    } catch (error) {
      console.error('Error getting session:', error);
      return null;
    }
  }

  /**
   * Set session data in localStorage
   * @param {string} token - Session token
   * @param {Object} userData - User data
   * @param {number} expiryMinutes - Session expiry in minutes
   */
  setSession(token, userData, expiryMinutes = 60) {
    try {
      // Calculate expiry date
      const expiry = new Date();
      expiry.setMinutes(expiry.getMinutes() + expiryMinutes);
      
      // Store in localStorage
      localStorage.setItem(this.sessionKey, token);
      localStorage.setItem(this.userKey, JSON.stringify(userData));
      localStorage.setItem(this.sessionExpiryKey, expiry.toISOString());
      
      // Start session ping
      this.startSessionPing();
      
      return {
        token,
        user: userData,
        expiry
      };
    } catch (error) {
      console.error('Error setting session:', error);
      return null;
    }
  }

  /**
   * Clear session data from localStorage
   */
  clearSession() {
    try {
      localStorage.removeItem(this.sessionKey);
      localStorage.removeItem(this.userKey);
      localStorage.removeItem(this.sessionExpiryKey);
      
      // Stop session ping
      this.stopSessionPing();
      
      return true;
    } catch (error) {
      console.error('Error clearing session:', error);
      return false;
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    return !!this.getSession();
  }

  /**
   * Refresh session expiry
   * @param {number} expiryMinutes - Session expiry in minutes
   */
  refreshSession(expiryMinutes = 60) {
    const session = this.getSession();
    
    if (!session) {
      return false;
    }
    
    // Update expiry date
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + expiryMinutes);
    
    // Update localStorage
    localStorage.setItem(this.sessionExpiryKey, expiry.toISOString());
    
    return true;
  }

  /**
   * Start session ping to keep it alive
   */
  startSessionPing() {
    // Stop existing ping if any
    this.stopSessionPing();
    
    // Create new ping interval
    this.pingInterval = setInterval(() => {
      const session = this.getSession();
      
      if (session) {
        // Ping the server to keep session alive
        this.pingSession(session.token)
          .then(success => {
            if (success) {
              // Refresh session expiry
              this.refreshSession();
            } else {
              console.error('Session ping failed');
            }
          })
          .catch(error => {
            console.error('Session ping error:', error);
          });
      } else {
        // No active session, stop pinging
        this.stopSessionPing();
      }
    }, this.sessionTimeoutMs / 2); // Ping at half the session timeout
  }

  /**
   * Stop session ping
   */
  stopSessionPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Ping session to keep it alive
   * @param {string} token - Session token
   * @returns {Promise<boolean>} Success status
   */
  async pingSession(token) {
    try {
      const response = await this.api(`sessions/${token}/status`, {
        method: 'GET'
      });
      
      return response && response.active;
    } catch (error) {
      console.error('Session ping error:', error);
      return false;
    }
  }
}

export default new SessionService();