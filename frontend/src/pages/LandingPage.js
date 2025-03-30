import React from 'react';
import { Box, Container, Typography, Button, Grid, Card, CardContent, CardMedia, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import ChatIcon from '@mui/icons-material/Chat';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InsightsIcon from '@mui/icons-material/Insights';
import PsychologyIcon from '@mui/icons-material/Psychology';

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <motion.div
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
        >
          {icon}
        </motion.div>
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="h2" align="center" fontWeight="600">
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center">
          {description}
        </Typography>
      </CardContent>
    </Card>
  </motion.div>
);

const LandingPage = () => {
  const features = [
    {
      icon: <BarChartIcon sx={{ fontSize: 60, color: '#6366f1' }} />,
      title: 'Interactive Visualizations',
      description: 'Generate beautiful, interactive charts and graphs from your data with a simple request.',
      delay: 0.2
    },
    {
      icon: <InsightsIcon sx={{ fontSize: 60, color: '#8b5cf6' }} />,
      title: 'AI-Powered Insights',
      description: 'Discover hidden patterns and trends in your data through advanced AI analysis.',
      delay: 0.3
    },
    {
      icon: <ChatIcon sx={{ fontSize: 60, color: '#6366f1' }} />,
      title: 'Natural Language Interface',
      description: 'Ask questions about your data in plain English and get instant answers.',
      delay: 0.4
    },
    {
      icon: <UploadFileIcon sx={{ fontSize: 60, color: '#8b5cf6' }} />,
      title: 'Multi-format Support',
      description: 'Upload CSV, Excel, PDF, or even images containing tables for instant analysis.',
      delay: 0.5
    },
    {
      icon: <AutoGraphIcon sx={{ fontSize: 60, color: '#6366f1' }} />,
      title: 'Advanced Analytics',
      description: 'Perform complex statistical analysis, time series forecasting, and correlation studies.',
      delay: 0.6
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 60, color: '#8b5cf6' }} />,
      title: 'Smart Recommendations',
      description: 'Get personalized recommendations for visualizations and analysis based on your data.',
      delay: 0.7
    }
  ];

  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'background.paper', 
          pt: 8, 
          pb: 6,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background elements */}
        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 0 }}>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                x: [Math.random() * 100, Math.random() * window.innerWidth],
                y: [Math.random() * 100, Math.random() * window.innerHeight],
                opacity: [0.7, 0.3, 0.7],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 15 + Math.random() * 10,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                position: 'absolute',
                width: 100 + Math.random() * 200,
                height: 100 + Math.random() * 200,
                borderRadius: '50%',
                background: `rgba(${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 100 + 100)}, ${Math.floor(Math.random() * 200 + 50)}, 0.1)`,
                filter: 'blur(50px)',
              }}
            />
          ))}
        </Box>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <Typography
              component="h1"
              variant="h2"
              align="center"
              color="text.primary"
              gutterBottom
              fontWeight="700"
              sx={{
                background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Data Analyst AI Assistant
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Typography variant="h5" align="center" color="text.secondary" paragraph>
              Unlock the power of your data with AI-driven analysis and visualization.
              Upload your data, ask questions in plain English, and get instant insights.
            </Typography>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Stack
              sx={{ pt: 4 }}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button 
                component={Link} 
                to="/dashboard" 
                variant="contained" 
                size="large"
                startIcon={<BarChartIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                  }
                }}
              >
                Get Started
              </Button>
              <Button 
                component={Link} 
                to="/chat" 
                variant="outlined" 
                size="large"
                startIcon={<ChatIcon />}
                sx={{ px: 4, py: 1.5 }}
              >
                Try the Chatbot
              </Button>
            </Stack>
          </motion.div>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h3" align="center" gutterBottom fontWeight="600">
            Features
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Powerful tools to analyze and visualize your data
          </Typography>
        </motion.div>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to action section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          p: 6,
          mt: 4,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        }}
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Container maxWidth="sm">
            <Typography variant="h4" align="center" gutterBottom fontWeight="600">
              Ready to analyze your data?
            </Typography>
            <Typography variant="subtitle1" align="center" color="text.secondary" paragraph>
              Upload your data file and start getting insights in seconds.
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 3 }}
            >
              <Button 
                component={Link} 
                to="/dashboard" 
                variant="contained" 
                size="large"
                startIcon={<UploadFileIcon />}
                sx={{
                  background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
                  px: 4,
                  '&:hover': {
                    background: 'linear-gradient(90deg, #4f46e5 0%, #7c3aed 100%)',
                  }
                }}
              >
                Upload Data
              </Button>
            </Stack>
          </Container>
        </motion.div>
      </Box>
    </Box>
  );
};

export default LandingPage;