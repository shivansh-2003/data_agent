import React from 'react';
import { Card, CardContent, CardHeader, Typography, Box, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

/**
 * DashboardCard component provides a consistent card layout for dashboard widgets
 * with customizable header, content, and actions.
 */
const DashboardCard = ({
  title,
  subtitle,
  children,
  action,
  elevation = 1,
  minHeight,
  sx = {}
}) => {
  return (
    <Card 
      elevation={elevation}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: minHeight || 'auto',
        ...sx
      }}
    >
      {title && (
        <CardHeader
          title={
            <Typography variant="h6" component="div">
              {title}
            </Typography>
          }
          subheader={subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          action={
            action || (
              <IconButton aria-label="settings">
                <MoreVertIcon />
              </IconButton>
            )
          }
        />
      )}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flexGrow: 1 }}>
          {children}
        </Box>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;