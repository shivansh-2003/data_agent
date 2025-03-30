import React, { useState } from 'react';
import { Box, Grid, Typography, Paper, Divider, Container } from '@mui/material';
import DataTable from '../components/data/DataTable';
import DataPreview from '../components/data/DataPreview';
import FileUploader from '../components/data/FileUploader';
import DataSourceSelector from '../components/data/DataSourceSelector';

/**
 * DataExplorer page provides an interface for users to explore, analyze,
 * and visualize their data from various sources.
 */
const DataExplorer = () => {
  const [selectedData, setSelectedData] = useState(null);
  const [dataSource, setDataSource] = useState(null);
  
  // Sample data for demonstration
  const sampleData = {
    columns: [
      { field: 'id', headerName: 'ID', width: 70 },
      { field: 'name', headerName: 'Name', width: 130 },
      { field: 'age', headerName: 'Age', width: 90 },
      { field: 'email', headerName: 'Email', width: 200 },
      { field: 'country', headerName: 'Country', width: 130 },
    ],
    rows: [
      { id: 1, name: 'John Doe', age: 35, email: 'john@example.com', country: 'USA' },
      { id: 2, name: 'Jane Smith', age: 28, email: 'jane@example.com', country: 'Canada' },
      { id: 3, name: 'Bob Johnson', age: 42, email: 'bob@example.com', country: 'UK' },
      { id: 4, name: 'Alice Brown', age: 24, email: 'alice@example.com', country: 'Australia' },
      { id: 5, name: 'Charlie Wilson', age: 31, email: 'charlie@example.com', country: 'Germany' },
    ],
  };

  const handleFileUpload = (files) => {
    console.log('Files uploaded:', files);
    // In a real application, this would process the files and extract data
    setSelectedData(sampleData);
  };

  const handleDataSourceSelect = (source) => {
    console.log('Data source selected:', source);
    setDataSource(source);
    // In a real application, this would fetch data from the selected source
    setSelectedData(sampleData);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Explorer
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Upload, connect, and explore your data from various sources
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Data Sources
              </Typography>
              <Box sx={{ mb: 3 }}>
                <FileUploader onUpload={handleFileUpload} />
              </Box>
              <Box>
                <DataSourceSelector onSourceSelect={handleDataSourceSelect} />
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 2, height: '100%' }}>
              {selectedData ? (
                <>
                  <Typography variant="h6" gutterBottom>
                    Data Preview
                  </Typography>
                  <DataPreview data={selectedData} />
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom>
                    Data Table
                  </Typography>
                  <DataTable data={selectedData} />
                </>
              ) : (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: 400,
                  flexDirection: 'column'
                }}>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No Data Selected
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upload a file or select a data source to begin exploring
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DataExplorer;