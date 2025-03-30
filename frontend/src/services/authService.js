import { createApiClient } from './api';
import API_ENDPOINTS from '../constants/apiEndpoints';
import config from '../config';

/**
 * Service for authentication-related operations
 */
export class AuthService {
  constructor() {
    this.api = createApiClient();
    this.tokenKey = config.auth.tokenKey;
    this.userKey = config.auth.userKey;
  }

  /**
   * Create a new session with the AI agent
   * @param {string} apiKey - OpenAI API key
   * @param {string} model - Model name to use (default: gpt-4)
   * @param {string} agentType - Type of agent to use (default: LangChain Agent)
   * @returns {Promise} - Session creation response
   */
  async createSession(apiKey, model = 'gpt-4', agentType = 'LangChain Agent') {
    try {
      const response = await this.api(API_ENDPOINTS.CREATE_SESSION, {
        method: 'POST',
        body: JSON.stringify({
          api_key: apiKey,
          model_name: model,
          agent_type: agentType
        })
      });

      if (response && response.session_id) {
        // Save auth data in localStorage
        const userData = {
          sessionId: response.session_id,
          apiKey: apiKey,
          model: model,
          agentType: agentType,
          createdAt: new Date().toISOString()
        };
        
        localStorage.setItem(this.tokenKey, response.session_id);
        localStorage.setItem(this.userKey, JSON.stringify(userData));
      }
      
      return response;
    } catch (error) {
      console.error('Session creation error:', error);
      throw error;
    }
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID to delete
   * @returns {Promise} - Session deletion response
   */
  async deleteSession(sessionId) {
    try {
      const response = await this.api(API_ENDPOINTS.DELETE_SESSION(sessionId), {
        method: 'DELETE'
      });
      
      // Clear auth data from localStorage
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      
      return response;
    } catch (error) {
      console.error('Session deletion error:', error);
      // Clear auth data anyway even if API request fails
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
      throw error;
    }
  }

  /**
   * Check session status
   * @param {string} sessionId - Session ID to check
   * @returns {Promise} - Session status response
   */
  async getSessionStatus(sessionId) {
    return this.api(API_ENDPOINTS.SESSION_STATUS(sessionId), {
      method: 'GET'
    });
  }

  /**
   * Check API health
   * @returns {Promise} - Health check response
   */
  async healthCheck() {
    return this.api(API_ENDPOINTS.HEALTH, {
      method: 'GET'
    });
  }
  
  /**
   * Get current session data
   * @returns {Object|null} - Session data or null if not authenticated
   */
  getCurrentSession() {
    try {
      const token = localStorage.getItem(this.tokenKey);
      const userData = localStorage.getItem(this.userKey);
      
      if (!token || !userData) {
        return null;
      }
      
      return {
        token,
        user: JSON.parse(userData)
      };
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean} - True if authenticated
   */
  isAuthenticated() {
    return !!this.getCurrentSession();
  }
}

export default AuthService;