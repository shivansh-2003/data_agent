import React, { useState, useEffect } from 'react';
import { 
  Snackbar, 
  Alert, 
  Button, 
  Typography, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box
} from '@mui/material';
import { 
  Info as InfoIcon, 
  NewReleases as NewReleasesIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  BugReport as BugReportIcon,
  EmojiObjects as FeatureIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';

/**
 * Updates Notification Component
 * Shows notifications about new features, updates, etc.
 */
const UpdatesNotification = ({ 
  updates = null, 
  checkInterval = 3600000, // 1 hour
  storageKey = 'last_seen_update',
  apiUrl = 'https://data-agent-ww7e.onrender.com/health'
}) => {
  const [open, setOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentUpdate, setCurrentUpdate] = useState(null);
  
  // Check for updates when component mounts
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // Try to get updates from the API or use provided ones
        let latestUpdates = updates;
        
        if (!latestUpdates) {
          const response = await fetch(apiUrl);
          const data = await response.json();
          
          if (data.updates) {
            latestUpdates = data.updates;
          }
        }
        
        if (!latestUpdates || !latestUpdates.length) {
          return;
        }
        
        // Sort updates by date (newest first)
        latestUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Get the latest update
        const latestUpdate = latestUpdates[0];
        
        // Check if user has seen this update
        const lastSeenTimestamp = localStorage.getItem(storageKey);
        
        if (lastSeenTimestamp) {
          const lastSeen = new Date(lastSeenTimestamp);
          const updateDate = new Date(latestUpdate.date);
          
          // If update is newer than last seen, show notification
          if (updateDate > lastSeen) {
            setCurrentUpdate(latestUpdate);
            setOpen(true);
          }
        } else {
          // No record of seen updates, show the latest
          setCurrentUpdate(latestUpdate);
          setOpen(true);
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };
    
    // Check immediately and then at intervals
    checkForUpdates();
    const interval = setInterval(checkForUpdates, checkInterval);
    
    return () => clearInterval(interval);
  }, [updates, apiUrl, checkInterval, storageKey]);
  
  // Handlers
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpen(false);
  };
  
  const handleViewDetails = () => {
    setOpen(false);
    setDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setDialogOpen(false);
    
    // Mark this update as seen
    if (currentUpdate) {
      localStorage.setItem(storageKey, new Date().toISOString());
    }
  };
  
  // Get icon for update type
  const getUpdateIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'feature':
        return <FeatureIcon color="primary" />;
      case 'security':
        return <SecurityIcon color="error" />;
      case 'performance':
        return <SpeedIcon color="warning" />;
      case 'bugfix':
        return <BugReportIcon color="info" />;
      default:
        return <NewReleasesIcon color="primary" />;
    }
  };
  
  // If no current update, don't render anything
  if (!currentUpdate) return null;
  
  return (
    <>
      {/* Update notification */}
      <Snackbar
        open={open}
        autoHideDuration={10000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="info"
          onClose={handleClose}
          icon={<NewReleasesIcon />}
          action={
            <Button color="inherit" size="small" onClick={handleViewDetails}>
              View
            </Button>
          }
        >
          <Typography variant="subtitle2">
            {currentUpdate.title}
          </Typography>
          <Typography variant="caption">
            {new Date(currentUpdate.date).toLocaleDateString()}
          </Typography>
        </Alert>
      </Snackbar>
      
      {/* Update details dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <NewReleasesIcon sx={{ mr: 1 }} color="primary" />
          {currentUpdate.title}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="subtitle1" gutterBottom>
            {currentUpdate.description}
          </Typography>
          
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            Released on {new Date(currentUpdate.date).toLocaleDateString()}
          </Typography>
          
          {currentUpdate.items && currentUpdate.items.length > 0 && (
            <List>
              {currentUpdate.items.map((item, index) => (
                <React.Fragment key={index}>
                  <ListItem alignItems="flex-start" disableGutters>
                    <ListItemIcon>
                      {getUpdateIcon(item.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.title}
                      secondary={item.description}
                    />
                  </ListItem>
                  {index < currentUpdate.items.length - 1 && <Divider component="li" />}
                </React.Fragment>
              ))}
            </List>
          )}
          
          {currentUpdate.link && (
            <Box sx={{ mt: 2 }}>
              <Button 
                href={currentUpdate.link} 
                target="_blank" 
                rel="noopener noreferrer"
                variant="outlined"
                startIcon={<InfoIcon />}
                size="small"
              >
                Learn More
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdatesNotification;