import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  TextField, 
  IconButton, 
  Avatar, 
  CircularProgress,
  Button,
  Card,
  CardContent,
  Chip,
  Tooltip,
  Zoom
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ChatService from '../../services/chatService';
import LoadingAnimation from '../common/LoadingAnimation';

/**
 * Enhanced chat interface for interacting with the data analyst AI
 * Connects to the backend API and supports dynamic message rendering with visualizations
 */
const EnhancedChatInterface = ({ 
  initialMessages = [],
  showSuggestions = true,
  showClearButton = true,
  fullHeight = true
}) => {
  const { token } = useAuth();
  const { dataLoaded } = useData();
  const [chatService] = useState(() => new ChatService(token));
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([
    'Analyze this dataset',
    'Show me a visualization of the data',
    'What insights can you provide?',
    'Summarize the key findings'
  ]);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history on mount
  useEffect(() => {
    if (chatService) {
      const history = chatService.getMessageHistory();
      if (history.length > 0) {
        setMessages(history);
      }
    }
  }, [chatService]);

  // Generate suggestions based on data state
  useEffect(() => {
    if (dataLoaded && messages.length === 0) {
      // Generate initial suggestions based on the data
      // In a real implementation, this might call the chatService.getSuggestedQueries()
      setSuggestions([
        'Analyze this dataset',
        'Show me the distribution of values',
        'Create a bar chart of the main categories',
        'Identify trends and patterns in the data',
        'What are the key statistics?'
      ]);
    } else if (messages.length > 0) {
      // Generate contextual suggestions based on conversation
      // This could be powered by the AI in a real implementation
      setSuggestions([
        'Tell me more about this analysis',
        'Can you explain this differently?',
        'Show me a different visualization',
        'What else can you tell me about the data?'
      ]);
    }
  }, [dataLoaded, messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    
    if (!input.trim() && e) return;
    
    const messageText = input.trim() || e;
    setInput('');
    
    // Add user message to state
    const userMessage = { 
      content: messageText, 
      sender: 'user', 
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    
    // Send message to chatService
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await chatService.sendMessage(messageText);
      
      // Get updated message history from service
      const updatedHistory = chatService.getMessageHistory();
      setMessages(updatedHistory);
      
    } catch (err) {
      setError('Failed to get response. Please try again.');
      console.error('Chat error:', err);
      
      // Add error message
      setMessages(prev => [
        ...prev, 
        { 
          content: 'Sorry, I encountered an error processing your request. Please try again.', 
          sender: 'assistant', 
          timestamp: new Date().toISOString(),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
      // Focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  const handleClearChat = () => {
    setMessages([]);
    chatService.clearMessageHistory();
  };

  // Disable input if no data is loaded
  const inputDisabled = isLoading || !dataLoaded;

  // Render message content based on type
  const renderMessageContent = (message) => {
    if (message.visualization) {
      // If message contains visualization HTML
      return (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {message.content}
          </Typography>
          <Card variant="outlined" sx={{ mb: 2, overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <div dangerouslySetInnerHTML={{ __html: message.visualization }} />
            </CardContent>
          </Card>
          {message.visualization_code && (
            <Typography variant="caption" color="text.secondary">
              Visualization code available
            </Typography>
          )}
        </Box>
      );
    } else {
      // Regular text message
      return (
        <Typography variant="body1">
          {message.content}
        </Typography>
      );
    }
  };

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: fullHeight ? 'calc(100vh - 150px)' : '600px',
        bgcolor: 'background.paper',
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 1
      }}
    >
      {/* Chat header */}
      <Box 
        sx={{ 
          p: 2, 
          backgroundColor: 'primary.main', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'primary.dark', mr: 1 }}>
            <SmartToyIcon />
          </Avatar>
          <Typography variant="h6">Data Analyst Assistant</Typography>
        </Box>
        
        {showClearButton && messages.length > 0 && (
          <Tooltip title="Clear chat history">
            <IconButton 
              color="inherit" 
              edge="end" 
              onClick={handleClearChat}
              size="small"
            >
              <DeleteSweepIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      <Divider />
      
      {/* Empty state for no data */}
      {!dataLoaded && (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            flexGrow: 1,
            p: 4,
            textAlign: 'center'
          }}
        >
          <AutoGraphIcon sx={{ fontSize: 60, color: 'action.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No Data Loaded
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
            Please upload a data file using the upload tool before starting a conversation.
          </Typography>
          <Button 
            variant="outlined" 
            color="primary"
            component="a"
            href="/dashboard"
          >
            Go to Dashboard
          </Button>
        </Box>
      )}
      
      {/* Messages container */}
      {dataLoaded && (
        <Box 
          sx={{ 
            flexGrow: 1, 
            overflowY: 'auto', 
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2
          }}
        >
          {/* Initial message when no messages yet */}
          {messages.length === 0 && (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                height: '100%',
                p: 3,
                opacity: 0.8
              }}
            >
              <LightbulbIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Ask me anything about your data
              </Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                I can analyze your data, create visualizations, identify patterns, and provide insights.
                Try one of the suggestions below to get started.
              </Typography>
            </Box>
          )}
          
          {/* Render messages */}
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    mb: 2
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: message.sender === 'user' ? 'primary.main' : 
                              message.isError ? 'error.main' : 'secondary.main',
                      ml: message.sender === 'user' ? 1 : 0,
                      mr: message.sender === 'user' ? 0 : 1
                    }}
                  >
                    {message.sender === 'user' ? <PersonIcon /> : <SmartToyIcon />}
                  </Avatar>
                  
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      maxWidth: '80%',
                      backgroundColor: message.sender === 'user' ? 'primary.main' : 
                                      message.isError ? 'error.light' : 'background.default',
                      color: message.sender === 'user' ? 'white' : 
                             message.isError ? 'error.contrastText' : 'text.primary',
                      borderRadius: 2,
                      border: message.sender !== 'user' ? 1 : 0,
                      borderColor: message.isError ? 'error.main' : 'divider'
                    }}
                  >
                    {renderMessageContent(message)}
                  </Paper>
                </Box>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing indicator */}
          {isLoading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                ml: 7,
                mt: 1
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: 'background.default',
                  border: 1,
                  borderColor: 'divider'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop' }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }}
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0.15 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }}
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0.3 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    Analyzing...
                  </Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
      )}
      
      {/* Suggestions */}
      {dataLoaded && showSuggestions && (
        <Box 
          sx={{ 
            p: 2, 
            bgcolor: 'background.paper', 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1
          }}
        >
          {suggestions.map((suggestion, index) => (
            <Zoom in key={index} style={{ transitionDelay: `${index * 50}ms` }}>
              <Chip
                label={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                clickable
                variant="outlined"
                color="primary"
                sx={{ 
                  '&:hover': { 
                    backgroundColor: 'rgba(99, 102, 241, 0.08)',
                    transform: 'translateY(-2px)',
                    transition: 'transform 0.2s'
                  } 
                }}
              />
            </Zoom>
          ))}
        </Box>
      )}
      
      {/* Input area */}
      {dataLoaded && (
        <Box 
          component="form" 
          onSubmit={handleSendMessage}
          sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.default'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder={inputDisabled ? "Please upload data first..." : "Type your message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={inputDisabled}
              variant="outlined"
              size="medium"
              inputRef={inputRef}
              InputProps={{
                sx: { 
                  borderRadius: 5,
                  pr: 0.5
                }
              }}
            />
            <IconButton 
              color="primary" 
              type="submit" 
              disabled={!input.trim() || inputDisabled}
              sx={{ ml: 1 }}
            >
              {isLoading ? (
                <CircularProgress size={24} />
              ) : (
                <SendIcon />
              )}
            </IconButton>
          </Box>
          
          {error && (
            <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
              {error}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EnhancedChatInterface;