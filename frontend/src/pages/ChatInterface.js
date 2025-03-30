import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, IconButton, Avatar, Tooltip, Divider } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInput from '../components/chat/ChatInput';
import ChatBubble from '../components/chat/ChatBubble';
import SuggestionChips from '../components/chat/SuggestionChips';
import '../index.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { text: 'Hello! I\'m your AI data assistant. How can I help you today?', sender: 'bot', timestamp: new Date() }
  ]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    'Analyze my sales data',
    'Create a visualization',
    'Explain this dataset',
    'Find patterns in my data'
  ]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (text) => {
    // Add user message
    const userMessage = { text, sender: 'user', timestamp: new Date() };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    // Show typing indicator
    setLoading(true);
    
    // Simulate API call for bot response
    setTimeout(() => {
      const botResponse = { 
        text: 'I\'m analyzing your request. This is a simulated response for demonstration purposes.', 
        sender: 'bot', 
        timestamp: new Date() 
      };
      setMessages(prevMessages => [...prevMessages, botResponse]);
      setLoading(false);
      
      // Update suggestions based on the conversation
      setSuggestions([
        'Tell me more about this data',
        'How can I improve my analysis?',
        'Show me a different visualization'
      ]);
    }, 1500);
  };

  const handleSuggestionSelect = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // Function to create particles for animation effects
  const createParticles = () => {
    const particles = [];
    for (let i = 0; i < 15; i++) {
      const size = Math.random() * 10 + 5;
      particles.push(
        <motion.div
          key={i}
          className="particle"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            scale: 0,
            opacity: 0
          }}
          animate={{
            y: [null, -Math.random() * 500 - 100],
            x: [null, (Math.random() - 0.5) * 200],
            rotate: [0, Math.random() * 360],
            scale: [0, Math.random() * 0.5 + 0.5, 0],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: Math.random() * 20 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear"
          }}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: `rgba(${139 + Math.random() * 20}, ${92 + Math.random() * 20}, ${246 + Math.random() * 10}, ${Math.random() * 0.3 + 0.1})`,
            boxShadow: `0 0 ${Math.random() * 10 + 5}px rgba(139, 92, 246, 0.5)`
          }}
        />
      );
    }
    return particles;
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 64px)',
      bgcolor: '#f9fafb',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="particles-container">
        {createParticles()}
      </div>
      
      {/* Header */}
      <Box sx={{
        bgcolor: '#6366f1',
        p: 2,
        color: 'white',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#4f46e5', mr: 2 }}>
            <SendIcon />
          </Avatar>
          <Typography variant="h6" component="h1">
            AI Data Assistant
          </Typography>
        </Box>
        <Typography variant="body2">
          Powered by advanced analytics
        </Typography>
      </Box>

      {/* Chat Messages */}
      <Box 
        className="chat-container hover-3d"
        sx={{
          flex: 1,
          p: 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          position: 'relative'
        }}
      >
        <AnimatePresence>
          {messages.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ChatBubble 
                message={msg.text}
                isUser={msg.sender === 'user'}
                timestamp={msg.timestamp}
              />
            </motion.div>
          ))}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Box sx={{ display: 'flex', ml: 7, mt: 1 }}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop' }}
                  style={{ marginRight: 4, width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }}
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0.15 }}
                  style={{ marginRight: 4, width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }}
                />
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatType: 'loop', delay: 0.3 }}
                  style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1' }}
                />
              </Box>
            </motion.div>
          )}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Suggestion Chips */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.05)' }}>
        <SuggestionChips 
          suggestions={suggestions} 
          onSelect={handleSuggestionSelect} 
        />
      </Box>
      
      {/* Input Area */}
      <Box sx={{ p: 2, borderTop: '1px solid rgba(0,0,0,0.05)', bgcolor: 'white' }}>
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={loading}
        />
      </Box>
    </Box>
  );
};

export default ChatInterface;