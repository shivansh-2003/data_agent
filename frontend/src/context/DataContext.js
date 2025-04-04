import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import config from '../config';

// Create context
const DataContext = createContext();

// Custom hook to use the data context
export const useData = () => useContext(DataContext);

// Provider component
export const DataProvider = ({ children }) => {
  const [data, setData] = useState(null);
  const [dataColumns, setDataColumns] = useState(null);
  const [dataShape, setDataShape] = useState(null);
  const [dataStats, setDataStats] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeVisualization, setActiveVisualization] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  
  // Base API URL
  const API_URL = config.api.baseUrl;
  
  // Function to load data from a file
  const loadDataFromFile = async (file) => {
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Create session if needed
      if (!activeSession) {
        const sessionResponse = await axios.post(`${API_URL}/sessions`, {
          model_name: "gpt-4"
        });
        setActiveSession(sessionResponse.data.session_id);
      }
      
      const sessionId = activeSession;
      const response = await axios.post(`${API_URL}/sessions/${sessionId}/data/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        // After data is uploaded, get a preview
        const previewResponse = await axios.get(`${API_URL}/sessions/${sessionId}/data/preview`);
        if (previewResponse.data) {
          setData(previewResponse.data.sample_data);
          setDataColumns(previewResponse.data.columns);
          setDataShape(previewResponse.data.shape);
          setDataLoaded(true);
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.detail || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to generate a visualization
  const generateVisualization = async (vizType, options = {}) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!activeSession) {
        throw new Error("No active session");
      }
      
      let response;
      
      if (vizType === 'natural') {
        // For natural language requests, use the chat endpoint
        response = await axios.post(`${API_URL}/sessions/${activeSession}/chat`, {
          session_id: activeSession,
          query: options.query
        });
      } else {
        // For structured requests, use the visualize endpoint
        response = await axios.post(`${API_URL}/sessions/${activeSession}/visualize`, {
          viz_type: vizType,
          x_column: options.xColumn,
          y_column: options.yColumn,
          group_by: options.groupBy,
          title: options.title
        });
      }
      
      if (response.data) {
        // Set the visualization data
        if (response.data.visualization) {
          setActiveVisualization(response.data.visualization);
        } else if (typeof response.data.response === 'string' && 
                   response.data.response.includes('<div id=') && 
                   response.data.response.includes('plotly')) {
          // If visualization is embedded in the response
          setActiveVisualization(response.data.response);
        } else {
          setActiveVisualization(null);
          setError("No visualization was generated");
        }
        
        return response.data;
      }
    } catch (err) {
      console.error('Error generating visualization:', err);
      setError(err.response?.data?.detail || 'Failed to generate visualization');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to load data from a URL
  const loadDataFromUrl = async (url) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Implementation would go here
      setError("Loading from URL is not implemented yet");
    } catch (err) {
      console.error('Error loading data from URL:', err);
      setError(err.response?.data?.detail || 'Failed to load data from URL');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to get basic data analysis
  const getBasicAnalysis = async () => {
    try {
      if (!activeSession) {
        throw new Error("No active session");
      }
      
      const response = await axios.post(`${API_URL}/sessions/${activeSession}/analyze/basic`);
      return response.data;
    } catch (err) {
      console.error('Error getting basic analysis:', err);
      setError(err.response?.data?.detail || 'Failed to get basic analysis');
      throw err;
    }
  };
  
  // Function to get correlation analysis
  const getCorrelationAnalysis = async (columns) => {
    try {
      if (!activeSession) {
        throw new Error("No active session");
      }
      
      const response = await axios.post(`${API_URL}/sessions/${activeSession}/analyze/correlation`, { columns });
      return response.data;
    } catch (err) {
      console.error('Error getting correlation analysis:', err);
      setError(err.response?.data?.detail || 'Failed to get correlation analysis');
      throw err;
    }
  };
  
  // Function to clear loaded data
  const clearData = () => {
    setData(null);
    setDataColumns(null);
    setDataShape(null);
    setDataStats(null);
    setDataLoaded(false);
    setActiveVisualization(null);
    setError(null);
    
    // Clear session
    if (activeSession) {
      try {
        axios.delete(`${API_URL}/sessions/${activeSession}`);
      } catch (err) {
        console.error('Error clearing session:', err);
      }
      setActiveSession(null);
    }
  };
  
  return (
    <DataContext.Provider
      value={{
        data,
        dataColumns,
        dataShape,
        dataStats,
        dataLoaded,
        isLoading,
        error,
        activeVisualization,
        loadDataFromFile,
        loadDataFromUrl,
        getBasicAnalysis,
        getCorrelationAnalysis,
        generateVisualization,
        clearData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;