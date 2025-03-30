/**
 * Utility functions for formatting data
 */

/**
 * Format a number with commas as thousands separators
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted number
 */
export const formatNumber = (num, decimals = 2) => {
  if (num === null || num === undefined || isNaN(num)) {
    return 'N/A';
  }
  
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(num);
};

/**
 * Format a date string to a readable format
 * @param {string} dateStr - Date string to format
 * @param {string} format - Output format (short, medium, long)
 * @returns {string} - Formatted date string
 */
export const formatDate = (dateStr, format = 'medium') => {
  if (!dateStr) return 'N/A';
  
  try {
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return dateStr; // Return original if invalid
    }
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'long':
        return date.toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      case 'time':
        return date.toLocaleTimeString();
      case 'datetime':
        return date.toLocaleString();
      case 'medium':
      default:
        return date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
    }
  } catch (e) {
    console.error('Date formatting error:', e);
    return dateStr;
  }
};

/**
 * Format a percentage value
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export const formatPercent = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals
  }).format(value / 100); // Assuming value is already multiplied by 100
};

/**
 * Format a value based on its type
 * @param {any} value - Value to format
 * @param {string} type - Data type
 * @returns {string} - Formatted value
 */
export const formatValue = (value, type) => {
  if (value === null || value === undefined) {
    return 'N/A';
  }
  
  switch (type) {
    case 'number':
      return formatNumber(value);
    case 'date':
      return formatDate(value);
    case 'percent':
      return formatPercent(value);
    case 'boolean':
      return value ? 'Yes' : 'No';
    default:
      return String(value);
  }
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 50) => {
  if (!text) return '';
  if (text.length <= length) return text;
  
  return text.substring(0, length) + '...';
};

/**
 * Convert bytes to human-readable size
 * @param {number} bytes - Bytes to convert
 * @returns {string} - Human-readable size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
};

export default {
  formatNumber,
  formatDate,
  formatPercent,
  formatValue,
  truncateText,
  formatFileSize
}; 