import React, { createContext, useState, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [themePreference, setThemePreference] = useLocalStorage('theme_preference', 'system');
  const [darkMode, setDarkMode] = useState(false);

  // Apply theme based on preference
  useEffect(() => {
    const applyTheme = (isDark) => {
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setDarkMode(isDark);
    };

    // If system preference, check media query
    if (themePreference === 'system') {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(darkModeQuery.matches);

      // Listen for changes in system theme
      const handleChange = (e) => applyTheme(e.matches);
      darkModeQuery.addEventListener('change', handleChange);
      return () => darkModeQuery.removeEventListener('change', handleChange);
    } else {
      // Apply user preference
      applyTheme(themePreference === 'dark');
    }
  }, [themePreference]);

  const toggleTheme = () => {
    if (themePreference === 'light') {
      setThemePreference('dark');
    } else if (themePreference === 'dark') {
      setThemePreference('light');
    } else {
      // If system, toggle based on current state
      setThemePreference(darkMode ? 'light' : 'dark');
    }
  };

  const setTheme = (theme) => {
    setThemePreference(theme);
  };

  const value = {
    darkMode,
    themePreference,
    toggleTheme,
    setTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext; 