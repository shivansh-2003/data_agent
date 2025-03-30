import React, { useState, useCallback } from 'react';
import { Box, Typography, Paper, Button as MuiButton } from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import styled from 'styled-components';
import Button from '../common/Button';

const UploadContainer = styled(Paper)`
  border: 2px dashed ${props => props.isDragActive ? '#2196F3' : '#e0e0e0'};
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  background-color: ${props => props.isDragActive ? 'rgba(33, 150, 243, 0.04)' : '#ffffff'};
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    border-color: #2196F3;
    background-color: rgba(33, 150, 243, 0.04);
  }
`;

const FilePreview = styled(Box)`
  display: flex;
  align-items: center;
  padding: 12px;
  margin-top: 16px;
  border-radius: 8px;
  background-color: #f5f5f5;
`;

const FileIcon = styled(InsertDriveFileIcon)`
  margin-right: 12px;
  color: #607d8b;
`;

const FileUploader = ({ onFileUpload, acceptedFileTypes = {
  'text/csv': ['.csv'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-excel': ['.xls'],
  'text/plain': ['.txt'],
  'application/json': ['.json'],
  'application/pdf': ['.pdf']
} }) => {
  const [files, setFiles] = useState([]);
  
  const onDrop = useCallback(acceptedFiles => {
    setFiles(acceptedFiles);
    if (onFileUpload && acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles);
    }
  }, [onFileUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles: 1
  });
  
  const clearFiles = (e) => {
    e.stopPropagation();
    setFiles([]);
  };
  
  return (
    <Box>
      <UploadContainer {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: isDragActive ? '#2196F3' : '#9e9e9e', mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          or
        </Typography>
        <Button variant="outlined" color="primary" sx={{ mt: 1 }}>
          Browse Files
        </Button>
        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 2 }}>
          Supported formats: CSV, Excel, TXT, JSON, PDF
        </Typography>
      </UploadContainer>
      
      {files.length > 0 && (
        <Box mt={3}>
          <Typography variant="subtitle2" gutterBottom>
            Selected File:
          </Typography>
          {files.map(file => (
            <FilePreview key={file.name}>
              <FileIcon />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" noWrap>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {(file.size / 1024).toFixed(2)} KB
                </Typography>
              </Box>
              <MuiButton size="small" onClick={clearFiles}>
                Remove
              </MuiButton>
            </FilePreview>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FileUploader;