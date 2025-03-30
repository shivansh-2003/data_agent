import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Drawer, List, ListItem, ListItemText, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import BarChartIcon from '@mui/icons-material/BarChart';
import { motion } from 'framer-motion';

const Navbar = () => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: <BarChartIcon /> },
    { name: 'Dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { name: 'Chat', path: '/chat', icon: <ChatIcon /> },
  ];

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const drawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <List>
        {navItems.map((item) => (
          <ListItem 
            button 
            component={Link} 
            to={item.path} 
            key={item.name}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                },
              },
            }}
          >
            <Box sx={{ mr: 2, color: location.pathname === item.path ? theme.palette.primary.main : 'inherit' }}>
              {item.icon}
            </Box>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 120 }}
    >
      <AppBar position="sticky" color="default" elevation={0} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(8px)' }}>
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700, 
              color: theme.palette.primary.main,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <BarChartIcon sx={{ mr: 1 }} />
            Data Analyst AI
          </Typography>

          {isMobile ? (
            <>
              <IconButton
                edge="end"
                color="inherit"
                aria-label="menu"
                onClick={toggleDrawer(true)}
              >
                <MenuIcon />
              </IconButton>
              <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
              >
                {drawer}
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  component={Link}
                  to={item.path}
                  color={location.pathname === item.path ? 'primary' : 'inherit'}
                  sx={{
                    fontWeight: location.pathname === item.path ? 600 : 500,
                    position: 'relative',
                    '&::after': location.pathname === item.path ? {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: '30%',
                      height: '3px',
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: '3px 3px 0 0',
                    } : {},
                  }}
                  startIcon={item.icon}
                >
                  {item.name}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </motion.div>
  );
};

export default Navbar;