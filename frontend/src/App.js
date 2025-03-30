import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence } from 'framer-motion';
import { Snackbar, Alert } from '@mui/material';

// Import context providers
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';

// Import pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ChatInterface from './pages/ChatInterface';
import DataExplorer from './pages/DataExplorer';
import VisualizationBuilder from './pages/VisualizationBuilder';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';

// Import components
import Navbar from './components/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';

// Create theme
const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6366f1', // Indigo
    },
    secondary: {
      main: '#8b5cf6', // Purple
    },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(99, 102, 241, 0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          borderRadius: 16,
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#818cf8', // Lighter indigo for dark mode
    },
    secondary: {
      main: '#a78bfa', // Lighter purple for dark mode
    },
    background: {
      default: '#1f2937',
      paper: '#111827',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(99, 102, 241, 0.3)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
          borderRadius: 16,
        },
      },
    },
  },
});

function App() {
  const [apiHealth, setApiHealth] = useState({ status: 'checking', message: null });
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Check system dark mode preference
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPrefersDarkMode(darkModeQuery.matches);
    
    const handleChange = (e) => setPrefersDarkMode(e.matches);
    darkModeQuery.addEventListener('change', handleChange);
    
    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, []);

  // Check API health on mount
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        // Create a simple fetch with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://data-agent-ww7e.onrender.com/health', {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'ok') {
            setApiHealth({ status: 'online', message: null });
          } else {
            setApiHealth({ status: 'warning', message: 'API reported non-optimal status' });
          }
        } else {
          setApiHealth({ status: 'offline', message: 'API returned an error response' });
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          setApiHealth({ status: 'timeout', message: 'API connection timed out' });
        } else {
          setApiHealth({ status: 'offline', message: error.message });
        }
      }
    };
    
    checkApiHealth();
  }, []);

  // Show API status alert if there's an issue
  useEffect(() => {
    if (apiHealth.status !== 'online' && apiHealth.status !== 'checking') {
      setSnackbar({
        open: true,
        message: `API Status: ${apiHealth.status}. ${apiHealth.message || ''}`,
        severity: apiHealth.status === 'warning' ? 'warning' : 'error'
      });
    }
  }, [apiHealth]);

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <CustomThemeProvider>
      <ThemeProvider theme={prefersDarkMode ? darkTheme : lightTheme}>
        <CssBaseline />
        <AuthProvider>
          <DataProvider>
            <Router>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flexGrow: 1 }}>
                  <AnimatePresence mode="wait">
                    <Routes>
                      <Route path="/" element={<LandingPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/chat" element={
                        <ProtectedRoute>
                          <ChatInterface />
                        </ProtectedRoute>
                      } />
                      <Route path="/data-explorer" element={
                        <ProtectedRoute>
                          <DataExplorer />
                        </ProtectedRoute>
                      } />
                      <Route path="/visualization" element={
                        <ProtectedRoute>
                          <VisualizationBuilder />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <Settings />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </AnimatePresence>
                </main>
                <Footer />
                
                {/* API Status Snackbar */}
                <Snackbar 
                  open={snackbar.open} 
                  autoHideDuration={6000} 
                  onClose={handleCloseSnackbar}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                  <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
                    {snackbar.message}
                  </Alert>
                </Snackbar>
              </div>
            </Router>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </CustomThemeProvider>
  );
}

export default App;