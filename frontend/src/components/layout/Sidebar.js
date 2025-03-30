import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Divider, Box, Typography } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import StorageIcon from '@mui/icons-material/Storage';
import BarChartIcon from '@mui/icons-material/BarChart';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import styled from 'styled-components';

const StyledDrawer = styled(Drawer)`
  .MuiDrawer-paper {
    width: 260px;
    background-color: #f8f9fa;
    border-right: none;
    box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
  }
`;

const LogoContainer = styled(Box)`
  padding: 20px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

const MenuSection = styled(Box)`
  margin-top: 16px;
  padding: 0 8px;
`;

const MenuHeader = styled(Typography)`
  padding: 8px 16px;
  color: #666;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const StyledListItem = styled(ListItem)`
  border-radius: 8px;
  margin: 4px 0;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
  
  &.active {
    background-color: rgba(33, 150, 243, 0.08);
    
    .MuiListItemIcon-root {
      color: #2196F3;
    }
    
    .MuiListItemText-primary {
      color: #2196F3;
      font-weight: 600;
    }
  }
`;

const Sidebar = ({ open, onClose, variant = 'permanent' }) => {
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Chat Interface', icon: <ChatIcon />, path: '/chat' },
    { text: 'Data Explorer', icon: <StorageIcon />, path: '/data-explorer' },
    { text: 'Visualizations', icon: <BarChartIcon />, path: '/visualizations' },
  ];

  const secondaryMenuItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help & Support', icon: <HelpIcon />, path: '/help' },
  ];

  const drawer = (
    <>
      <LogoContainer>
        <Typography variant="h6" fontWeight="700" color="primary">
          Data Analyst AI
        </Typography>
      </LogoContainer>
      
      <MenuSection>
        <MenuHeader>Main</MenuHeader>
        <List>
          {menuItems.map((item) => (
            <StyledListItem button key={item.text} className={item.path === '/dashboard' ? 'active' : ''}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItem>
          ))}
        </List>
      </MenuSection>
      
      <Divider sx={{ my: 2, mx: 2 }} />
      
      <MenuSection>
        <MenuHeader>Support</MenuHeader>
        <List>
          {secondaryMenuItems.map((item) => (
            <StyledListItem button key={item.text}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItem>
          ))}
        </List>
      </MenuSection>
    </>
  );

  return (
    <StyledDrawer
      variant={variant}
      open={open}
      onClose={onClose}
    >
      {drawer}
    </StyledDrawer>
  );
};

export default Sidebar;