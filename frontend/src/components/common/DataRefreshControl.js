import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Typography, 
  Tooltip, 
  IconButton, 
  CircularProgress,
  Chip
} from '@mui/material';
import { 
  Refresh as RefreshIcon,
  AutorenewOutlined as AutorenewIcon,
  Timer as TimerIcon,
  TimerOff as TimerOffIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * DataRefreshControl component
 * Provides refresh functionality for data with optional auto-refresh
 */
const DataRefreshControl = ({ 
  onRefresh, 
  isLoading = false,
  lastRefreshed = null,
  labelPosition = 'right', // 'left', 'right', 'none'
  refreshInterval = 60000, // 1 minute
  showAutoRefresh = false,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [timer, setTimer] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(lastRefreshed);
  
  // Define sizes
  const sizeConfig = {
    small: {
      iconSize: 'small',
      buttonSize: 'small',
      typographyVariant: 'caption'
    },
    medium: {
      iconSize: 'medium',
      buttonSize: 'medium',
      typographyVariant: 'body2'
    },
    large: {
      iconSize: 'large',
      buttonSize: 'large',
      typographyVariant: 'body1'
    }
  };
  
  const currentSize = sizeConfig[size] || sizeConfig.medium;
  
  // Update lastUpdated when lastRefreshed changes
  useEffect(() => {
    if (lastRefreshed) {
      setLastUpdated(lastRefreshed);
    }
  }, [lastRefreshed]);
  
  // Handle auto-refresh
  useEffect(() => {
    if (autoRefresh && !timer) {
      // Set up interval for auto-refresh
      const interval = setInterval(() => {
        if (!isLoading && onRefresh) {
          onRefresh();
        }
      }, refreshInterval);
      
      setTimer(interval);
    } else if (!autoRefresh && timer) {
      // Clear interval when auto-refresh is turned off
      clearInterval(timer);
      setTimer(null);
    }
    
    // Clean up interval on unmount
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [autoRefresh, isLoading, onRefresh, refreshInterval, timer]);
  
  // Format relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const now = new Date();
    const refreshTime = new Date(timestamp);
    const diffMs = now - refreshTime;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
    if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
    
    return refreshTime.toLocaleString();
  };
  
  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };
  
  // Handle manual refresh
  const handleRefresh = () => {
    if (!isLoading && onRefresh) {
      onRefresh();
      // If lastRefreshed isn't passed as prop, we'll update our internal state
      if (!lastRefreshed) {
        setLastUpdated(new Date());
      }
    }
  };
  
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {labelPosition === 'left' && lastUpdated && (
        <Typography variant={currentSize.typographyVariant} color="text.secondary">
          Last updated: {getRelativeTime(lastUpdated)}
        </Typography>
      )}
      
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Tooltip title={isLoading ? 'Refreshing...' : 'Refresh data'}>
          <span>
            <IconButton
              onClick={handleRefresh}
              disabled={isLoading}
              size={currentSize.iconSize}
              color="primary"
            >
              {isLoading ? (
                <CircularProgress size={currentSize.iconSize === 'small' ? 16 : 24} />
              ) : (
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.5 }}
                >
                  <RefreshIcon fontSize={currentSize.iconSize} />
                </motion.div>
              )}
            </IconButton>
          </span>
        </Tooltip>
        
        {showAutoRefresh && (
          <Tooltip title={autoRefresh ? 'Turn off auto-refresh' : 'Turn on auto-refresh'}>
            <Chip
              icon={autoRefresh ? <TimerIcon fontSize="small" /> : <TimerOffIcon fontSize="small" />}
              label={autoRefresh ? 'Auto' : 'Manual'}
              size="small"
              color={autoRefresh ? 'primary' : 'default'}
              variant={autoRefresh ? 'filled' : 'outlined'}
              onClick={toggleAutoRefresh}
              sx={{ ml: 1 }}
            />
          </Tooltip>
        )}
      </Box>
      
      {labelPosition === 'right' && lastUpdated && (
        <Typography variant={currentSize.typographyVariant} color="text.secondary">
          Last updated: {getRelativeTime(lastUpdated)}
        </Typography>
      )}
    </Box>
  );
};

export default DataRefreshControl;