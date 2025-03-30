import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * Animated particles background for use on landing page and other key pages
 * Creates a modern, dynamic background with floating particles
 */
const ParticlesBackground = ({ 
  count = 30, 
  color = '#6366f1', 
  secondaryColor = '#8b5cf6',
  speed = 1,
  size = 1,
  opacity = 0.5,
  blending = true
}) => {
  // Create particles
  const particles = [];
  const minSize = 5 * size;
  const maxSize = 15 * size;
  
  // Create a unique key for each particle
  for (let i = 0; i < count; i++) {
    const particleSize = Math.random() * (maxSize - minSize) + minSize;
    const isSecondary = Math.random() > 0.6;
    const particleColor = isSecondary ? secondaryColor : color;
    const particleOpacity = (Math.random() * 0.3 + 0.2) * opacity;
    const delay = Math.random() * 10;
    const duration = (Math.random() * 20 + 10) / speed;
    
    particles.push(
      <motion.div
        key={`particle-${i}`}
        initial={{
          x: `${Math.random() * 100}vw`,
          y: `${Math.random() * 100}vh`,
          scale: 0,
          opacity: 0
        }}
        animate={{
          y: [`${Math.random() * 100}vh`, `${Math.random() * 100}vh`],
          x: [`${Math.random() * 100}vw`, `${Math.random() * 100}vw`],
          rotate: [0, Math.random() * 360],
          scale: [0, Math.random() * 0.5 + 0.5, 0],
          opacity: [0, particleOpacity, 0]
        }}
        transition={{
          duration: duration,
          repeat: Infinity,
          delay: delay,
          ease: "linear"
        }}
        style={{
          position: 'absolute',
          width: particleSize,
          height: particleSize,
          borderRadius: '50%',
          background: particleColor,
          boxShadow: `0 0 ${particleSize/2}px ${particleColor}`,
          mixBlendMode: blending ? 'screen' : 'normal',
          pointerEvents: 'none',
        }}
      />
    );
  }
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: -1,
        pointerEvents: 'none',
      }}
    >
      {particles}
    </div>
  );
};

export default ParticlesBackground;