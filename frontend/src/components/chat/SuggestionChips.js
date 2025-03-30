import React from 'react';
import { Box, Chip } from '@mui/material';
import styled from 'styled-components';

const ChipsContainer = styled(Box)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  margin-bottom: 8px;
`;

const StyledChip = styled(Chip)`
  background-color: #f0f7ff;
  border: 1px solid #e1f0ff;
  color: #2196F3;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e1f0ff;
    transform: translateY(-2px);
  }
`;

const SuggestionChips = ({ suggestions = [], onSelect }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }
  
  return (
    <ChipsContainer>
      {suggestions.map((suggestion, index) => (
        <StyledChip
          key={index}
          label={suggestion}
          onClick={() => onSelect(suggestion)}
          clickable
        />
      ))}
    </ChipsContainer>
  );
};

export default SuggestionChips;