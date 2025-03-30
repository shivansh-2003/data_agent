import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Grid,
  Chip,
  Divider,
  Alert,
  IconButton,
  LinearProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { useData } from '../../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * VisualizationRequest component
 * Provides an interface for requesting visualizations from the AI
 */
const VisualizationRequest = () => {
  const { 
    dataColumns, 
    dataLoaded, 
    isLoading, 
    generateVisualization, 
    activeVisualization,
    error
  } = useData();
  
  const [vizType, setVizType] = useState('bar');
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');
  const [groupBy, setGroupBy] = useState('');
  const [title, setTitle] = useState('');
  const [naturalQuery, setNaturalQuery] = useState('');
  const [requestType, setRequestType] = useState('structured');
  const [showVisualization, setShowVisualization] = useState(false);
  
  // Initialize first columns when data is loaded
  useEffect(() => {
    if (dataColumns && dataColumns.length > 0) {
      // Find a categorical and numeric column if possible
      const categoricalColumn = dataColumns.find(col => 
        col.dtype === 'object' || col.dtype === 'category' || col.dtype.includes('str')
      );
      
      const numericColumn = dataColumns.find(col => 
        col.dtype === 'int64' || col.dtype === 'float64' || col.dtype.includes('float') || col.dtype.includes('int')
      );
      
      if (categoricalColumn) {
        setXColumn(categoricalColumn.name);
      } else if (dataColumns[0]) {
        setXColumn(dataColumns[0].name);
      }
      
      if (numericColumn) {
        setYColumn(numericColumn.name);
      } else if (dataColumns[1]) {
        setYColumn(dataColumns[1].name);
      } else if (dataColumns[0]) {
        setYColumn(dataColumns[0].name);
      }
    }
  }, [dataColumns]);
  
  // Clear visualization when changing request type
  useEffect(() => {
    setShowVisualization(false);
  }, [requestType]);
  
  const handleSubmitStructured = (e) => {
    e.preventDefault();
    
    const options = {
      xColumn,
      yColumn,
      groupBy: groupBy || undefined,
      title: title || `${vizType.charAt(0).toUpperCase() + vizType.slice(1)} Chart of ${yColumn} by ${xColumn}`
    };
    
    generateVisualization(vizType, options)
      .then(() => {
        setShowVisualization(true);
      })
      .catch(error => {
        console.error('Visualization error:', error);
      });
  };
  
  const handleSubmitNatural = (e) => {
    e.preventDefault();
    
    if (!naturalQuery.trim()) return;
    
    // For natural language, we call the Chat endpoint with a visualization request
    generateVisualization('natural', { query: naturalQuery })
      .then(() => {
        setShowVisualization(true);
      })
      .catch(error => {
        console.error('Visualization error:', error);
      });
  };
  
  const handleClearVisualization = () => {
    setShowVisualization(false);
  };
  
  // Column options from data
  const columnOptions = dataColumns 
    ? dataColumns.map(col => ({
        value: col.name,
        label: col.name,
        type: col.dtype
      }))
    : [];
  
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Generate Visualization
        </Typography>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Request type toggle */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
          <Button 
            variant={requestType === 'structured' ? 'contained' : 'outlined'}
            onClick={() => setRequestType('structured')}
            sx={{ mr: 1 }}
          >
            Structured
          </Button>
          <Button 
            variant={requestType === 'natural' ? 'contained' : 'outlined'}
            onClick={() => setRequestType('natural')}
          >
            Natural Language
          </Button>
        </Box>
        
        {!dataLoaded && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Please load data first to generate visualizations.
          </Alert>
        )}
        
        <AnimatePresence mode="wait">
          {/* Structured request form */}
          {requestType === 'structured' && (
            <motion.div
              key="structured"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmitStructured}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="viz-type-label">Chart Type</InputLabel>
                      <Select
                        labelId="viz-type-label"
                        value={vizType}
                        label="Chart Type"
                        onChange={(e) => setVizType(e.target.value)}
                        disabled={!dataLoaded || isLoading}
                      >
                        <MenuItem value="bar">Bar Chart</MenuItem>
                        <MenuItem value="line">Line Chart</MenuItem>
                        <MenuItem value="pie">Pie Chart</MenuItem>
                        <MenuItem value="scatter">Scatter Plot</MenuItem>
                        <MenuItem value="histogram">Histogram</MenuItem>
                        <MenuItem value="box">Box Plot</MenuItem>
                        <MenuItem value="heatmap">Heatmap</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="x-column-label">X-Axis / Category</InputLabel>
                      <Select
                        labelId="x-column-label"
                        value={xColumn}
                        label="X-Axis / Category"
                        onChange={(e) => setXColumn(e.target.value)}
                        disabled={!dataLoaded || isLoading}
                      >
                        {columnOptions.map(col => (
                          <MenuItem key={col.value} value={col.value}>
                            {col.label} ({col.type})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="y-column-label">Y-Axis / Value</InputLabel>
                      <Select
                        labelId="y-column-label"
                        value={yColumn}
                        label="Y-Axis / Value"
                        onChange={(e) => setYColumn(e.target.value)}
                        disabled={!dataLoaded || isLoading || vizType === 'pie' || vizType === 'histogram'}
                      >
                        {columnOptions.map(col => (
                          <MenuItem key={col.value} value={col.value}>
                            {col.label} ({col.type})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="group-by-label">Group By (Optional)</InputLabel>
                      <Select
                        labelId="group-by-label"
                        value={groupBy}
                        label="Group By (Optional)"
                        onChange={(e) => setGroupBy(e.target.value)}
                        disabled={!dataLoaded || isLoading || vizType === 'pie'}
                      >
                        <MenuItem value="">None</MenuItem>
                        {columnOptions.map(col => (
                          <MenuItem key={col.value} value={col.value}>
                            {col.label} ({col.type})
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      margin="normal"
                      label="Chart Title (Optional)"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={!dataLoaded || isLoading}
                      placeholder={`${vizType.charAt(0).toUpperCase() + vizType.slice(1)} Chart of ${yColumn} by ${xColumn}`}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!dataLoaded || isLoading || !xColumn}
                    startIcon={<SendIcon />}
                    size="large"
                  >
                    Generate Visualization
                  </Button>
                </Box>
              </form>
            </motion.div>
          )}
          
          {/* Natural language request form */}
          {requestType === 'natural' && (
            <motion.div
              key="natural"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmitNatural}>
                <Box sx={{ mb: 3 }}>
                  <Alert severity="info">
                    Describe the visualization you want in plain English. The AI will interpret your request.
                  </Alert>
                </Box>
                
                <TextField
                  fullWidth
                  margin="normal"
                  label="Describe your visualization"
                  value={naturalQuery}
                  onChange={(e) => setNaturalQuery(e.target.value)}
                  disabled={!dataLoaded || isLoading}
                  placeholder="E.g., Show me a bar chart of sales by region"
                  multiline
                  rows={3}
                />
                
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Example queries:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label="Show me a bar chart of sales by region" 
                      size="small" 
                      onClick={() => setNaturalQuery("Show me a bar chart of sales by region")}
                      clickable
                    />
                    <Chip 
                      label="Create a pie chart showing distribution by category" 
                      size="small" 
                      onClick={() => setNaturalQuery("Create a pie chart showing distribution by category")}
                      clickable
                    />
                    <Chip 
                      label="Plot the trend of values over time" 
                      size="small" 
                      onClick={() => setNaturalQuery("Plot the trend of values over time")}
                      clickable
                    />
                  </Box>
                </Box>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={!dataLoaded || isLoading || !naturalQuery.trim()}
                    startIcon={<SendIcon />}
                    size="large"
                  >
                    Generate Visualization
                  </Button>
                </Box>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Loading indicator */}
        {isLoading && (
          <Box sx={{ mt: 4 }}>
            <LinearProgress />
            <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
              Generating visualization...
            </Typography>
          </Box>
        )}
        
        {/* Error message */}
        {error && (
          <Alert severity="error" sx={{ mt: 4 }}>
            {error}
          </Alert>
        )}
        
        {/* Visualization display */}
        {showVisualization && activeVisualization && (
          <Box sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Visualization Result
              </Typography>
              <Box>
                <IconButton size="small" onClick={handleClearVisualization}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small"
                  onClick={() => {
                    setShowVisualization(false);
                    setTimeout(() => setShowVisualization(true), 100);
                  }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
            
            <Card variant="outlined">
              <CardContent sx={{ p: 1 }}>
                {typeof activeVisualization === 'string' ? (
                  <div dangerouslySetInnerHTML={{ __html: activeVisualization }} />
                ) : (
                  <Typography>No visualization data available.</Typography>
                )}
              </CardContent>
            </Card>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default VisualizationRequest;