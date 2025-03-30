import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { motion, AnimatePresence } from 'framer-motion';
import '../index.css';

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      // TODO: Add API call to handle bot response
    }
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
      position: 'relative'
    }}>
      <div className="particles-container">
        {createParticles()}
      </div>
      <Box sx={{
        bgcolor: '#6366f1',
        p: 2,
        color: 'white',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <Typography variant="h6" component="h1">
          AI Assistant
        </Typography>
      </Box>

      <Box 
        className="chat-container hover-3d"
        sx={{
          flex: 1,
          p: 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: index * 0.1 % 0.5 // Staggered delay for messages
              }}
            >
              <Box
                className={message.sender === 'user' ? 'message-user' : 'message-bot'}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  width: '100%'
                }}
              >
                <Paper
                  elevation={0}
                  className={`glow-effect ${message.sender === 'user' ? 'pulse' : ''}`}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    bgcolor: message.sender === 'user' ? '#8b5cf6' : 'white',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 5px 15px rgba(139, 92, 246, 0.2)'
                    }
                  }}
                >
                  <Typography className={message.sender === 'user' ? 'gradient-text' : ''}>
                    {message.text}
                  </Typography>
                </Paper>
              </Box>
            </motion.div>
          ))}
        </AnimatePresence>
        {messages.length > 0 && messages[messages.length - 1].sender === 'user' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </Box>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 500, damping: 30 }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            p: 2,
            bgcolor: 'white',
            borderTop: '1px solid rgba(0,0,0,0.1)',
            display: 'flex',
            gap: 1,
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 -5px 20px rgba(0,0,0,0.05)'
          }}
        >
          <motion.div
            whileTap={{ scale: 0.98 }}
            style={{ flex: 1 }}
          >
            <Box
              component="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              sx={{
                width: '100%',
                p: 1.5,
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: 2,
                outline: 'none',
                transition: 'all 0.3s ease',
                '&:focus': {
                  borderColor: '#6366f1',
                  boxShadow: '0 0 0 3px rgba(99, 102, 241, 0.2)'
                }
              }}
            />
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <IconButton
              className="send-button"
              type="submit"
              sx={{
                bgcolor: '#6366f1',
                color: 'white',
                '&:hover': {
                  bgcolor: '#4f46e5'
                }
              }}
            >
              <SendIcon />
            </IconButton>
          </motion.div>
      </Box>
      </motion.div>
    </Box>
  );
};

export default ChatInterface;