import { createApiClient } from './api';

/**
 * Service for authentication-related operations
 */
export class AuthService {
  constructor() {
    this.api = createApiClient();
  }

  /**
   * Create a new session with the AI agent
   * @param {string} apiKey - OpenAI API key
   * @param {string} model - Model name to use (default: gpt-4)
   * @param {string} agentType - Type of agent to use (default: LangChain Agent)
   * @returns {Promise} - Session creation response
   */
  async createSession(apiKey, model = 'gpt-4', agentType = 'LangChain Agent') {
    return this.api('sessions', {
      method: 'POST',
      body: JSON.stringify({
        api_key: apiKey,
        model_name: model,
        agent_type: agentType
      })
    });
  }

  /**
   * Delete a session
   * @param {string} sessionId - Session ID to delete
   * @returns {Promise} - Session deletion response
   */
  async deleteSession(sessionId) {
    return this.api(`sessions/${sessionId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Check session status
   * @param {string} sessionId - Session ID to check
   * @returns {Promise} - Session status response
   */
  async getSessionStatus(sessionId) {
    return this.api(`sessions/${sessionId}/status`, {
      method: 'GET'
    });
  }

  /**
   * Check API health
   * @returns {Promise} - Health check response
   */
  async healthCheck() {
    return this.api('health', {
      method: 'GET'
    });
  }
}

export default AuthService; 