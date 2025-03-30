/**
 * General helper utility functions
 */

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Sleep for a specified number of milliseconds
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after the timeout
 */
export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Debounce a function to limit how often it can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Milliseconds to wait before allowing function to be called again
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle a function to limit how often it can be called
 * @param {Function} func - Function to throttle
 * @param {number} limit - Milliseconds to wait between function calls
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit = 300) => {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
};

/**
 * Deep clone an object
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
export const deepClone = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (e) {
    console.error('Deep clone error:', e);
    return structuredClone ? structuredClone(obj) : { ...obj };
  }
};

/**
 * Get query parameters from URL
 * @returns {Object} - Object with query parameters
 */
export const getQueryParams = () => {
  const params = {};
  const queryString = window.location.search.substring(1);
  
  if (!queryString) return params;
  
  const pairs = queryString.split('&');
  
  for (let i = 0; i < pairs.length; i++) {
    const [key, value] = pairs[i].split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  
  return params;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise} - Promise that resolves when copy is complete
 */
export const copyToClipboard = async (text) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error('Clipboard write failed:', err);
      return false;
    }
  } else {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    
    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      return successful;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      document.body.removeChild(textarea);
      return false;
    }
  }
};

/**
 * Download data as a file
 * @param {string} filename - Name of the file
 * @param {string} content - Content of the file
 * @param {string} type - MIME type
 */
export const downloadFile = (filename, content, type = 'text/plain') => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.href = url;
  link.download = filename;
  link.click();
  
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

export default {
  generateId,
  sleep,
  debounce,
  throttle,
  deepClone,
  getQueryParams,
  copyToClipboard,
  downloadFile
}; 