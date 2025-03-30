import React from 'react';
import { Button as MuiButton } from '@mui/material';
import styled from 'styled-components';

const StyledButton = styled(MuiButton)`
  border-radius: 8px;
  text-transform: none;
  font-weight: 600;
  box-shadow: ${props => props.variant === 'contained' ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none'};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.variant === 'contained' ? '0 6px 8px rgba(0, 0, 0, 0.15)' : 'none'};
  }
`;

const Button = ({ children, ...props }) => {
  return (
    <StyledButton {...props}>
      {children}
    </StyledButton>
  );
};

export default Button;