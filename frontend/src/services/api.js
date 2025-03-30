/**
 * API client configuration
 */

// Base URL for API requests - pointing to the deployed backend
const API_BASE_URL = 'https://data-agent-ww7e.onrender.com';

/**
 * Creates a configured fetch function with authentication token
 * @param {string} token - Authentication token
 * @returns {Function} - Configured fetch function
 */
export const createApiClient = (token) => {
  const apiClient = async (endpoint, options = {}) => {
    const baseOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    };

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const config = { ...baseOptions, ...options };

    try {
      const response = await fetch(url, config);
      
      // For non-json responses, just return the response object
      if (!response.headers.get('content-type')?.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return response;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`API Error (${url}):`, error);
      throw error;
    }
  };

  return apiClient;
};

/**
 * Create a form data submit function
 * @param {string} token - Authentication token
 * @returns {Function} - Configured form data submit function
 */
export const createFormSubmitter = (token) => {
  return async (endpoint, formData, options = {}) => {
    const baseOptions = {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
      },
      body: formData
    };

    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const config = { ...baseOptions, ...options };

    try {
      const response = await fetch(url, config);
      
      // For non-json responses, just return the response object
      if (!response.headers.get('content-type')?.includes('application/json')) {
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        return response;
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.detail || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error(`Form Submit Error (${url}):`, error);
      throw error;
    }
  };
};

export default createApiClient;