import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  TablePagination, 
  TableSortLabel,
  Paper, 
  Box,
  Typography,
  TextField,
  InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import styled from 'styled-components';

const StyledTableContainer = styled(TableContainer)`
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
`;

const StyledTableHead = styled(TableHead)`
  background-color: #f5f5f5;
  
  .MuiTableCell-head {
    font-weight: 600;
  }
`;

const StyledTableRow = styled(TableRow)`
  &:nth-of-type(even) {
    background-color: rgba(0, 0, 0, 0.02);
  }
  
  &:hover {
    background-color: rgba(33, 150, 243, 0.04);
  }
`;

const DataTable = ({ data = [], columns = [], title }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Handle search filtering
  const filteredData = data.filter(row => {
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };
  
  const sortedData = React.useMemo(() => {
    if (!orderBy) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = a[orderBy];
      const bValue = b[orderBy];
      
      if (aValue < bValue) return order === 'asc' ? -1 : 1;
      if (aValue > bValue) return order === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, order, orderBy]);
  
  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Empty state
  if (!data.length) {
    return (
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" align="center" gutterBottom>
          No data available
        </Typography>
        <Typography variant="body2" align="center" color="textSecondary">
          Upload a file or connect to a data source to view data.
        </Typography>
      </Paper>
    );
  }
  
  return (
    <Box>
      {title && (
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      )}
      
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <TextField
          placeholder="Search..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      
      <StyledTableContainer component={Paper}>
        <Table aria-label="data table">
          <StyledTableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id}>
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </StyledTableHead>
          <TableBody>
            {sortedData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, rowIndex) => (
                <StyledTableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={column.id}>
                      {row[column.id]}
                    </TableCell>
                  ))}
                </StyledTableRow>
              ))}
          </TableBody>
        </Table>
      </StyledTableContainer>
      
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Box>
  );
};

export default DataTable;