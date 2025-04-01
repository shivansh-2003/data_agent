import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

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
  
  // Base API URL
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
  
  // Function to load data from a file
  const loadDataFromFile = async (file) => {
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await axios.post(`${API_URL}/api/data/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data) {
        setData(response.data.sample);
        setDataColumns(response.data.columns);
        setDataShape(response.data.shape);
        setDataStats(response.data.stats);
        setDataLoaded(true);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.response?.data?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to load data from a URL
  const loadDataFromUrl = async (url) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`${API_URL}/api/data/url`, { url });
      
      if (response.data) {
        setData(response.data.sample);
        setDataColumns(response.data.columns);
        setDataShape(response.data.shape);
        setDataStats(response.data.stats);
        setDataLoaded(true);
      }
    } catch (err) {
      console.error('Error loading data from URL:', err);
      setError(err.response?.data?.message || 'Failed to load data from URL');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to get basic data analysis
  const getBasicAnalysis = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/data/analysis/basic`);
      return response.data;
    } catch (err) {
      console.error('Error getting basic analysis:', err);
      setError(err.response?.data?.message || 'Failed to get basic analysis');
      throw err;
    }
  };
  
  // Function to get correlation analysis
  const getCorrelationAnalysis = async (columns) => {
    try {
      const response = await axios.post(`${API_URL}/api/data/analysis/correlation`, { columns });
      return response.data;
    } catch (err) {
      console.error('Error getting correlation analysis:', err);
      setError(err.response?.data?.message || 'Failed to get correlation analysis');
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
    setError(null);
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
        loadDataFromFile,
        loadDataFromUrl,
        getBasicAnalysis,
        getCorrelationAnalysis,
        clearData
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContext;