import { createApiClient } from './api';
import API_ENDPOINTS from '../constants/apiEndpoints';

/**
 * Service for chat-related API operations
 */
export class ChatService {
  constructor(sessionId) {
    this.sessionId = sessionId;
    this.api = createApiClient(sessionId);
    this.messageHistory = [];
  }

  /**
   * Send a chat message to the AI agent
   * @param {string} query - User message/query
   * @returns {Promise} - Chat response
   */
  async sendMessage(query) {
    // Save the user message to history
    this.messageHistory.push({
      content: query,
      sender: 'user',
      timestamp: new Date().toISOString()
    });
    
    try {
      const response = await this.api(API_ENDPOINTS.CHAT(this.sessionId), {
        method: 'POST',
        body: JSON.stringify({
          session_id: this.sessionId,
          query
        })
      });
      
      // Process the response and add to history
      if (response) {
        const messageContent = response.response || response.message || response;
        
        this.messageHistory.push({
          content: messageContent,
          sender: 'assistant',
          timestamp: new Date().toISOString(),
          visualization: response.visualization || null,
          visualization_code: response.visualization_code || null
        });
      }
      
      return response;
    } catch (error) {
      // Add error message to history
      this.messageHistory.push({
        content: `Error: ${error.message}`,
        sender: 'system',
        timestamp: new Date().toISOString(),
        isError: true
      });
      
      throw error;
    }
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
  
  /**
   * Get the chat message history
   * @returns {Array} - Chat message history
   */
  getMessageHistory() {
    return [...this.messageHistory];
  }
  
  /**
   * Clear the chat message history
   */
  clearMessageHistory() {
    this.messageHistory = [];
  }
}

export default ChatService;