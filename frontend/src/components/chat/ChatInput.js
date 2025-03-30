import React, { useState } from 'react';
import { Box, TextField, IconButton, Paper } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import MicIcon from '@mui/icons-material/Mic';
import styled from 'styled-components';
import Button from '../common/Button';

const InputContainer = styled(Paper)`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  border-radius: 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  background-color: #f8f9fa;
`;

const StyledTextField = styled(TextField)`
  .MuiOutlinedInput-root {
    border-radius: 24px;
    background-color: transparent;
    
    fieldset {
      border: none;
    }
  }
  
  .MuiOutlinedInput-input {
    padding: 12px 0;
  }
`;

const ActionButton = styled(IconButton)`
  margin-left: 8px;
  background-color: ${props => props.primary ? '#2196F3' : 'transparent'};
  color: ${props => props.primary ? '#ffffff' : '#757575'};
  
  &:hover {
    background-color: ${props => props.primary ? '#1976d2' : 'rgba(0, 0, 0, 0.04)'};
  }
`;

const ChatInput = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && onSendMessage) {
      onSendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <InputContainer elevation={0}>
        <ActionButton size="medium" color="default">
          <AttachFileIcon />
        </ActionButton>
        
        <StyledTextField
          fullWidth
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={disabled}
          autoComplete="off"
        />
        
        <ActionButton size="medium" color="default">
          <MicIcon />
        </ActionButton>
        
        <ActionButton 
          type="submit" 
          primary 
          size="medium" 
          disabled={!message.trim() || disabled}
        >
          <SendIcon />
        </ActionButton>
      </InputContainer>
    </Box>
  );
};

export default ChatInput;