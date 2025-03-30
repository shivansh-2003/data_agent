import React, { useState, useCallback, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  LinearProgress, 
  Chip,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { motion } from 'framer-motion';
import { useData } from '../../context/DataContext';
import config from '../../config';

/**
 * Enhanced File Uploader Component
 * Provides drag & drop functionality with visual feedback and integration with the backend API
 */
const EnhancedFileUploader = ({ 
  onFileUploaded,
  acceptedFileTypes = config.upload.acceptedFileTypes,
  maxFileSize = config.upload.maxFileSize,
  showPreview = true
}) => {
  const { uploadFile, isLoading, error } = useData();
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [showFileTooLargeDialog, setShowFileTooLargeDialog] = useState(false);
  const [rejectedFile, setRejectedFile] = useState(null);

  // Reset status when files change
  useEffect(() => {
    if (files.length === 0) {
      setUploadStatus('idle');
      setUploadProgress(0);
    }
  }, [files]);

  // Handle file drop
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Check file size first
    if (rejectedFiles?.length > 0) {
      const rejected = rejectedFiles[0];
      
      if (rejected.file.size > maxFileSize) {
        setRejectedFile(rejected.file);
        setShowFileTooLargeDialog(true);
        return;
      }
    }
    
    if (acceptedFiles?.length > 0) {
      setFiles(acceptedFiles);
    }
  }, [maxFileSize]);

  // Configure dropzone
  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 1,
    maxSize: maxFileSize
  });

  // Handle progress updates during upload
  const handleProgress = (progress) => {
    setUploadProgress(progress);
  };

  // Handle upload
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploadStatus('uploading');
    setUploadProgress(0);
    
    try {
      const result = await uploadFile(files[0], handleProgress);
      setUploadStatus('success');
      
      // Call the callback
      if (onFileUploaded && typeof onFileUploaded === 'function') {
        onFileUploaded(files[0], result);
      }
    } catch (error) {
      console.error('File upload error:', error);
      setUploadStatus('error');
    }
  };

  // Clear file selection
  const clearFiles = () => {
    setFiles([]);
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  // Format bytes to readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get border color based on drag state
  const getBorderColor = () => {
    if (isDragReject) return 'error.main';
    if (isDragActive) return 'primary.main';
    if (uploadStatus === 'success') return 'success.main';
    if (uploadStatus === 'error') return 'error.main';
    return 'divider';
  };

  // Get dropzone background color
  const getBackgroundColor = () => {
    if (isDragActive) return 'rgba(99, 102, 241, 0.04)';
    if (uploadStatus === 'success') return 'rgba(16, 185, 129, 0.04)';
    if (uploadStatus === 'error') return 'rgba(239, 68, 68, 0.04)';
    return 'transparent';
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Dropzone */}
      <Paper
        {...getRootProps()}
        elevation={0}
        sx={{
          border: '2px dashed',
          borderColor: getBorderColor(),
          borderRadius: 2,
          p: 3,
          textAlign: 'center',
          backgroundColor: getBackgroundColor(),
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            backgroundColor: 'rgba(99, 102, 241, 0.04)'
          }
        }}
      >
        <input {...getInputProps()} />
        <motion.div
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          {uploadStatus === 'success' ? (
            <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
          ) : (
            <CloudUploadIcon sx={{ 
              fontSize: 48, 
              color: isDragReject ? 'error.main' : (isDragActive ? 'primary.main' : 'action.active'), 
              mb: 2 
            }} />
          )}
          
          <Typography variant="h6" gutterBottom>
            {isDragActive 
              ? isDragReject 
                ? 'File type not accepted' 
                : 'Drop the file here'
              : uploadStatus === 'success'
                ? 'File uploaded successfully'
                : 'Drag & drop a file here or click to browse'}
          </Typography>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {uploadStatus === 'success' 
              ? 'Your file has been processed and is ready for analysis'
              : uploadStatus === 'error'
                ? 'There was an error uploading your file'
                : 'Supported formats: CSV, Excel, PDF, and image files'}
          </Typography>
          
          {uploadStatus !== 'success' && (
            <Typography variant="caption" color="text.secondary" display="block">
              Maximum file size: {formatFileSize(maxFileSize)}
            </Typography>
          )}
        </motion.div>
      </Paper>
      
      {/* File preview */}
      {files.length > 0 && showPreview && (
        <Fade in={true}>
          <Box 
            sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 1, 
              bgcolor: 'background.paper', 
              boxShadow: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <InsertDriveFileIcon sx={{ mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="subtitle2" noWrap>
                  {files[0].name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatFileSize(files[0].size)}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              {uploadStatus === 'idle' && (
                <Button 
                  size="small" 
                  variant="contained" 
                  onClick={handleUpload}
                  disabled={isLoading}
                >
                  Upload
                </Button>
              )}
              
              <Button 
                size="small" 
                variant="outlined" 
                onClick={clearFiles}
                disabled={isLoading}
              >
                {uploadStatus === 'success' ? 'Upload Another' : 'Remove'}
              </Button>
            </Box>
          </Box>
        </Fade>
      )}
      
      {/* Upload progress */}
      {uploadStatus === 'uploading' && (
        <Fade in={true}>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Uploading...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {uploadProgress}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 6, borderRadius: 1 }}
            />
          </Box>
        </Fade>
      )}
      
      {/* Error message */}
      {(uploadStatus === 'error' || error) && (
        <Fade in={true}>
          <Alert severity="error" sx={{ mt: 2 }}>
            {error || 'There was an error uploading your file. Please try again.'}
          </Alert>
        </Fade>
      )}
      
      {/* Accepted file types display */}
      <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {Object.entries(acceptedFileTypes).map(([mimeType, extensions]) => (
          extensions.map(ext => (
            <Chip
              key={ext}
              label={ext}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))
        ))}
      </Box>
      
      {/* File too large dialog */}
      <Dialog
        open={showFileTooLargeDialog}
        onClose={() => setShowFileTooLargeDialog(false)}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon color="warning" sx={{ mr: 1 }} />
            File Too Large
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">
            The file <strong>{rejectedFile?.name}</strong> exceeds the maximum allowed size of {formatFileSize(maxFileSize)}.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Current file size: {rejectedFile ? formatFileSize(rejectedFile.size) : ''}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Please try one of the following:
          </Typography>
          <ul>
            <li>Choose a smaller file</li>
            <li>Compress your file before uploading</li>
            <li>Split your data into multiple smaller files</li>
          </ul>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFileTooLargeDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EnhancedFileUploader;