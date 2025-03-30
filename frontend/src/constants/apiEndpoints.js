/**
 * API endpoint definitions
 */

const API_ENDPOINTS = {
  // Session management
  CREATE_SESSION: '/sessions',
  DELETE_SESSION: (sessionId) => `/sessions/${sessionId}`,
  SESSION_STATUS: (sessionId) => `/sessions/${sessionId}/status`,
  
  // Data management
  UPLOAD_FILE: (sessionId) => `/sessions/${sessionId}/data/upload`,
  UPLOAD_TEXT: (sessionId) => `/sessions/${sessionId}/data/text`,
  DATA_PREVIEW: (sessionId) => `/sessions/${sessionId}/data/preview`,
  
  // Analysis
  BASIC_ANALYSIS: (sessionId) => `/sessions/${sessionId}/analyze/basic`,
  CORRELATION_ANALYSIS: (sessionId) => `/sessions/${sessionId}/analyze/correlation`,
  TIMESERIES_ANALYSIS: (sessionId) => `/sessions/${sessionId}/analyze/timeseries`,
  
  // Visualization
  VISUALIZE: (sessionId) => `/sessions/${sessionId}/visualize`,
  
  // Chat
  CHAT: (sessionId) => `/sessions/${sessionId}/chat`,
  
  // Health check
  HEALTH: '/health'
};

export default API_ENDPOINTS; 