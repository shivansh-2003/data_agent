import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  CircularProgress, 
  Chip, 
  Button, 
  Tooltip 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from 'framer-motion';

/**
 * API Status Widget
 * Shows the current status of the API connection and allows refreshing
 */
const ApiStatusWidget = ({ apiUrl = 'https://data-agent-ww7e.onrender.com' }) => {
  const [status, setStatus] = useState('checking');
  const [lastChecked, setLastChecked] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);
  const [responseTime, setResponseTime] = useState(null);

  // Status colors and icons
  const statusConfig = {
    online: { color: 'success', icon: CheckCircleIcon, label: 'Online' },
    offline: { color: 'error', icon: ErrorIcon, label: 'Offline' },
    warning: { color: 'warning', icon: WarningIcon, label: 'Degraded' },
    checking: { color: 'default', icon: HourglassEmptyIcon, label: 'Checking' }
  };

  // Check API status on mount and every 5 minutes
  useEffect(() => {
    checkApiStatus();
    
    const interval = setInterval(() => {
      checkApiStatus();
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const checkApiStatus = async () => {
    setIsChecking(true);
    setError(null);
    
    try {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${apiUrl}/health`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.status === 'ok') {
          setStatus('online');
        } else {
          setStatus('warning');
          setError('API reported non-optimal status');
        }
      } else {
        setStatus('offline');
        setError(`API returned status ${response.status}`);
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        setStatus('warning');
        setError('Request timed out');
      } else {
        setStatus('offline');
        setError(err.message);
      }
    } finally {
      setLastChecked(new Date());
      setIsChecking(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return 'Never';
    return time.toLocaleTimeString();
  };

  // Current status config
  const currentStatus = statusConfig[status] || statusConfig.checking;
  const StatusIcon = currentStatus.icon;

  return (
    <Card 
      sx={{ 
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
        }
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" component="div">
            API Status
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={checkApiStatus}
            disabled={isChecking}
          >
            Refresh
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {isChecking ? (
            <CircularProgress size={24} sx={{ mr: 1 }} />
          ) : (
            <motion.div
              animate={status === 'online' ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, repeatDelay: 5, duration: 0.5 }}
            >
              <StatusIcon 
                color={currentStatus.color} 
                sx={{ fontSize: 24, mr: 1 }} 
              />
            </motion.div>
          )}
          
          <Chip 
            label={isChecking ? 'Checking...' : currentStatus.label}
            color={isChecking ? 'default' : currentStatus.color}
            size="small"
          />
          
          {responseTime && status === 'online' && (
            <Tooltip title="API response time">
              <Chip 
                label={`${responseTime}ms`}
                size="small"
                variant="outlined"
                sx={{ ml: 1 }}
              />
            </Tooltip>
          )}
        </Box>
        
        {error && (
          <Typography variant="body2" color="error" gutterBottom>
            {error}
          </Typography>
        )}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" component="div">
            <strong>Endpoint:</strong> {apiUrl}/health
          </Typography>
          <Typography variant="caption" color="text.secondary" component="div">
            <strong>Last checked:</strong> {formatTime(lastChecked)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ApiStatusWidget;