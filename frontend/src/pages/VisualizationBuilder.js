import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import PieChart from '../components/charts/PieChart';
import ScatterPlot from '../components/charts/ScatterPlot';
import { DataService } from '../services/dataService';
import { ChatService } from '../services/chatService';

const VisualizationBuilder = () => {
  const { token } = useAuth();
  const { dataColumns, dataPreview, dataLoaded } = useData();
  const [chatService, setChatService] = useState(null);
  const [dataService, setDataService] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [vizType, setVizType] = useState('bar');
  const [xColumn, setXColumn] = useState('');
  const [yColumn, setYColumn] = useState('');
  const [groupBy, setGroupBy] = useState('');
  const [title, setTitle] = useState('');
  const [chartData, setChartData] = useState(null);
  const [naturalLanguageQuery, setNaturalLanguageQuery] = useState('');

  useEffect(() => {
    if (token) {
      setChatService(new ChatService(token));
      setDataService(new DataService(token));
    }
  }, [token]);

  useEffect(() => {
    if (dataColumns.length > 0 && !xColumn) {
      setXColumn(dataColumns[0]);
    }
    if (dataColumns.length > 1 && !yColumn) {
      setYColumn(dataColumns[1]);
    }
  }, [dataColumns, xColumn, yColumn]);

  const generateVisualization = async () => {
    if (!dataService) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await dataService.generateVisualization(vizType, {
        xColumn,
        yColumn,
        groupBy: groupBy || undefined,
        title: title || `${vizType.charAt(0).toUpperCase() + vizType.slice(1)} Chart of ${yColumn} by ${xColumn}`
      });
      
      setChartData(result);
    } catch (err) {
      setError(err.message || 'Failed to generate visualization');
      console.error('Visualization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNaturalLanguageSubmit = async (e) => {
    e.preventDefault();
    if (!chatService || !naturalLanguageQuery) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await chatService.generateVisualizationFromQuery(naturalLanguageQuery);
      setChartData(result.visualization || result.data);
      
      // If the response includes visualization config, update the form
      if (result.config) {
        const { type, x_column, y_column, group_by, chart_title } = result.config;
        if (type) setVizType(type);
        if (x_column) setXColumn(x_column);
        if (y_column) setYColumn(y_column);
        if (group_by) setGroupBy(group_by);
        if (chart_title) setTitle(chart_title);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate visualization from query');
      console.error('Natural language visualization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = () => {
    if (!chartData) return null;
    
    switch (vizType) {
      case 'bar':
        return <BarChart data={chartData} />;
      case 'line':
        return <LineChart data={chartData} />;
      case 'pie':
        return <PieChart data={chartData} />;
      case 'scatter':
        return <ScatterPlot data={chartData} />;
      default:
        return <div>Unsupported chart type</div>;
    }
  };

  if (!dataLoaded) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Visualization Builder</h1>
        <p className="mb-4">Please load data first to create visualizations</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Visualization Builder</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-semibold mb-4">Natural Language Query</h2>
          <p className="text-sm mb-4">Describe the visualization you want to create in plain English</p>
          
          <form onSubmit={handleNaturalLanguageSubmit} className="mb-4">
            <input
              type="text"
              className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600"
              placeholder="e.g., Show me a bar chart of sales by region"
              value={naturalLanguageQuery}
              onChange={e => setNaturalLanguageQuery(e.target.value)}
            />
            <Button type="submit" variant="primary" disabled={isLoading}>
              Generate
            </Button>
          </form>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4">Chart Configuration</h2>
          
          <div className="grid gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Chart Type</label>
              <select
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                value={vizType}
                onChange={e => setVizType(e.target.value)}
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">X Axis / Category</label>
              <select
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                value={xColumn}
                onChange={e => setXColumn(e.target.value)}
              >
                {dataColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Y Axis / Value</label>
              <select
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                value={yColumn}
                onChange={e => setYColumn(e.target.value)}
              >
                {dataColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Group By (Optional)</label>
              <select
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                value={groupBy}
                onChange={e => setGroupBy(e.target.value)}
              >
                <option value="">None</option>
                {dataColumns.map(col => (
                  <option key={col} value={col}>{col}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Chart Title</label>
              <input
                type="text"
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                placeholder="Enter chart title"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
          </div>
          
          <Button onClick={generateVisualization} variant="primary" disabled={isLoading}>
            Create Visualization
          </Button>
        </Card>
      </div>
      
      <div className="mt-8">
        {isLoading && <Loader />}
        
        {error && (
          <div className="bg-red-100 text-red-800 p-4 rounded mb-4">
            {error}
          </div>
        )}
        
        {chartData && (
          <Card>
            <h2 className="text-xl font-semibold mb-4">
              {title || `${vizType.charAt(0).toUpperCase() + vizType.slice(1)} Chart`}
            </h2>
            <div className="h-96">
              {renderChart()}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VisualizationBuilder; 