import React, { useState } from 'react';
import { Box, FormControl, InputLabel, MenuItem, Select, Typography, Paper } from '@mui/material';
import Card from '../common/Card';

/**
 * DataSourceSelector component allows users to select different data sources
 * for analysis and visualization.
 */
const DataSourceSelector = ({ onSourceSelect, availableSources = [] }) => {
  const [selectedSource, setSelectedSource] = useState('');

  // Default sources if none provided
  const defaultSources = [
    { id: 'uploaded_files', name: 'Uploaded Files' },
    { id: 'database', name: 'Database Connection' },
    { id: 'api', name: 'API Integration' },
    { id: 'sample_data', name: 'Sample Datasets' }
  ];

  const sources = availableSources.length > 0 ? availableSources : defaultSources;

  const handleChange = (event) => {
    const sourceId = event.target.value;
    setSelectedSource(sourceId);
    
    // Find the selected source object and pass it to the parent component
    const source = sources.find(src => src.id === sourceId);
    if (onSourceSelect && source) {
      onSourceSelect(source);
    }
  };

  return (
    <Card>
      <Box p={2}>
        <Typography variant="h6" gutterBottom>
          Select Data Source
        </Typography>
        <FormControl fullWidth>
          <InputLabel id="data-source-select-label">Data Source</InputLabel>
          <Select
            labelId="data-source-select-label"
            id="data-source-select"
            value={selectedSource}
            label="Data Source"
            onChange={handleChange}
          >
            {sources.map((source) => (
              <MenuItem key={source.id} value={source.id}>
                {source.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {selectedSource && (
          <Paper elevation={0} sx={{ mt: 2, p: 2, bgcolor: 'background.paper' }}>
            <Typography variant="body2" color="text.secondary">
              Selected: {sources.find(src => src.id === selectedSource)?.name}
            </Typography>
          </Paper>
        )}
      </Box>
    </Card>
  );
};

export default DataSourceSelector;