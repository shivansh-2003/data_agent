import React, { useState } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, Tab, Card, CardContent, Grid, Chip, Divider, Pagination } from '@mui/material';
import { motion } from 'framer-motion';
import TableChartIcon from '@mui/icons-material/TableChart';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InfoIcon from '@mui/icons-material/Info';

const DataPreview = ({ data, fileDetails, dataStats }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        when: 'beforeChildren',
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  // Calculate pagination
  const startIndex = (page - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = data ? data.slice(startIndex, endIndex) : [];
  const totalPages = data ? Math.ceil(data.length / rowsPerPage) : 0;

  // Get column headers
  const columns = data && data.length > 0 ? Object.keys(data[0]) : [];

  // Render table view
  const renderTableView = () => (
    <motion.div variants={itemVariants}>
      <TableContainer component={Paper} sx={{ mt: 2, maxHeight: 400, overflow: 'auto' }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column} sx={{ fontWeight: 'bold', bgcolor: 'primary.light', color: 'white' }}>
                  {column}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, rowIndex) => (
              <TableRow key={rowIndex} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                {columns.map((column) => (
                  <TableCell key={`${rowIndex}-${column}`}>{row[column]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handlePageChange} 
            color="primary" 
            showFirstButton 
            showLastButton
          />
        </Box>
      )}
    </motion.div>
  );

  // Render statistics view
  const renderStatsView = () => (
    <motion.div variants={itemVariants}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {dataStats && Object.entries(dataStats).map(([column, stats]) => (
          <Grid item xs={12} md={6} key={column}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="primary">
                  {column}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={1}>
                  {stats.type && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Type:</Typography>
                      <Typography variant="body1">{stats.type}</Typography>
                    </Grid>
                  )}
                  {stats.count !== undefined && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Count:</Typography>
                      <Typography variant="body1">{stats.count}</Typography>
                    </Grid>
                  )}
                  {stats.unique !== undefined && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Unique Values:</Typography>
                      <Typography variant="body1">{stats.unique}</Typography>
                    </Grid>
                  )}
                  {stats.nullCount !== undefined && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Null Values:</Typography>
                      <Typography variant="body1">{stats.nullCount}</Typography>
                    </Grid>
                  )}
                  {stats.mean !== undefined && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Mean:</Typography>
                      <Typography variant="body1">{stats.mean.toFixed(2)}</Typography>
                    </Grid>
                  )}
                  {stats.median !== undefined && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Median:</Typography>
                      <Typography variant="body1">{stats.median}</Typography>
                    </Grid>
                  )}
                  {stats.min !== undefined && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Min:</Typography>
                      <Typography variant="body1">{stats.min}</Typography>
                    </Grid>
                  )}
                  {stats.max !== undefined && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Max:</Typography>
                      <Typography variant="body1">{stats.max}</Typography>
                    </Grid>
                  )}
                  {stats.std !== undefined && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">Std Dev:</Typography>
                      <Typography variant="body1">{stats.std.toFixed(2)}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );

  // Render file info view
  const renderFileInfoView = () => (
    <motion.div variants={itemVariants}>
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary">File Details</Typography>
              <Divider sx={{ mb: 2 }} />
              {fileDetails && (
                <>
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Filename:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{fileDetails.filename}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">File Type:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Chip 
                        label={fileDetails.fileType} 
                        size="small" 
                        color="primary" 
                        variant="outlined" 
                      />
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Size:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{fileDetails.fileSize}</Typography>
                    </Grid>
                    
                    <Grid item xs={4}>
                      <Typography variant="body2" color="text.secondary">Uploaded:</Typography>
                    </Grid>
                    <Grid item xs={8}>
                      <Typography variant="body1">{fileDetails.uploadDate}</Typography>
                    </Grid>
                  </Grid>
                </>
              )}
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color="primary">Data Summary</Typography>
              <Divider sx={{ mb: 2 }} />
              {data && (
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Rows:</Typography>
                    <Typography variant="body1">{data.length}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">Columns:</Typography>
                    <Typography variant="body1">{columns.length}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Column Names:</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {columns.map(col => (
                        <Chip key={col} label={col} size="small" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight="medium">
          Data Preview
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          sx={{ 
            mb: 2,
            '& .MuiTab-root': { 
              fontWeight: 'medium',
              py: 1.5
            } 
          }}
        >
          <Tab icon={<TableChartIcon />} label="Table" iconPosition="start" />
          <Tab icon={<AssessmentIcon />} label="Statistics" iconPosition="start" />
          <Tab icon={<InfoIcon />} label="File Info" iconPosition="start" />
        </Tabs>
        
        {activeTab === 0 && renderTableView()}
        {activeTab === 1 && renderStatsView()}
        {activeTab === 2 && renderFileInfoView()}
      </Paper>
    </motion.div>
  );
};

export default DataPreview;