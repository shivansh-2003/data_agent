import React from 'react';
import { Card as MuiCard, CardContent, Typography } from '@mui/material';
import styled from 'styled-components';

const StyledCard = styled(MuiCard)`
  border-radius: 12px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  overflow: hidden;
  height: 100%;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
  }
`;

const Card = ({ title, children, ...props }) => {
  return (
    <StyledCard {...props}>
      <CardContent>
        {title && (
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
        )}
        {children}
      </CardContent>
    </StyledCard>
  );
};

export default Card;