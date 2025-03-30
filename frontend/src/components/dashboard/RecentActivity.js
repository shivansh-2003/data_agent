import React from 'react';
import { List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, Divider, Box, Chip } from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import BarChartIcon from '@mui/icons-material/BarChart';
import StorageIcon from '@mui/icons-material/Storage';
import CodeIcon from '@mui/icons-material/Code';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

/**
 * RecentActivity component displays a list of recent user activities
 * such as file uploads, chart creations, or data queries.
 */
const RecentActivity = ({ activities = [], maxItems = 5 }) => {
  // Default activities if none provided
  const defaultActivities = [
    { 
      id: 1, 
      type: 'file_upload', 
      title: 'Sales Data.csv uploaded',
      description: 'CSV file with 2,500 rows',
      timestamp: new Date(Date.now() - 1000 * 60 * 15) // 15 minutes ago
    },
    { 
      id: 2, 
      type: 'visualization', 
      title: 'Revenue Trend Chart created',
      description: 'Line chart showing monthly revenue',
      timestamp: new Date(Date.now() - 1000 * 60 * 45) // 45 minutes ago
    },
    { 
      id: 3, 
      type: 'data_query', 
      title: 'SQL Query executed',
      description: 'SELECT * FROM sales WHERE region = "North"',
      timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
    },
    { 
      id: 4, 
      type: 'file_upload', 
      title: 'Customer Data.xlsx uploaded',
      description: 'Excel file with 3 worksheets',
      timestamp: new Date(Date.now() - 1000 * 60 * 240) // 4 hours ago
    },
    { 
      id: 5, 
      type: 'visualization', 
      title: 'Customer Distribution created',
      description: 'Pie chart showing customer segments',
      timestamp: new Date(Date.now() - 1000 * 60 * 300) // 5 hours ago
    }
  ];

  const displayActivities = activities.length > 0 ? activities : defaultActivities;
  const limitedActivities = displayActivities.slice(0, maxItems);

  // Helper function to format relative time
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}d ago`;
    if (diffHour > 0) return `${diffHour}h ago`;
    if (diffMin > 0) return `${diffMin}m ago`;
    return 'Just now';
  };

  // Get icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'file_upload':
        return <InsertDriveFileIcon />;
      case 'visualization':
        return <BarChartIcon />;
      case 'data_query':
        return <CodeIcon />;
      case 'database':
        return <StorageIcon />;
      default:
        return <AccessTimeIcon />;
    }
  };

  // Get color based on activity type
  const getActivityColor = (type) => {
    switch (type) {
      case 'file_upload':
        return '#4caf50';
      case 'visualization':
        return '#2196f3';
      case 'data_query':
        return '#ff9800';
      case 'database':
        return '#9c27b0';
      default:
        return '#757575';
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <List sx={{ width: '100%', bgcolor: 'background.paper', p: 0 }}>
        {limitedActivities.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <ListItem alignItems="flex-start" sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                  {getActivityIcon(activity.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="subtitle2" component="div">
                    {activity.title}
                  </Typography>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                    >
                      {activity.description}
                    </Typography>
                    <Box sx={{ mt: 0.5 }}>
                      <Chip
                        label={getRelativeTime(activity.timestamp)}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.75rem' }}
                      />
                    </Box>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < limitedActivities.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default RecentActivity;