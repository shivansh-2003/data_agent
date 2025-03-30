import React from 'react';
import { Box, Typography, Divider, Chip, Tooltip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

/**
 * StatisticWidget component displays a key metric or statistic with optional
 * comparison to previous period and trend indicator.
 */
const StatisticWidget = ({
  title,
  value,
  previousValue,
  unit = '',
  percentChange,
  icon: Icon,
  tooltipText,
  precision = 0,
  positiveIsBetter = true,
  sx = {}
}) => {
  // Calculate percent change if not provided but we have previous value
  const calculatedPercentChange = percentChange !== undefined 
    ? percentChange 
    : previousValue !== undefined && previousValue !== 0
      ? ((value - previousValue) / Math.abs(previousValue)) * 100
      : undefined;
  
  // Determine if trend is positive (for styling)
  const isPositive = calculatedPercentChange > 0;
  const isNeutral = calculatedPercentChange === 0;
  const trendIsGood = (isPositive && positiveIsBetter) || (!isPositive && !positiveIsBetter);
  
  // Format the value with the specified precision
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString(undefined, { 
        minimumFractionDigits: precision, 
        maximumFractionDigits: precision 
      })
    : value;

  return (
    <Box sx={{ p: 2, height: '100%', ...sx }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        {tooltipText && (
          <Tooltip title={tooltipText} arrow placement="top">
            <HelpOutlineIcon fontSize="small" color="action" sx={{ ml: 1 }} />
          </Tooltip>
        )}
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
        {Icon && <Icon sx={{ mr: 1, color: 'text.secondary' }} />}
        <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
          {formattedValue}
          {unit && (
            <Typography component="span" variant="subtitle1" color="text.secondary" sx={{ ml: 0.5 }}>
              {unit}
            </Typography>
          )}
        </Typography>
      </Box>
      
      {calculatedPercentChange !== undefined && (
        <Box sx={{ mt: 1 }}>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip
              size="small"
              icon={isPositive ? <TrendingUpIcon /> : isNeutral ? null : <TrendingDownIcon />}
              label={`${isPositive ? '+' : ''}${calculatedPercentChange.toFixed(1)}%`}
              color={trendIsGood ? 'success' : isNeutral ? 'default' : 'error'}
              variant="outlined"
              sx={{ height: 24 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
              vs previous period
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default StatisticWidget;