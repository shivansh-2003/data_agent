import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box, useTheme, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Button from '../common/Button';
import styled from 'styled-components';

const StyledAppBar = styled(AppBar)`
  background-color: #ffffff;
  color: #333;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
`;

const LogoText = styled(Typography)`
  font-weight: 700;
  background: linear-gradient(90deg, #2196F3 0%, #4CAF50 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-right: 24px;
`;

const Header = ({ onToggleSidebar }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <StyledAppBar position="fixed">
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        
        <LogoText variant="h6" noWrap>
          Data Analyst AI
        </LogoText>
        
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexGrow: 1 }}>
            <Button color="inherit">Dashboard</Button>
            <Button color="inherit">Chat</Button>
            <Button color="inherit">Data Explorer</Button>
            <Button color="inherit">Visualizations</Button>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
          <IconButton color="inherit" size="large">
            <HelpOutlineIcon />
          </IconButton>
          <IconButton color="inherit" size="large">
            <NotificationsIcon />
          </IconButton>
          <IconButton color="inherit" size="large" edge="end">
            <AccountCircleIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;