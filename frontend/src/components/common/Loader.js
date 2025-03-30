import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import styled from 'styled-components';

const LoaderContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
`;

const Loader = ({ size = 40, message = 'Loading...', fullPage = false }) => {
  const content = (
    <LoaderContainer>
      <CircularProgress size={size} color="primary" />
      {message && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
    </LoaderContainer>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

export default Loader;