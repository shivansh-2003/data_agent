import React from 'react';
import { 
  Box, 
  Typography, 
  LinearProgress, 
  Paper, 
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CloseIcon from '@mui/icons-material/Close';
import { motion } from 'framer-motion';

/**
 * FileUploadProgress component
 * Displays progress information for file uploads
 */
const FileUploadProgress = ({ 
  file, 
  progress = 0, 
  status = 'uploading', // 'uploading', 'success', 'error'
  error = null,
  onCancel,
  onDismiss
}) => {
  // Format bytes to human-readable size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Get status info
  const getStatusInfo = () => {
    switch (status) {
      case 'success':
        return {
          color: 'success',
          icon: <CheckCircleIcon />,
          text: 'Upload Complete'
        };
      case 'error':
        return {
          color: 'error',
          icon: <ErrorIcon />,
          text: 'Upload Failed'
        };
      case 'uploading':
      default:
        return {
          color: 'primary',
          icon: <CircularProgress size={16} />,
          text: 'Uploading...'
        };
    }
  };
  
  const statusInfo = getStatusInfo();
  
  // Calculate uploaded size
  const uploadedSize = file ? Math.round((progress / 100) * file.size) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          position: 'relative'
        }}
      >
        {/* Close button */}
        {(status === 'success' || status === 'error') && onDismiss && (
          <IconButton
            size="small"
            sx={{ position: 'absolute', top: 8, right: 8 }}
            onClick={onDismiss}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
        
        {/* File info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
            {file?.name || 'File'}
          </Typography>
          <Chip
            size="small"
            label={statusInfo.text}
            color={statusInfo.color}
            icon={statusInfo.icon}
          />
        </Box>
        
        {/* Progress bar */}
        {status === 'uploading' && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(uploadedSize)} of {formatFileSize(file?.size || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {progress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 6, borderRadius: 3 }}
            />
            {onCancel && (
              <Box sx={{ mt: 1, textAlign: 'right' }}>
                <Chip
                  label="Cancel"
                  size="small"
                  variant="outlined"
                  onClick={onCancel}
                  sx={{ cursor: 'pointer' }}
                />
              </Box>
            )}
          </Box>
        )}
        
        {/* Error message */}
        {status === 'error' && error && (
          <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
            {error}
          </Typography>
        )}
        
        {/* Processing info for success */}
        {status === 'success' && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            File has been processed and is ready for analysis.
          </Typography>
        )}
      </Paper>
    </motion.div>
  );
};

export default FileUploadProgress;