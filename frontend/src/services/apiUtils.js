import config from '../config';

/**
 * Utility functions for API operations
 */

/**
 * Handle API response errors and convert to standard format
 * @param {Response} response - Fetch API response
 * @returns {Promise} - Processed response or error
 */
export const handleApiResponse = async (response) => {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    
    // Try to get more detailed error from response body
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = errorData.detail;
      } else if (errorData.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
    } catch (e) {
      // Ignore error parsing error
    }
    
    throw new Error(errorMessage);
  }
  
  // Check content type to determine how to parse the response
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  } else if (contentType && contentType.includes('text/')) {
    return response.text();
  } else {
    return response.blob();
  }
};

/**
 * Create request headers with authentication token
 * @param {string} token - Authentication token
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} - Headers object
 */
export const createHeaders = (token, additionalHeaders = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Create complete API URL from endpoint
 * @param {string} endpoint - API endpoint
 * @returns {string} - Complete API URL
 */
export const createApiUrl = (endpoint) => {
  // If endpoint already starts with http, return as is
  if (endpoint.startsWith('http')) {
    return endpoint;
  }
  
  // Remove leading slash if present
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  // Combine base URL with endpoint
  return `${config.api.baseUrl}/${normalizedEndpoint}`;
};

/**
 * Handle file download from API response
 * @param {Blob} blob - Response blob
 * @param {string} filename - Suggested filename
 */
export const handleFileDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default {
  handleApiResponse,
  createHeaders,
  createApiUrl,
  handleFileDownload
};