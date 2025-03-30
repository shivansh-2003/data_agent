import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Divider,
  Tabs,
  Tab,
  Alert,
  Zoom,
  LinearProgress,
  useTheme
} from '@mui/material';
import { motion } from 'framer-motion';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import StorageIcon from '@mui/icons-material/Storage';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import {
  Check as CheckIcon,
  CloudUpload as CloudUploadIcon,
  AutoGraph as AutoGraphIcon
} from '@mui/icons-material';

// Import components
import EnhancedFileUploader from '../components/data/EnhancedFileUploader';
import ApiStatusWidget from '../components/dashboard/ApiStatusWidget';
import DataPreview from '../components/data/DataPreview';
import StatisticWidget from '../components/dashboard/StatisticWidget';
import VisualizationPanel from '../components/dashboard/VisualizationPanel';
import EnhancedChatInterface from '../components/chat/EnhancedChatInterface';
import ParticlesBackground from '../components/common/ParticlesBackground';

// Import hooks and context
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

/**
 * Enhanced Dashboard Implementation
 * Connects to the backend API and displays data analysis tools
 */
const EnhancedDashboard = () => {
  const theme = useTheme();
  const { isAuthenticated, user } = useAuth();
  const { 
    dataLoaded, 
    dataPreview, 
    dataColumns, 
    dataShape, 
    dataStats,
    isLoading,
    uploadFile,
    getBasicAnalysis
  } = useData();
  
  const [activeTab, setActiveTab] = useState('upload');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupProgress, setSetupProgress] = useState(0);
  
  // Track initial setup progress
  useEffect(() => {
    if (isAuthenticated && !setupComplete) {
      const interval = setInterval(() => {
        setSetupProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setSetupComplete(true);
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, setupComplete]);
  
  // Switch to data tab when data is loaded
  useEffect(() => {
    if (dataLoaded && activeTab === 'upload') {
      setActiveTab('data');
    }
  }, [dataLoaded, activeTab]);
  
  // Handle file upload
  const handleFileUploaded = async (file, result) => {
    console.log('File uploaded:', file.name);
    console.log('Upload result:', result);
    
    // Run initial analysis
    try {
      const analysis = await getBasicAnalysis();
      setAnalysisResult(analysis);
    } catch (error) {
      console.error('Analysis error:', error);
    }
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };
  
  // Checking if setup is complete
  if (!setupComplete) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: 'calc(100vh - 64px)',
          p: 3
        }}
      >
        <ParticlesBackground count={15} opacity={0.3} />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 'bold' }}>
            Initializing Data Analyst AI
          </Typography>
          
          <Box sx={{ width: 400, maxWidth: '100%', mb: 4, mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={setupProgress} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
              Connecting to API and setting up environment...
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Connected as: <strong>{user?.apiKey ? '********' + user.apiKey.slice(-5) : 'Anonymous'}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Model: <strong>{user?.model || 'Default'}</strong>
            </Typography>
          </Box>
        </motion.div>
      </Box>
    );
  }
  
  return (
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Typography variant="h4" gutterBottom fontWeight="bold">
              Data Analysis Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Upload your data file, explore visualizations, and get AI-powered insights
            </Typography>
          </motion.div>
          
          {/* Main dashboard grid */}
          <Grid container spacing={3}>
            {/* API Status widget */}
            <Grid item xs={12} md={4}>
              <motion.div variants={itemVariants}>
                <ApiStatusWidget />
              </motion.div>
            </Grid>
            
            {/* Connection info */}
            <Grid item xs={12} md={8}>
              <motion.div variants={itemVariants}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <CheckIcon color="success" sx={{ mr: 1 }} />
                      <Typography variant="h6">
                        Connected to Data Analyst AI
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Session ID:</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                          {user?.sessionId || 'Unknown'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Model:</strong>
                        </Typography>
                        <Typography variant="body2">
                          {user?.model || 'Default'}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Agent Type:</strong>
                        </Typography>
                        <Typography variant="body2">
                          {user?.agentType || 'Default'}
                        </Typography>
                      </Grid>
                    </Grid>
                    
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Your API key is securely transmitted to our backend and not stored in your browser.
                    </Alert>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
            
            {/* Tabs navigation */}
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                <Tabs 
                  value={activeTab} 
                  onChange={handleTabChange}
                  variant="fullWidth"
                  sx={{ 
                    mb: 3,
                    '& .MuiTab-root': { py: 1.5 }
                  }}
                >
                  <Tab 
                    value="upload" 
                    label="Upload Data" 
                    icon={<CloudUploadIcon />} 
                    iconPosition="start" 
                  />
                  <Tab 
                    value="data" 
                    label="Explore Data" 
                    icon={<StorageIcon />} 
                    iconPosition="start"
                    disabled={!dataLoaded}
                  />
                  <Tab 
                    value="analyze" 
                    label="Analysis" 
                    icon={<AnalyticsIcon />} 
                    iconPosition="start"
                    disabled={!dataLoaded}
                  />
                  <Tab 
                    value="chat" 
                    label="AI Assistant" 
                    icon={<AutoGraphIcon />} 
                    iconPosition="start"
                    disabled={!dataLoaded}
                  />
                </Tabs>
              </motion.div>
            </Grid>
            
            {/* Tab content */}
            <Grid item xs={12}>
              <motion.div variants={itemVariants}>
                {/* Upload Tab */}
                {activeTab === 'upload' && (
                  <Card>
                    <CardContent>
                      <Box sx={{ p: { xs: 1, md: 3 } }}>
                        <Typography variant="h5" gutterBottom align="center">
                          Upload Your Data
                        </Typography>
                        <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
                          Upload a CSV, Excel, or other data file to begin analysis
                        </Typography>
                        
                        <EnhancedFileUploader 
                          onFileUploaded={handleFileUploaded}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                )}
                
                {/* Data Tab */}
                {activeTab === 'data' && dataLoaded && (
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Data Explorer
                      </Typography>
                      
                      {/* Data stats */}
                      <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} md={3}>
                          <StatisticWidget
                            title="Rows"
                            value={dataShape?.rows || 0}
                            icon={DataThresholdingIcon}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <StatisticWidget
                            title="Columns"
                            value={dataShape?.columns || 0}
                            icon={DataThresholdingIcon}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <StatisticWidget
                            title="Data Types"
                            value={
                              dataColumns ? 
                              new Set(dataColumns.map(c => c.dtype)).size : 0
                            }
                            icon={DataThresholdingIcon}
                          />
                        </Grid>
                        <Grid item xs={12} md={3}>
                          <StatisticWidget
                            title="Missing Values"
                            value={
                              dataColumns ? 
                              dataColumns.reduce((sum, col) => sum + col.missing, 0) : 0
                            }
                            icon={DataThresholdingIcon}
                          />
                        </Grid>
                      </Grid>
                      
                      {/* Data preview */}
                      <DataPreview 
                        data={dataPreview || []} 
                        columns={dataColumns || []}
                        dataStats={dataStats || {}}
                      />
                    </CardContent>
                  </Card>
                )}
                
                {/* Analysis Tab */}
                {activeTab === 'analyze' && dataLoaded && (
                  <Card>
                    <CardContent>
                      <Typography variant="h5" gutterBottom>
                        Data Analysis
                      </Typography>
                      
                      <VisualizationPanel 
                        data={dataPreview} 
                        columns={dataColumns} 
                      />
                    </CardContent>
                  </Card>
                )}
                
                {/* Chat Tab */}
                {activeTab === 'chat' && (
                  <EnhancedChatInterface />
                )}
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default EnhancedDashboard;