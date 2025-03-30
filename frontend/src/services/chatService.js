import { createApiClient } from './api';

/**
 * Service for chat-related API operations
 */
export class ChatService {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.api = createApiClient(sessionId);
  }

  /**
   * Send a chat message to the AI agent
   * @param {string} query - User message/query
   * @returns {Promise} - Chat response
   */
  async sendMessage(query) {
    return this.api(`sessions/${this.sessionId}/chat`, {
      method: 'POST',
      body: JSON.stringify({
        session_id: this.sessionId,
        query
      })
    });
  }

  /**
   * Generate a visualization based on natural language query
   * @param {string} query - Natural language visualization request
   * @returns {Promise} - Visualization response
   */
  async generateVisualizationFromQuery(query) {
    // This uses the chat endpoint but with specific visualization-related query
    return this.sendMessage(`Create visualization: ${query}`);
  }

  /**
   * Generate data insights based on natural language query
   * @param {string} query - Natural language insight request
   * @returns {Promise} - Insights response
   */
  async generateInsights(query) {
    // This uses the chat endpoint but with specific insight-related query
    return this.sendMessage(`Analyze and provide insights: ${query}`);
  }

  /**
   * Get suggested queries based on the loaded data
   * @returns {Promise} - Suggested queries
   */
  async getSuggestedQueries() {
    // This is a specialized query that asks the AI for query suggestions
    return this.sendMessage("Suggest 5 useful questions I could ask about this data");
  }
}

export default ChatService; 