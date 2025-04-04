/**
 * Utility functions for form validation
 */

/**
 * Validate an email address
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether the email is valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  
  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate that a string is not empty
 * @param {string} value - Value to validate
 * @returns {boolean} - Whether the value is not empty
 */
export const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  return value.toString().trim().length > 0;
};

/**
 * Validate that a value is a number
 * @param {any} value - Value to validate
 * @returns {boolean} - Whether the value is a number
 */
export const isNumber = (value) => {
  if (value === null || value === undefined) return false;
  return !isNaN(Number(value));
};

/**
 * Validate that a number is within a range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} - Whether the value is within range
 */
export const isInRange = (value, min, max) => {
  if (!isNumber(value)) return false;
  
  const num = Number(value);
  return num >= min && num <= max;
};

/**
 * Validate a file type against allowed types
 * @param {File} file - File to validate
 * @param {Array} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - Whether the file type is allowed
 */
export const isValidFileType = (file, allowedTypes) => {
  if (!file || !allowedTypes || !allowedTypes.length) return false;
  return allowedTypes.includes(file.type);
};

/**
 * Validate a file size
 * @param {File} file - File to validate
 * @param {number} maxSizeInBytes - Maximum allowed size in bytes
 * @returns {boolean} - Whether the file size is valid
 */
export const isValidFileSize = (file, maxSizeInBytes) => {
  if (!file) return false;
  return file.size <= maxSizeInBytes;
};

/**
 * Run multiple validation functions and collect errors
 * @param {Object} validations - Object with field:validator pairs
 * @returns {Object} - Object with field:error pairs
 */
export const validateForm = (validations) => {
  const errors = {};
  
  Object.entries(validations).forEach(([field, { value, validators, errorMessage }]) => {
    // Run all validators for this field
    const isValid = validators.every(validator => validator(value));
    
    // If any validator failed, add error message
    if (!isValid) {
      errors[field] = errorMessage;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  isValidEmail,
  isNotEmpty,
  isNumber,
  isInRange,
  isValidFileType,
  isValidFileSize,
  validateForm
}; 