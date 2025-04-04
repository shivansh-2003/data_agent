/**
 * API client configuration
 */

import config from '../config';

// Base URL for API requests - pointing to the deployed backend
const API_BASE_URL = 'https://data-agent-ww7e.onrender.com';

/**
 * Creates a configured fetch function with authentication token
 * @param {string} token - Authentication token
 * @returns {Function} - Configured fetch function
 */
export const createApiClient = (sessionId = null) => {
  const baseUrl = config.api.baseUrl;
  
  return async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    
    const defaultOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(sessionId ? { 'X-Session-ID': sessionId } : {})
      },
    };
    
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    };
    
    if (mergedOptions.body && typeof mergedOptions.body === 'object' && !(mergedOptions.body instanceof FormData)) {
      mergedOptions.body = JSON.stringify(mergedOptions.body);
    }
    
    try {
      const response = await fetch(url, mergedOptions);
      
      // Handle non-JSON responses if specified
      if (options.responseType === 'blob') {
        return response.blob();
      }
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || data.detail || 'API request failed');
        }
        
        return data;
      } else {
        // For non-JSON responses
        const text = await response.text();
        
        if (!response.ok) {
          throw new Error(text || 'API request failed');
        }
        
        return text;
      }
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  };
};

/**
 * Create a form data submitter for file uploads
 * @param {string} sessionId - Optional session ID
 * @returns {Function} - Form submitter function
 */
export const createFormSubmitter = (sessionId = null) => {
  const baseUrl = config.api.baseUrl;
  
  return async (endpoint, formData, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    
    const defaultOptions = {
      method: 'POST',
      headers: {
        ...(sessionId ? { 'X-Session-ID': sessionId } : {})
      },
      body: formData
    };
    
    const mergedOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...(options.headers || {})
      }
    };
    
    // Don't set Content-Type for FormData, let the browser set it with boundary
    delete mergedOptions.headers['Content-Type']; 
    
    try {
      const response = await fetch(url, mergedOptions);
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || data.detail || 'API request failed');
        }
        
        return data;
      } else {
        // For non-JSON responses
        const text = await response.text();
        
        if (!response.ok) {
          throw new Error(text || 'API request failed');
        }
        
        return text;
      }
    } catch (error) {
      console.error('Form submission error:', error);
      throw error;
    }
  };
};

export default createApiClient;