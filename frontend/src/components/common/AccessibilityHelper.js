import React from 'react';
import { Box, Typography, Tooltip, IconButton, Fab } from '@mui/material';
import { 
  AccessibilityNew as AccessibilityIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  TextIncrease as TextIncreaseIcon,
  TextDecrease as TextDecreaseIcon,
  ColorLens as ColorLensIcon,
  Check as CheckIcon
} from '@mui/icons-material';

/**
 * Accessibility Helper Component
 * Provides accessibility controls for users with different needs
 */
const AccessibilityHelper = ({ 
  position = 'bottom-right',
  showLabels = false,
  fixed = true
}) => {
  // Font size adjustment
  const [fontSize, setFontSize] = React.useState(100); // 100% is default
  
  // Contrast mode
  const [highContrast, setHighContrast] = React.useState(false);
  
  // Focus mode
  const [focusMode, setFocusMode] = React.useState(false);
  
  // Screen reader announcement
  const [announcement, setAnnouncement] = React.useState('');
  
  // Menu open state
  const [menuOpen, setMenuOpen] = React.useState(false);
  
  // Position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'top-left':
        return { top: 16, left: 16 };
      case 'top-right':
        return { top: 16, right: 16 };
      case 'bottom-left':
        return { bottom: 16, left: 16 };
      case 'bottom-right':
      default:
        return { bottom: 16, right: 16 };
    }
  };
  
  // Update font size
  const changeFontSize = (increase) => {
    setFontSize(prev => {
      const newSize = increase ? prev + 10 : prev - 10;
      // Limit font size between 70% and 150%
      const limitedSize = Math.min(Math.max(newSize, 70), 150);
      
      // Apply font size to document
      document.documentElement.style.fontSize = `${limitedSize}%`;
      
      // Announce change to screen readers
      announceChange(`Font size changed to ${limitedSize}%`);
      
      return limitedSize;
    });
  };
  
  // Toggle high contrast
  const toggleHighContrast = () => {
    setHighContrast(prev => {
      const newValue = !prev;
      
      // Apply high contrast class to body
      if (newValue) {
        document.body.classList.add('high-contrast');
        announceChange('High contrast mode enabled');
      } else {
        document.body.classList.remove('high-contrast');
        announceChange('High contrast mode disabled');
      }
      
      return newValue;
    });
  };
  
  // Toggle focus mode
  const toggleFocusMode = () => {
    setFocusMode(prev => {
      const newValue = !prev;
      
      // Apply focus mode class to body
      if (newValue) {
        document.body.classList.add('focus-mode');
        announceChange('Focus mode enabled');
      } else {
        document.body.classList.remove('focus-mode');
        announceChange('Focus mode disabled');
      }
      
      return newValue;
    });
  };
  
  // Announce change to screen readers
  const announceChange = (message) => {
    setAnnouncement(message);
    // Clear announcement after 3 seconds
    setTimeout(() => setAnnouncement(''), 3000);
  };
  
  // Toggle accessibility menu
  const toggleMenu = () => {
    setMenuOpen(prev => !prev);
  };
  
  // Menu controls
  const controls = [
    {
      icon: <TextIncreaseIcon />,
      label: 'Increase Font Size',
      action: () => changeFontSize(true),
      tooltip: 'Increase font size (current: ' + fontSize + '%)'
    },
    {
      icon: <TextDecreaseIcon />,
      label: 'Decrease Font Size',
      action: () => changeFontSize(false),
      tooltip: 'Decrease font size (current: ' + fontSize + '%)'
    },
    {
      icon: <ColorLensIcon />,
      label: 'Toggle High Contrast',
      action: toggleHighContrast,
      tooltip: highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode',
      active: highContrast
    },
    {
      icon: <ZoomInIcon />,
      label: 'Toggle Focus Mode',
      action: toggleFocusMode,
      tooltip: focusMode ? 'Disable focus mode' : 'Enable focus mode',
      active: focusMode
    }
  ];

  return (
    <>
      {/* Screen reader announcement */}
      <div 
        role="status" 
        aria-live="polite" 
        style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}
      >
        {announcement}
      </div>
      
      {/* Accessibility menu */}
      <Box
        sx={{
          position: fixed ? 'fixed' : 'absolute',
          ...getPositionStyles(),
          zIndex: 1200,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1
        }}
      >
        {menuOpen && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              mb: 1
            }}
          >
            {controls.map((control, index) => (
              <Tooltip 
                key={index} 
                title={control.tooltip} 
                placement="left"
              >
                <Fab
                  size="small"
                  color={control.active ? 'primary' : 'default'}
                  onClick={control.action}
                  aria-label={control.label}
                  sx={{ 
                    boxShadow: 2,
                    ...(showLabels && { width: 'auto', borderRadius: '24px', px: 2 })
                  }}
                >
                  {control.icon}
                  {showLabels && (
                    <Typography 
                      variant="button" 
                      sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}
                    >
                      {control.label}
                    </Typography>
                  )}
                </Fab>
              </Tooltip>
            ))}
          </Box>
        )}
        
        {/* Main accessibility button */}
        <Tooltip title="Accessibility Options">
          <Fab
            color={menuOpen ? 'primary' : 'default'}
            onClick={toggleMenu}
            aria-label="Accessibility options"
            sx={{ boxShadow: 3 }}
          >
            <AccessibilityIcon />
          </Fab>
        </Tooltip>
      </Box>
    </>
  );
};

export default AccessibilityHelper;