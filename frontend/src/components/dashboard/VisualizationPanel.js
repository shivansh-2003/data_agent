import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Grid, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
import BarChart from '../charts/BarChart';
import LineChart from '../charts/LineChart';
import PieChart from '../charts/PieChart';
import ScatterPlot from '../charts/ScatterPlot';
import DashboardCard from './DashboardCard';

/**
 * VisualizationPanel component displays various charts and data visualizations
 * in a tabbed interface with options to customize the visualization.
 */
const VisualizationPanel = ({ data = {}, title = 'Data Visualization' }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState('month');

  // Sample data if none provided
  const sampleData = {
    barChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
        },
        {
          label: 'Expenses',
          data: [8, 12, 6, 4, 7, 2],
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    },
    lineChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Users',
          data: [65, 59, 80, 81, 56, 55],
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    },
    pieChart: {
      labels: ['Desktop', 'Mobile', 'Tablet'],
      datasets: [
        {
          data: [300, 50, 100],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 206, 86, 0.5)',
          ],
        },
      ],
    },
    scatterChart: {
      datasets: [
        {
          label: 'A dataset',
          data: [
            { x: -10, y: 0 },
            { x: 0, y: 10 },
            { x: 10, y: 5 },
            { x: 0.5, y: 5.5 },
          ],
          backgroundColor: 'rgba(255, 99, 132, 1)',
        },
      ],
    },
  };

  const chartData = data.charts || sampleData;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const renderChart = () => {
    switch (activeTab) {
      case 0:
        return <BarChart data={chartData.barChart} height={300} />
      case 1:
        return <LineChart data={chartData.lineChart} height={300} />
      case 2:
        return <PieChart data={chartData.pieChart} height={300} />
      case 3:
        return <ScatterPlot data={chartData.scatterChart} height={300} />
      default:
        return <Typography>No chart selected</Typography>
    }
  };

  return (
    <DashboardCard 
      title={title}
      subtitle="Interactive data visualization"
      elevation={2}
    >
      <Box sx={{ width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            aria-label="visualization tabs"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Bar Chart" />
            <Tab label="Line Chart" />
            <Tab label="Pie Chart" />
            <Tab label="Scatter Plot" />
          </Tabs>
          
          <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
            <InputLabel id="time-range-select-label">Time Range</InputLabel>
            <Select
              labelId="time-range-select-label"
              id="time-range-select"
              value={timeRange}
              label="Time Range"
              onChange={handleTimeRangeChange}
            >
              <MenuItem value="day">Day</MenuItem>
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="quarter">Quarter</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ p: 2 }}>
          {renderChart()}
        </Box>
      </Box>
    </DashboardCard>
  );
};

export default VisualizationPanel;