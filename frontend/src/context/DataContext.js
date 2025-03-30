import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [data, setData] = useState(null);
  const [dataPreview, setDataPreview] = useState(null);
  const [dataColumns, setDataColumns] = useState([]);
  const [dataShape, setDataShape] = useState({ rows: 0, columns: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Reset data state when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setData(null);
      setDataPreview(null);
      setDataColumns([]);
      setDataShape({ rows: 0, columns: 0 });
      setDataLoaded(false);
    }
  }, [isAuthenticated]);

  const uploadFile = async (file) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`/sessions/${token}/data/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload file');
      }

      const result = await response.json();
      await fetchDataPreview();
      setDataLoaded(true);
      return result;
    } catch (error) {
      setError(error.message);
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadTextData = async (data, format = 'csv') => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('data', data);
    formData.append('format', format);

    try {
      const response = await fetch(`/sessions/${token}/data/text`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to process data');
      }

      const result = await response.json();
      await fetchDataPreview();
      setDataLoaded(true);
      return result;
    } catch (error) {
      setError(error.message);
      console.error('Error processing text data:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDataPreview = async (rows = 10) => {
    if (!token) {
      setError('Authentication required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/sessions/${token}/data/preview?rows=${rows}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch data preview');
      }

      const previewData = await response.json();
      setDataPreview(previewData.sample_data);
      setDataColumns(previewData.columns);
      setDataShape(previewData.shape);
      return previewData;
    } catch (error) {
      setError(error.message);
      console.error('Error fetching data preview:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    data,
    dataPreview,
    dataColumns,
    dataShape,
    isLoading,
    error,
    dataLoaded,
    uploadFile,
    uploadTextData,
    fetchDataPreview,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext; 