import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, FormControl, InputLabel, MenuItem, Select, Button, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import BarChartIcon from '@mui/icons-material/BarChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PieChartIcon from '@mui/icons-material/PieChart';
import ScatterPlotIcon from '@mui/icons-material/ScatterPlot';

const VisualizationPanel = ({ data }) => {
  const [chartType, setChartType] = useState('bar');
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [groupBy, setGroupBy] = useState('');
  
  // Get all columns from data
  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
  
  // Identify numeric columns
  const numericColumns = columns.filter(col => {
    return data.some(row => row[col] !== null && !isNaN(Number(row[col])));
  });
  
  // Identify categorical columns
  const categoricalColumns = columns.filter(col => {
    return !numericColumns.includes(col) || 
           (data.some(row => row[col] !== null && typeof row[col] === 'string'));
  });
  
  // Set default axes if not set and columns are available
  React.useEffect(() => {
    if (columns.length > 0 && !xAxis) {
      setXAxis(categoricalColumns[0] || columns[0]);
    }
    if (numericColumns.length > 0 && !yAxis) {
      setYAxis(numericColumns[0]);
    }
  }, [columns, numericColumns, categoricalColumns, xAxis, yAxis]);
  
  // Prepare data for visualization
  const prepareChartData = () => {
    if (!data || !xAxis || !yAxis) return [];
    
    if (groupBy) {
      // Group data by the groupBy column
      const groupedData = {};
      data.forEach(row => {
        const xValue = row[xAxis];
        const yValue = Number(row[yAxis]);
        const groupValue = row[groupBy];
        
        if (!groupedData[xValue]) {
          groupedData[xValue] = {};
        }
        
        if (!groupedData[xValue][groupValue]) {
          groupedData[xValue][groupValue] = 0;
        }
        
        groupedData[xValue][groupValue] += yValue;
      });
      
      // Convert grouped data to chart format
      return Object.keys(groupedData).map(x => {
        const entry = { [xAxis]: x };
        Object.keys(groupedData[x]).forEach(group => {
          entry[group] = groupedData[x][group];
        });
        return entry;
      });
    } else {
      // Simple aggregation by xAxis
      const aggregatedData = {};
      data.forEach(row => {
        const xValue = row[xAxis];
        const yValue = Number(row[yAxis]);
        
        if (!aggregatedData[xValue]) {
          aggregatedData[xValue] = 0;
        }
        
        aggregatedData[xValue] += yValue;
      });
      
      // Convert aggregated data to chart format
      return Object.keys(aggregatedData).map(x => ({
        [xAxis]: x,
        [yAxis]: aggregatedData[x]
      }));
    }
  };
  
  const chartData = prepareChartData();
  
  // Generate random colors for chart elements
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];
  
  // Render the appropriate chart based on chartType
  const renderChart = () => {
    if (!chartData || chartData.length === 0) {
      return (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Please select valid axes to generate a visualization
          </Typography>
        </Box>
      );
    }
    
    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              {groupBy ? (
                // Render grouped bars
                Array.from(new Set(data.map(item => item[groupBy]))).map((group, index) => (
                  <Bar key={group} dataKey={group} fill={COLORS[index % COLORS.length]} />
                ))
              ) : (
                // Render single bar series
                <Bar dataKey={yAxis} fill="#6366f1" />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
        
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xAxis} angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip />
              <Legend />
              {groupBy ? (
                // Render grouped lines
                Array.from(new Set(data.map(item => item[groupBy]))).map((group, index) => (
                  <Line 
                    key={group} 
                    type="monotone" 
                    dataKey={group} 
                    stroke={COLORS[index % COLORS.length]} 
                    activeDot={{ r: 8 }} 
                  />
                ))
              ) : (
                // Render single line series
                <Line type="monotone" dataKey={yAxis} stroke="#6366f1" activeDot={{ r: 8 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
        
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={true}
                outerRadius={150}
                fill="#8884d8"
                dataKey={yAxis}
                nameKey={xAxis}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case 'scatter':
        // For scatter plot, we need two numeric axes
        if (!numericColumns.includes(xAxis) || !numericColumns.includes(yAxis)) {
          return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Scatter plots require numeric columns for both X and Y axes
              </Typography>
            </Box>
          );
        }
        
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey={xAxis} 
                name={xAxis} 
                label={{ value: xAxis, position: 'bottom', offset: 10 }} 
              />
              <YAxis 
                type="number" 
                dataKey={yAxis} 
                name={yAxis} 
                label={{ value: yAxis, angle: -90, position: 'left', offset: 10 }} 
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              {groupBy ? (
                // Render grouped scatter points
                Array.from(new Set(data.map(item => item[groupBy]))).map((group, index) => {
                  const filteredData = data.filter(item => item[groupBy] === group);
                  return (
                    <Scatter 
                      key={group} 
                      name={group} 
                      data={filteredData} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  );
                })
              ) : (
                // Render single scatter series
                <Scatter name={`${xAxis} vs ${yAxis}`} data={data} fill="#6366f1" />
              )}
            </ScatterChart>
          </ResponsiveContainer>
        );
        
      default:
        return null;
    }
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };
  
  const controlVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };
  
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Typography variant="h5" gutterBottom>
        Data Visualizations
      </Typography>
      <Typography variant="body1" paragraph>
        Create interactive visualizations from your data
      </Typography>
      
      <Grid container spacing={3}>
        {/* Chart controls */}
        <Grid item xs={12} md={4}>
          <motion.div variants={controlVariants}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Chart Settings
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Chart Type
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button 
                      variant={chartType === 'bar' ? 'contained' : 'outlined'}
                      onClick={() => setChartType('bar')}
                      startIcon={<BarChartIcon />}
                      size="small"
                    >
                      Bar
                    </Button>
                    <Button 
                      variant={chartType === 'line' ? 'contained' : 'outlined'}
                      onClick={() => setChartType('line')}
                      startIcon={<ShowChartIcon />}
                      size="small"
                    >
                      Line
                    </Button>
                    <Button 
                      variant={chartType === 'pie' ? 'contained' : 'outlined'}
                      onClick={() => setChartType('pie')}
                      startIcon={<PieChartIcon />}
                      size="small"
                    >
                      Pie
                    </Button>
                    <Button 
                      variant={chartType === 'scatter' ? 'contained' : 'outlined'}
                      onClick={() => setChartType('scatter')}
                      startIcon={<ScatterPlotIcon />}
                      size="small"
                    >
                      Scatter
                    </Button>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>X-Axis</InputLabel>
                    <Select
                      value={xAxis}
                      label="X-Axis"
                      onChange={(e) => setXAxis(e.target.value)}
                    >
                      {columns.map(col => (
                        <MenuItem key={col} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                    <InputLabel>Y-Axis</InputLabel>
                    <Select
                      value={yAxis}
                      label="Y-Axis"
                      onChange={(e) => setYAxis(e.target.value)}
                    >
                      {numericColumns.map(col => (
                        <MenuItem key={col} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl fullWidth size="small">
                    <InputLabel>Group By (Optional)</InputLabel>
                    <Select
                      value={groupBy}
                      label="Group By (Optional)"
                      onChange={(e) => setGroupBy(e.target.value)}
                    >
                      <MenuItem value=""><em>None</em></MenuItem>
                      {categoricalColumns.map(col => (
                        <MenuItem key={col} value={col}>{col}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                
                <Typography variant="caption" color="text.secondary">
                  Select the appropriate axes and grouping to visualize your data effectively.
                </Typography>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        {/* Chart display */}
        <Grid item xs={12} md={8}>
          <motion.div variants={controlVariants}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ height: 450, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {renderChart()}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default VisualizationPanel;