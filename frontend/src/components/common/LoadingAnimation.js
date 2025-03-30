import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

/**
 * Enhanced loading animation component
 * Provides a visually appealing loading indicator for API requests
 */
const LoadingAnimation = ({ message = 'Loading...', size = 'medium', color = 'primary' }) => {
  // Define size values
  const sizeMap = {
    small: { container: 40, circle: 4 },
    medium: { container: 60, circle: 6 },
    large: { container: 80, circle: 8 }
  };
  
  // Define color values
  const colorMap = {
    primary: ['#6366f1', '#8b5cf6'],
    secondary: ['#8b5cf6', '#ec4899'],
    success: ['#10b981', '#6ee7b7'],
    error: ['#ef4444', '#fca5a5'],
    warning: ['#f59e0b', '#fcd34d'],
    info: ['#3b82f6', '#93c5fd']
  };
  
  // Get appropriate sizes
  const containerSize = typeof size === 'number' ? size : sizeMap[size]?.container || sizeMap.medium.container;
  const circleSize = typeof size === 'number' ? size/10 : sizeMap[size]?.circle || sizeMap.medium.circle;
  
  // Get appropriate colors
  const colors = colorMap[color] || colorMap.primary;

  // Animation variants for container
  const containerVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  // Animation variants for circles
  const circleVariants = {
    animate: {
      scale: [1, 1.5, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }
    }
  };

  // Create circles
  const circles = [];
  const numCircles = 8;
  
  for (let i = 0; i < numCircles; i++) {
    const angle = (i / numCircles) * 2 * Math.PI;
    const x = Math.cos(angle) * (containerSize / 2 - circleSize);
    const y = Math.sin(angle) * (containerSize / 2 - circleSize);
    
    circles.push(
      <motion.div
        key={i}
        variants={circleVariants}
        custom={i}
        animate="animate"
        style={{
          position: 'absolute',
          left: `calc(50% + ${x}px - ${circleSize / 2}px)`,
          top: `calc(50% + ${y}px - ${circleSize / 2}px)`,
          width: circleSize,
          height: circleSize,
          borderRadius: '50%',
          background: colors[i % 2],
          boxShadow: `0 0 ${circleSize / 2}px ${colors[i % 2]}`,
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: containerSize,
          height: containerSize
        }}
      >
        <motion.div
          variants={containerVariants}
          animate="animate"
          style={{
            width: '100%',
            height: '100%',
            position: 'relative'
          }}
        >
          {circles}
        </motion.div>
      </Box>
      
      {message && (
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ mt: 1, textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingAnimation;