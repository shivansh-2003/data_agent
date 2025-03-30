import React from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import styled from 'styled-components';

const MessageContainer = styled(Box)`
  display: flex;
  margin-bottom: 16px;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
`;

const AvatarContainer = styled(Box)`
  margin: ${props => props.isUser ? '0 0 0 12px' : '0 12px 0 0'};
`;

const MessageBubble = styled(Paper)`
  padding: 12px 16px;
  max-width: 80%;
  border-radius: 16px;
  background-color: ${props => props.isUser ? '#2196F3' : '#f5f5f5'};
  color: ${props => props.isUser ? '#ffffff' : '#333333'};
  box-shadow: ${props => props.isUser ? '0 2px 8px rgba(33, 150, 243, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.05)'};
`;

const MessageTime = styled(Typography)`
  font-size: 0.7rem;
  color: ${props => props.isUser ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.5)'};
  margin-top: 4px;
  text-align: ${props => props.isUser ? 'right' : 'left'};
`;

const ChatBubble = ({ message, isUser, timestamp }) => {
  const formattedTime = timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  
  return (
    <MessageContainer isUser={isUser}>
      <AvatarContainer isUser={isUser}>
        <Avatar sx={{ bgcolor: isUser ? '#1976d2' : '#f5f5f5' }}>
          {isUser ? <PersonIcon sx={{ color: '#ffffff' }} /> : <SmartToyIcon sx={{ color: '#2196F3' }} />}
        </Avatar>
      </AvatarContainer>
      <Box>
        <MessageBubble isUser={isUser} elevation={0}>
          <Typography variant="body1">
            {message}
          </Typography>
        </MessageBubble>
        {timestamp && (
          <MessageTime isUser={isUser} variant="caption">
            {formattedTime}
          </MessageTime>
        )}
      </Box>
    </MessageContainer>
  );
};

export default ChatBubble;