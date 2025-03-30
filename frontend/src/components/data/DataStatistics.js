import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Alert,
  Collapse,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Refresh as RefreshIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  ShowChart as ShowChartIcon
} from '@mui/icons-material';
import { useData } from '../../context/DataContext';
import { motion } from 'framer-motion';

/**
 * DataStatistics component
 * Displays statistical information about the loaded data
 */
const DataStatistics = () => {
  const { 
    dataColumns, 
    dataShape, 
    dataStats, 
    dataLoaded, 
    isLoading,
    getBasicAnalysis,
    getCorrelationAnalysis,
    error
  } = useData();
  
  const [analysisResult, setAnalysisResult] = useState(null);
  const [correlationResult, setCorrelationResult] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    numerical: false,
    categorical: false,
    correlation: false
  });
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
  
  // Run initial analysis when component mounts if data is loaded
  useEffect(() => {
    if (dataLoaded && !analysisResult && !isAnalysisLoading) {
      fetchAnalysis();
    }
  }, [dataLoaded]);
  
  // Get numerical and categorical columns
  const numericalColumns = dataColumns 
    ? dataColumns.filter(col => 
        col.dtype === 'int64' || 
        col.dtype === 'float64' || 
        col.dtype.includes('float') || 
        col.dtype.includes('int')
      )
    : [];
  
  const categoricalColumns = dataColumns
    ? dataColumns.filter(col => 
        col.dtype === 'object' || 
        col.dtype === 'category' || 
        col.dtype.includes('str')
      )
    : [];
  
  // Fetch basic analysis
  const fetchAnalysis = async () => {
    if (!dataLoaded) return;
    
    setIsAnalysisLoading(true);
    
    try {
      const analysis = await getBasicAnalysis();
      setAnalysisResult(analysis);
      
      // Also fetch correlation if numerical columns exist
      if (numericalColumns.length >= 2) {
        fetchCorrelation();
      }
    } catch (error) {
      console.error('Analysis error:', error);
    } finally {
      setIsAnalysisLoading(false);
    }
  };
  
  // Fetch correlation analysis
  const fetchCorrelation = async () => {
    if (!dataLoaded || numericalColumns.length < 2) return;
    
    try {
      const columns = numericalColumns.map(col => col.name);
      const correlation = await getCorrelationAnalysis(columns);
      setCorrelationResult(correlation);
    } catch (error) {
      console.error('Correlation error:', error);
    }
  };
  
  // Toggle sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // Format value based on type
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return Number.isInteger(value) ? value : value.toFixed(2);
    }
    return value.toString();
  };
  
  // Generate color based on correlation value
  const getCorrelationColor = (value) => {
    if (value === null || value === undefined) return '#f5f5f5';
    
    const absValue = Math.abs(value);
    if (absValue > 0.7) {
      return value > 0 ? 'rgba(46, 125, 50, 0.7)' : 'rgba(198, 40, 40, 0.7)';
    } else if (absValue > 0.4) {
      return value > 0 ? 'rgba(46, 125, 50, 0.4)' : 'rgba(198, 40, 40, 0.4)';
    } else if (absValue > 0.2) {
      return value > 0 ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)';
    }
    return '#f5f5f5';
  };
  
  // Get text color based on background
  const getTextColor = (bgColor) => {
    if (!bgColor || bgColor === '#f5f5f5') return 'inherit';
    return bgColor.includes('0.7') ? 'white' : 'inherit';
  };
  
  if (!dataLoaded) {
    return (
      <Alert severity="info">
        Please load data to see statistics.
      </Alert>
    );
  }
  
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Data Statistics</Typography>
          <Button
            startIcon={<RefreshIcon />}
            size="small"
            onClick={fetchAnalysis}
            disabled={isAnalysisLoading || isLoading}
          >
            Refresh
          </Button>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {/* Overview Section */}
        <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              py: 1,
              px: 2,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'primary.light',
              color: 'primary.contrastText',
              cursor: 'pointer'
            }}
            onClick={() => toggleSection('overview')}
          >
            <Typography variant="subtitle1" fontWeight="medium">
              Dataset Overview
            </Typography>
            <IconButton size="small" sx={{ color: 'inherit' }}>
              {expandedSections.overview ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          
          <Collapse in={expandedSections.overview}>
            <Box sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{ p: 2, height: '100%', bgcolor: 'background.paper' }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Rows
                      </Typography>
                      <Typography variant="h5">
                        {formatValue(dataShape?.rows)}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{ p: 2, height: '100%', bgcolor: 'background.paper' }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Columns
                      </Typography>
                      <Typography variant="h5">
                        {formatValue(dataShape?.columns)}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{ p: 2, height: '100%', bgcolor: 'background.paper' }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Numerical Columns
                      </Typography>
                      <Typography variant="h5">
                        {formatValue(numericalColumns.length)}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Paper
                      elevation={0}
                      variant="outlined"
                      sx={{ p: 2, height: '100%', bgcolor: 'background.paper' }}
                    >
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Categorical Columns
                      </Typography>
                      <Typography variant="h5">
                        {formatValue(categoricalColumns.length)}
                      </Typography>
                    </Paper>
                  </motion.div>
                </Grid>
              </Grid>
              
              {/* Column Types */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Column Types:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {dataColumns && dataColumns.map((col) => (
                    <Chip
                      key={col.name}
                      label={`${col.name} (${col.dtype})`}
                      size="small"
                      variant="outlined"
                      icon={
                        col.dtype.includes('int') || col.dtype.includes('float') ? <ShowChartIcon fontSize="small" /> :
                        col.dtype.includes('date') || col.dtype.includes('time') ? <TimelineIcon fontSize="small" /> :
                        <BarChartIcon fontSize="small" />
                      }
                    />
                  ))}
                </Box>
              </Box>
              
              {/* Missing Values Summary */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Missing Values:
                </Typography>
                {dataColumns && dataColumns
                  .filter(col => col.missing > 0)
                  .map((col) => (
                    <Box key={col.name} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          {col.name}
                        </Typography>
                        <Typography variant="body2">
                          {col.missing} ({col.missing_pct.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={col.missing_pct} 
                        sx={{ height: 6, borderRadius: 1 }}
                      />
                    </Box>
                  ))}
                
                {dataColumns && !dataColumns.some(col => col.missing > 0) && (
                  <Typography variant="body2" color="text.secondary">
                    No missing values detected.
                  </Typography>
                )}
        
        {/* Correlation Matrix */}
        {numericalColumns.length >= 2 && (
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Box
              sx={{
                py: 1,
                px: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                cursor: 'pointer'
              }}
              onClick={() => toggleSection('correlation')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Correlation Matrix
              </Typography>
              <IconButton size="small" sx={{ color: 'inherit' }}>
                {expandedSections.correlation ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections.correlation}>
              <Box sx={{ p: 2 }}>
                {correlationResult ? (
                  <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell></TableCell>
                          {numericalColumns.map((col) => (
                            <TableCell key={col.name} align="center">
                              {col.name}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {numericalColumns.map((rowCol) => (
                          <TableRow key={rowCol.name}>
                            <TableCell component="th" scope="row">
                              <strong>{rowCol.name}</strong>
                            </TableCell>
                            {numericalColumns.map((colCol) => {
                              const value = correlationResult?.[rowCol.name]?.[colCol.name];
                              const bgColor = getCorrelationColor(value);
                              const textColor = getTextColor(bgColor);
                              
                              return (
                                <TableCell 
                                  key={colCol.name} 
                                  align="center"
                                  sx={{ 
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    fontWeight: Math.abs(value) > 0.7 ? 'bold' : 'normal'
                                  }}
                                >
                                  {formatValue(value)}
                                </TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={fetchCorrelation}
                      startIcon={<RefreshIcon />}
                    >
                      Calculate Correlation
                    </Button>
                  </Box>
                )}
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>Guide:</strong> 
                    Values close to 1 indicate strong positive correlation (green), 
                    values close to -1 indicate strong negative correlation (red), 
                    and values close to 0 indicate little or no correlation.
                  </Typography>
                </Box>
              </Box>
            </Collapse>
          </Paper>
        )}
        
        {/* Error display */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DataStatistics;      </Box>
            </Box>
          </Collapse>
        </Paper>
        
        {/* Numerical Columns */}
        {numericalColumns.length > 0 && (
          <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                py: 1,
                px: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                cursor: 'pointer'
              }}
              onClick={() => toggleSection('numerical')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Numerical Statistics
              </Typography>
              <IconButton size="small" sx={{ color: 'inherit' }}>
                {expandedSections.numerical ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections.numerical}>
              <Box sx={{ p: 2 }}>
                {isAnalysisLoading ? (
                  <Box sx={{ py: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                      Calculating statistics...
                    </Typography>
                  </Box>
                ) : analysisResult ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Column</TableCell>
                          <TableCell align="right">Min</TableCell>
                          <TableCell align="right">Max</TableCell>
                          <TableCell align="right">Mean</TableCell>
                          <TableCell align="right">Median</TableCell>
                          <TableCell align="right">Std Dev</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {numericalColumns.map((col) => (
                          <TableRow key={col.name}>
                            <TableCell component="th" scope="row">
                              {col.name}
                            </TableCell>
                            <TableCell align="right">
                              {formatValue(analysisResult[col.name]?.min)}
                            </TableCell>
                            <TableCell align="right">
                              {formatValue(analysisResult[col.name]?.max)}
                            </TableCell>
                            <TableCell align="right">
                              {formatValue(analysisResult[col.name]?.mean)}
                            </TableCell>
                            <TableCell align="right">
                              {formatValue(analysisResult[col.name]?.median)}
                            </TableCell>
                            <TableCell align="right">
                              {formatValue(analysisResult[col.name]?.std)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={fetchAnalysis}
                      startIcon={<RefreshIcon />}
                    >
                      Load Statistics
                    </Button>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        )}
        
        {/* Categorical Columns */}
        {categoricalColumns.length > 0 && (
          <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                py: 1,
                px: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                cursor: 'pointer'
              }}
              onClick={() => toggleSection('categorical')}
            >
              <Typography variant="subtitle1" fontWeight="medium">
                Categorical Statistics
              </Typography>
              <IconButton size="small" sx={{ color: 'inherit' }}>
                {expandedSections.categorical ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
            
            <Collapse in={expandedSections.categorical}>
              <Box sx={{ p: 2 }}>
                {isAnalysisLoading ? (
                  <Box sx={{ py: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                      Calculating statistics...
                    </Typography>
                  </Box>
                ) : analysisResult ? (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Column</TableCell>
                          <TableCell align="right">Unique Values</TableCell>
                          <TableCell align="right">Most Common</TableCell>
                          <TableCell align="right">Frequency</TableCell>
                          <TableCell align="right">Missing</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categoricalColumns.map((col) => (
                          <TableRow key={col.name}>
                            <TableCell component="th" scope="row">
                              {col.name}
                            </TableCell>
                            <TableCell align="right">
                              {formatValue(col.unique)}
                            </TableCell>
                            <TableCell align="right">
                              {formatValue(analysisResult[col.name]?.top)}
                            </TableCell>
                            <TableCell align="right">
                              {formatValue(analysisResult[col.name]?.freq)}
                            </TableCell>
                            <TableCell align="right">
                              {formatValue(col.missing)} ({formatValue(col.missing_pct)}%)
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box sx={{ py: 2, textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      onClick={fetchAnalysis}
                      startIcon={<RefreshIcon />}
                    >
                      Load Statistics
                    </Button>
                  </Box>
                )}
              </Box>
            </Collapse>
          </Paper>
        )}
      </CardContent>
    </Card>
  );
};

export default DataStatistics;