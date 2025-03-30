import { useState, useEffect } from 'react';

/**
 * Custom hook for managing data in localStorage with automatic JSON serialization/deserialization.
 * Provides a state-like interface for working with localStorage values.
 * 
 * @param {string} key - The localStorage key to manage
 * @param {any} initialValue - The initial value to use if no value exists in localStorage
 * @returns {Array} - A stateful value and a function to update it
 */
const useLocalStorage = (key, initialValue) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error('Error reading localStorage:', error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function
  // that persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.error('Error setting localStorage:', error);
    }
  };

  // Optional: Listen for changes in localStorage from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key) {
        try {
          const newValue = event.newValue ? JSON.parse(event.newValue) : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error('Error parsing localStorage event:', error);
        }
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup event listener
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue];
};

export default useLocalStorage;