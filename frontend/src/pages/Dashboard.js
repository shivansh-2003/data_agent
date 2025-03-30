import React, { useState } from 'react';
import { Box, Container, Typography, Grid, Paper, Button, Card, CardContent, Divider, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsightsIcon from '@mui/icons-material/Insights';
import DataPreview from '../components/data/DataPreview';
import VisualizationPanel from '../components/dashboard/VisualizationPanel';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [dataStats, setDataStats] = useState(null);
  
  // Mock function to simulate file processing
  const processFile = (file) => {
    setIsLoading(true);
    setFileDetails({
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    });
    
    // Simulate API call with timeout
    setTimeout(() => {
      // Mock data generation based on file type
      if (file.name.endsWith('.csv') || file.name.endsWith('.xlsx')) {
        // Generate mock data
        const mockData = [];
        const columns = ['id', 'name', 'value', 'category', 'date'];
        for (let i = 0; i < 100; i++) {
          const row = {};
          columns.forEach(col => {
            if (col === 'id') row[col] = i + 1;
            else if (col === 'name') row[col] = `Item ${i + 1}`;
            else if (col === 'value') row[col] = Math.floor(Math.random() * 1000);
            else if (col === 'category') row[col] = ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)];
            else if (col === 'date') {
              const date = new Date();
              date.setDate(date.getDate() - Math.floor(Math.random() * 365));
              row[col] = date.toISOString().split('T')[0];
            }
          });
          mockData.push(row);
        }
        
        // Mock statistics
        const mockStats = {
          memoryUsage: '1.2 MB',
          numericStats: {
            'value': {
              min: Math.min(...mockData.map(d => d.value)),
              max: Math.max(...mockData.map(d => d.value)),
              mean: (mockData.reduce((sum, d) => sum + d.value, 0) / mockData.length).toFixed(2),
              median: '500',
              std: '250.5'
            }
          }
        };
        
        setData(mockData);
        setDataStats(mockStats);
        setActiveTab('preview');
      } else {
        // For other file types
        alert('File type not supported for preview. Please upload a CSV or Excel file.');
      }
      setIsLoading(false);
    }, 2000);
  };
  
  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    }
  });
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1
      } 
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };
  
  return (
    <Box sx={{ flexGrow: 1, py: 4 }}>
      <Container maxWidth="xl">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Typography variant="h4" gutterBottom fontWeight="600">
              Data Analytics Dashboard
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" paragraph>
              Upload your data file, explore visualizations, and get AI-powered insights
            </Typography>
          </motion.div>
          
          <Grid container spacing={3}>
            {/* Left sidebar with options */}
            <Grid item xs={12} md={3}>
              <motion.div variants={itemVariants}>
                <Paper sx={{ p: 2, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Dashboard Tools
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Button
                      variant={activeTab === 'upload' ? 'contained' : 'outlined'}
                      startIcon={<UploadFileIcon />}
                      onClick={() => setActiveTab('upload')}
                      fullWidth
                      sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                      Upload Data
                    </Button>
                    <Button
                      variant={activeTab === 'preview' ? 'contained' : 'outlined'}
                      startIcon={<TableChartIcon />}
                      onClick={() => setActiveTab('preview')}
                      disabled={!data}
                      fullWidth
                      sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                      Data Preview
                    </Button>
                    <Button
                      variant={activeTab === 'visualize' ? 'contained' : 'outlined'}
                      startIcon={<BarChartIcon />}
                      onClick={() => setActiveTab('visualize')}
                      disabled={!data}
                      fullWidth
                      sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                      Visualizations
                    </Button>
                    <Button
                      variant={activeTab === 'insights' ? 'contained' : 'outlined'}
                      startIcon={<InsightsIcon />}
                      onClick={() => setActiveTab('insights')}
                      disabled={!data}
                      fullWidth
                      sx={{ justifyContent: 'flex-start', py: 1.5 }}
                    >
                      AI Insights
                    </Button>
                  </Box>
                  
                  {data && (
                    <Box sx={{ mt: 4 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Current File
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {fileDetails?.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {data.length} rows • {Object.keys(data[0]).length} columns
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>
            
            {/* Main content area */}
            <Grid item xs={12} md={9}>
              <motion.div variants={itemVariants}>
                <Paper sx={{ p: 3, minHeight: 600 }}>
                  {/* Upload Tab */}
                  {activeTab === 'upload' && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" gutterBottom>
                        Upload Your Data File
                      </Typography>
                      <Typography variant="body1" color="text.secondary" paragraph>
                        Drag and drop your file here, or click to select a file
                      </Typography>
                      
                      <Box 
                        {...getRootProps()} 
                        sx={{
                          border: '2px dashed',
                          borderColor: isDragActive ? 'primary.main' : 'divider',
                          borderRadius: 2,
                          p: 5,
                          mb: 3,
                          cursor: 'pointer',
                          backgroundColor: isDragActive ? 'rgba(99, 102, 241, 0.04)' : 'transparent',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            backgroundColor: 'rgba(99, 102, 241, 0.04)'
                          }
                        }}
                      >
                        <input {...getInputProps()} />
                        {isLoading ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <CircularProgress size={60} sx={{ mb: 2 }} />
                            <Typography>Processing your file...</Typography>
                          </Box>
                        ) : (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <UploadFileIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                            <Typography>
                              {isDragActive ? 'Drop the file here' : 'Drag & drop a file, or click to select'}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      <Typography variant="subtitle2" gutterBottom>
                        Supported Formats
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, flexWrap: 'wrap' }}>
                        <Button size="small" variant="outlined" disabled>.csv</Button>
                        <Button size="small" variant="outlined" disabled>.xlsx</Button>
                        <Button size="small" variant="outlined" disabled>.xls</Button>
                        <Button size="small" variant="outlined" disabled>.pdf</Button>
                        <Button size="small" variant="outlined" disabled>.jpg/.png</Button>
                      </Box>
                    </Box>
                  )}
                  
                  {/* Preview Tab */}
                  {activeTab === 'preview' && data && (
                    <DataPreview 
                      data={data} 
                      fileDetails={fileDetails}
                      dataStats={dataStats}
                    />
                  )}
                  
                  {/* Visualizations Tab */}
                  {activeTab === 'visualize' && data && (
                    <VisualizationPanel data={data} />
                  )}
                  
                  {/* Insights Tab */}
                  {activeTab === 'insights' && data && (
                    <Box>
                      <Typography variant="h5" gutterBottom>
                        AI-Powered Insights
                      </Typography>
                      <Typography variant="body1" paragraph>
                        Our AI has analyzed your data and generated the following insights:
                      </Typography>
                      
                      <Grid container spacing={3}>
                        <Grid item xs={12}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Data Summary
                              </Typography>
                              <Typography variant="body2">
                                This dataset contains {data.length} records with {Object.keys(data[0]).length} attributes.
                                The data appears to be {Math.random() > 0.5 ? 'time-series' : 'categorical'} in nature.
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Key Findings
                              </Typography>
                              <Typography variant="body2" paragraph>
                                • The average value across all records is {dataStats?.numericStats?.value?.mean || '500'}.
                              </Typography>
                              <Typography variant="body2" paragraph>
                                • Category 'A' has the highest frequency in the dataset.
                              </Typography>
                              <Typography variant="body2" paragraph>
                                • There appears to be a positive correlation between value and date.
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                Recommendations
                              </Typography>
                              <Typography variant="body2" paragraph>
                                • Consider exploring the relationship between value and category using a box plot.
                              </Typography>
                              <Typography variant="body2" paragraph>
                                • A time series analysis of value over date would reveal temporal patterns.
                              </Typography>
                              <Typography variant="body2" paragraph>
                                • Investigate outliers in the value column (values above {dataStats?.numericStats?.value?.max * 0.9 || '900'}).
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </motion.div>
      </Container>
    </Box>
  );
};

export default Dashboard;