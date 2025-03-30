import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AnimatePresence } from 'framer-motion';

// Import pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ChatInterface from './pages/ChatInterface';

// Import components
import Navbar from './components/Navbar';

// Create theme
const theme = createTheme({
  palette: {
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

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Navbar />
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/chat" element={<ChatInterface />} />
          </Routes>
        </AnimatePresence>
      </Router>
    </ThemeProvider>
  );
}

export default App;