import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  IconButton, 
  Tooltip, 
  Chip,
  Zoom,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button
} from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import CodeIcon from '@mui/icons-material/Code';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';
import ReactPlotly from './ReactPlotly';

/**
 * Enhanced Plotly Visualization Component
 * Renders Plotly visualizations with responsive features and improved UI
 */
const PlotlyViz = ({ 
  htmlContent, 
  title = "Data Visualization",
  code = null,
  onDownload = null,
  height = 400
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showCode, setShowCode] = useState(false);
  
  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  const handleCodeToggle = () => {
    setShowCode(!showCode);
  };
  
  const handleDownload = () => {
    if (typeof onDownload === 'function') {
      onDownload();
    } else {
      // Default download - in a real app we'd have a proper implementation
      const plotElement = document.querySelector('.js-plotly-plot');
      if (plotElement) {
        // Use Plotly's toImage functionality
        const Plotly = window.Plotly;
        if (Plotly && Plotly.toImage) {
          Plotly.toImage(plotElement, {format: 'png', width: 800, height: 600})
            .then(function(dataUrl) {
              const link = document.createElement('a');
              link.download = 'visualization.png';
              link.href = dataUrl;
              link.click();
            });
        }
      }
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card 
        sx={{ 
          mb: 2, 
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
          <Box>
            {code && (
              <Tooltip title="View code">
                <IconButton size="small" onClick={handleCodeToggle} sx={{ mx: 0.5 }}>
                  <CodeIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Download as image">
              <IconButton size="small" onClick={handleDownload} sx={{ mx:.5 }}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullscreen ? "Exit fullscreen" : "Fullscreen mode"}>
              <IconButton size="small" onClick={handleFullscreenToggle} sx={{ mx: .5 }}>
                <FullscreenIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Regular view */}
        {!isFullscreen && (
          <ReactPlotly 
            htmlContent={htmlContent}
            height={height}
          />
        )}
        
        {/* Info footer */}
        <Box sx={{ 
          p: 1.5, 
          borderTop: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          bgcolor: 'background.paper'
        }}>
          <Zoom in={true} style={{ transitionDelay: '300ms' }}>
            <Chip 
              icon={<InfoIcon fontSize="small" />} 
              label="Interactive" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          </Zoom>
          <Typography variant="caption" color="text.secondary">
            Hover over elements for more information
          </Typography>
        </Box>
      </Card>
      
      {/* Fullscreen dialog */}
      <Dialog
        open={isFullscreen}
        fullScreen
        onClose={handleFullscreenToggle}
        sx={{ 
          '& .MuiDialog-paper': { 
            backgroundColor: 'background.default'
          }
        }}
      >
        <DialogTitle sx={{ 
          m: 0, 
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleFullscreenToggle}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <ReactPlotly 
            htmlContent={htmlContent}
            height={window.innerHeight - 200} // Adjust for dialog padding
          />
        </DialogContent>
      </Dialog>
      
      {/* Code dialog */}
      <Dialog
        open={showCode}
        onClose={handleCodeToggle}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Visualization Code</DialogTitle>
        <DialogContent dividers>
          <Box
            component="pre"
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              maxHeight: '70vh',
              overflow: 'auto',
              fontSize: '0.875rem',
              fontFamily: 'monospace'
            }}
          >
            {code || 'No code available'}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCodeToggle}>Close</Button>
        </DialogActions>
      </Dialog>
    </motion.div>
  );
};

export default PlotlyViz; 