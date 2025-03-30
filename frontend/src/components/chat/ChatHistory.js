import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import styled from 'styled-components';
import ChatBubble from './ChatBubble';

const ChatContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
  height: 100%;
  background-color: #ffffff;
`;

const DateDivider = styled(Box)`
  display: flex;
  align-items: center;
  margin: 16px 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  &::before {
    margin-right: 16px;
  }
  
  &::after {
    margin-left: 16px;
  }
`;

const EmptyStateContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 24px;
  text-align: center;
  color: #757575;
`;

const ChatHistory = ({ messages = [], loading = false }) => {
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};
    
    messages.forEach(message => {
      const date = new Date(message.timestamp);
      const dateStr = date.toLocaleDateString();
      
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      
      groups[dateStr].push(message);
    });
    
    return groups;
  };
  
  const messageGroups = groupMessagesByDate();
  
  if (messages.length === 0) {
    return (
      <EmptyStateContainer>
        <Typography variant="h6" gutterBottom>
          No messages yet
        </Typography>
        <Typography variant="body2">
          Start a conversation by typing a message below.
        </Typography>
      </EmptyStateContainer>
    );
  }
  
  return (
    <ChatContainer>
      {Object.entries(messageGroups).map(([date, msgs]) => (
        <Box key={date}>
          <DateDivider>
            <Typography variant="caption" color="textSecondary">
              {date}
            </Typography>
          </DateDivider>
          
          {msgs.map((msg, index) => (
            <ChatBubble
              key={index}
              message={msg.content}
              isUser={msg.sender === 'user'}
              timestamp={msg.timestamp}
            />
          ))}
        </Box>
      ))}
      <div ref={messagesEndRef} />
    </ChatContainer>
  );
};

export default ChatHistory;