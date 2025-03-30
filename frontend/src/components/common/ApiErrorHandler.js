import React, { useState, useEffect } from 'react';
import { 
  Alert, 
  AlertTitle, 
  Snackbar, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Button,
  Typography,
  Box,
  Collapse
} from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * API Error Handler component
 * Displays API errors with appropriate UI components based on error type
 */
const ApiErrorHandler = ({ 
  error, 
  variant = 'alert', // 'alert', 'snackbar', 'dialog'
  severity = 'error', // 'error', 'warning', 'info'
  onClose,
  onRetry,
  autoHideDuration = 6000,
  position = { vertical: 'bottom', horizontal: 'center' }
}) => {
  const [open, setOpen] = useState(Boolean(error));
  const [expanded, setExpanded] = useState(false);
  
  // Update open state when error changes
  useEffect(() => {
    setOpen(Boolean(error));
  }, [error]);
  
  // Get error message and details
  const getErrorContent = () => {
    if (!error) return { message: '', details: '' };
    
    // Handle different error formats
    if (typeof error === 'string') {
      return { 
        message: error,
        details: ''
      };
    }
    
    if (error instanceof Error) {
      return { 
        message: error.message || 'An error occurred',
        details: error.stack || ''
      };
    }
    
    if (typeof error === 'object') {
      return { 
        message: error.message || error.error || 'API Error',
        details: error.details || error.description || JSON.stringify(error, null, 2)
      };
    }
    
    return { 
      message: 'Unknown error',
      details: String(error) 
    };
  };
  
  const { message, details } = getErrorContent();
  
  // Handle close event
  const handleClose = (event, reason) => {
    if (reason === 'clickaway' && variant === 'snackbar') return;
    
    setOpen(false);
    
    if (onClose) {
      onClose(event, reason);
    }
  };
  
  // Handle retry attempt
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };
  
  // Render appropriate error component based on variant
  const renderErrorComponent = () => {
    switch (variant) {
      case 'snackbar':
        return (
          <Snackbar
            open={open}
            autoHideDuration={autoHideDuration}
            onClose={handleClose}
            anchorOrigin={position}
          >
            <Alert 
              onClose={handleClose} 
              severity={severity} 
              variant="filled"
              sx={{ width: '100%' }}
            >
              <AlertTitle>{severity === 'error' ? 'Error' : 'Warning'}</AlertTitle>
              {message}
            </Alert>
          </Snackbar>
        );
        
      case 'dialog':
        return (
          <Dialog
            open={open}
            onClose={handleClose}
            PaperProps={{ 
              sx: { 
                borderTop: '4px solid', 
                borderColor: severity === 'error' ? 'error.main' : 'warning.main' 
              } 
            }}
          >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
              <ErrorIcon 
                color={severity} 
                sx={{ mr: 1, fontSize: 24 }} 
              />
              {severity === 'error' ? 'Error Occurred' : 'Warning'}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                {message}
              </Typography>
              
              {details && (
                <Box sx={{ mt: 2 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    onClick={() => setExpanded(!expanded)}
                    sx={{ mb: 1 }}
                  >
                    {expanded ? 'Hide Details' : 'Show Details'}
                  </Button>
                  <Collapse in={expanded}>
                    <Box 
                      sx={{ 
                        p: 2, 
                        bgcolor: 'background.default', 
                        borderRadius: 1,
                        maxHeight: '200px',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem'
                      }}
                    >
                      {details}
                    </Box>
                  </Collapse>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              {onRetry && (
                <Button onClick={handleRetry} color="primary">
                  Retry
                </Button>
              )}
              <Button onClick={handleClose} color={severity}>
                Close
              </Button>
            </DialogActions>
          </Dialog>
        );
        
      case 'alert':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Alert 
              severity={severity} 
              onClose={handleClose}
              sx={{ mb: 2 }}
              action={
                onRetry && (
                  <Button 
                    color="inherit" 
                    size="small" 
                    onClick={handleRetry}
                  >
                    Retry
                  </Button>
                )
              }
            >
              <AlertTitle>{severity === 'error' ? 'Error' : 'Warning'}</AlertTitle>
              {message}
              
              {details && (
                <Box sx={{ mt: 1 }}>
                  <Button 
                    size="small" 
                    variant="text" 
                    color="inherit"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? 'Hide Details' : 'Show Details'}
                  </Button>
                  <Collapse in={expanded}>
                    <Box 
                      sx={{ 
                        mt: 1,
                        p: 1, 
                        bgcolor: 'background.default', 
                        borderRadius: 1,
                        maxHeight: '100px',
                        overflowY: 'auto',
                        fontFamily: 'monospace',
                        fontSize: '0.75rem'
                      }}
                    >
                      {details}
                    </Box>
                  </Collapse>
                </Box>
              )}
            </Alert>
          </motion.div>
        );
    }
  };
  
  return open ? renderErrorComponent() : null;
};

export default ApiErrorHandler;