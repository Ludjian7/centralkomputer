import React, { useContext } from 'react';
import { Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Divider,
  Tooltip
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../../context/AuthContext';
import { layoutGradients, themeColors } from './LayoutStyles';

// Define layout constants
// Optimized layout constants for desktop
const SIDEBAR_WIDTH = 260;
const CONTENT_MAX_WIDTH = 1600;
const CONTENT_PADDING = 32;

// Flexible drawer width based on content
const drawerWidth = SIDEBAR_WIDTH;

// Define content margin and width (reduced by 20%)
const sidebarWidth = 224; // Reduced from 280 (20% less)

const Main = styled('main')(
  ({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(CONTENT_PADDING / 8),
    paddingTop: theme.spacing(3),
    marginLeft: SIDEBAR_WIDTH + 24,
    marginRight: 24, // Added right margin to balance the layout
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    backgroundImage: layoutGradients.contentBackground,
    minHeight: '100vh',
    width: `calc(100% - ${SIDEBAR_WIDTH + 48}px)`, // Adjusted width to account for right margin
    maxWidth: CONTENT_MAX_WIDTH - SIDEBAR_WIDTH - 48, // Adjusted max width to account for right margin
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
  }),
);

const Layout = () => {
  const { currentUser, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // If loading, show nothing
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not logged in, redirect to login
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { text: 'Beranda', icon: <DashboardIcon />, path: '/' },
    { text: 'Penjualan', icon: <ReceiptIcon />, path: '/sales' },
    { text: 'Produk', icon: <InventoryIcon />, path: '/products' },
    { text: 'Supplier', icon: <PeopleIcon />, path: '/suppliers' },
    { text: 'Laporan', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Karyawan', icon: <PersonIcon />, path: '/employees' },
  ];

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
      logout();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center',
      background: layoutGradients.mainBackground,
      minHeight: '100vh',
      overflow: 'hidden',
    }}>
      <Box sx={{ 
        display: 'flex', 
        width: '100%',
        maxWidth: CONTENT_MAX_WIDTH,
        position: 'relative',
        mx: 'auto',
        background: layoutGradients.contentBackground,
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.05)',
        borderRadius: 3,
        my: 2,
      }}>
        <Drawer
          variant="permanent"
          anchor="left"
          open={true}
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            position: 'fixed',
            top: '50%',
            left: 0,
            transform: 'translateY(-50%)',
            zIndex: 1400,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              minWidth: '160px',
              maxWidth: `${sidebarWidth}px`,
              boxSizing: 'border-box',
              backgroundColor: 'rgba(61, 211, 123, 0.1)',
              color: '#232E3F',
              borderRadius: { xs: '8px', sm: '12px', md: '16px' },
              boxShadow: '4px 4px 10px rgba(0, 0, 0, 0.1)',
              border: '2px solid transparent',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: { xs: '8px', sm: '12px', md: '16px' },
                padding: '2px',
                background: 'linear-gradient(135deg, #FE7102, #3DD37B, #6495ED, #9370DB)',
                mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                maskComposite: 'exclude',
                WebkitMaskComposite: 'xor',
                pointerEvents: 'none',
                zIndex: 0,
                animation: 'borderAnimation 4s linear infinite',
              },
              '@keyframes borderAnimation': {
                '0%': { background: 'linear-gradient(135deg, #FE7102, #3DD37B, #6495ED, #9370DB)' },
                '25%': { background: 'linear-gradient(225deg, #FE7102, #3DD37B, #6495ED, #9370DB)' },
                '50%': { background: 'linear-gradient(315deg, #FE7102, #3DD37B, #6495ED, #9370DB)' },
                '75%': { background: 'linear-gradient(45deg, #FE7102, #3DD37B, #6495ED, #9370DB)' },
                '100%': { background: 'linear-gradient(135deg, #FE7102, #3DD37B, #6495ED, #9370DB)' },
              },
              height: 'auto',
              maxHeight: 'none',
              overflowY: 'visible',
              marginLeft: '20px',
              transition: 'all 0.3s ease',
              padding: 0,
            },

          }}
        >
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
          }}>
            <List sx={{ 
              px: { xs: 1, sm: 1.2, md: 1.6 }, 
              py: { xs: 1, sm: 1.2, md: 1.6 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // Center items horizontally
              width: '100%',
              flex: '1 0 auto'
            }}>
              {menuItems.map((item, index) => (
                <ListItem
                  button
                  key={item.text}
                  onClick={() => navigate(item.path)}
                  sx={{
                    borderRadius: { xs: 1, sm: 1.2, md: 1.6 },
                    mb: { xs: 1, sm: 1.2, md: 1.5 },
                    p: { xs: 0.8, sm: 1, md: 1.2 },
                    mx: { xs: 0.8, sm: 1, md: 1.5 },
                    my: { xs: 0.5, sm: 0.6, md: 0.8 },
                    width: '85%', // Set width to create horizontal centering effect
                    backgroundColor: (isActive(item.path) || (item.path === '/reports' && isSubActive('/reports')))
                      ? 'rgba(27, 65, 55, 0.9)' // Darker green for active 
                      : index % 7 === 0 
                        ? 'rgba(100, 180, 230, 0.7)' // Brighter blue
                        : index % 7 === 1 
                          ? 'rgba(152, 120, 210, 0.7)' // Brighter lavender
                          : index % 7 === 2
                            ? 'rgba(90, 195, 150, 0.7)' // Brighter mint
                            : index % 7 === 3
                              ? 'rgba(240, 154, 86, 0.7)' // Brighter peach
                              : index % 7 === 4
                                ? 'rgba(220, 120, 170, 0.7)' // Brighter pink
                                : index % 7 === 5
                                  ? 'rgba(135, 185, 95, 0.7)' // Brighter light green
                                  : 'rgba(180, 150, 115, 0.7)', // Brighter tan
                    color: (isActive(item.path) || (item.path === '/reports' && isSubActive('/reports'))) ? '#FFFFFF' : '#232E3F',
                    borderLeft: (isActive(item.path) || (item.path === '/reports' && isSubActive('/reports'))) ? '2px solid #3DD37B' : '2px solid transparent',
                    boxShadow: (isActive(item.path) || (item.path === '/reports' && isSubActive('/reports'))) ? '0 2px 4px rgba(27, 65, 55, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: (isActive(item.path) || (item.path === '/reports' && isSubActive('/reports'))) ? '#3DD37B' : '#555555',
                    minWidth: { xs: 28, sm: 32, md: 36 },
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: { xs: 12, sm: 13, md: 14 },
                      fontWeight: (isActive(item.path) || (item.path === '/reports' && isSubActive('/reports'))) ? 800 : 700,
                      ml: { xs: 0.5, sm: 0.8, md: 1 },
                    }} 
                  />
                </ListItem>
              ))}
            </List>
            
            <Divider sx={{ 
              width: '85%', 
              mx: 'auto', 
              my: 2, 
              borderColor: 'rgba(254, 113, 2, 0.4)',
              borderWidth: '1px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }} />
            
            <Box sx={{ 
              mb: 2,
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
            }}>
              <Tooltip title="Keluar dari aplikasi" placement="right">
                <Button
                  variant="contained"
                  startIcon={<LogoutIcon />}
                  onClick={handleLogout}
                  size="small"
                  sx={{
                    width: '70%',
                    backgroundColor: themeColors.secondary,
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: { xs: 1, sm: 1.2, md: 1.6 },
                    fontSize: { xs: 10, sm: 11, md: 12 },
                    py: 0.5,
                    px: 1.5,
                    '&:hover': {
                      backgroundColor: '#D05E00',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    },
                    transition: 'all 0.2s ease-in-out',
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: 16, sm: 18, md: 20 }
                    }
                  }}
                >
                  Keluar
                </Button>
              </Tooltip>
            </Box>
            
            <Divider sx={{ width: '90%', mx: 'auto', mb: 2, borderColor: 'rgba(254, 113, 2, 0.2)' }} />
            
            <Box sx={{ 
              p: { xs: 2, sm: 2.5, md: 3 },
              borderTop: '1px solid rgba(254, 113, 2, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              width: '100%',
              mt: 'auto',
              borderBottomLeftRadius: { xs: '8px', sm: '12px', md: '16px' },
              borderBottomRightRadius: { xs: '8px', sm: '12px', md: '16px' },
            }}>
              <Box 
                component="img"
                src="/images/central-computer-logo.png"
                alt="Central Computer Logo"
                sx={{
                  width: '85%',
                  maxHeight: '70px',
                  objectFit: 'cover',
                  mb: 1,
                }}
              />
              <Box 
                sx={{ 
                  width: '50%', 
                  height: '2px', 
                  background: 'linear-gradient(90deg, transparent, rgba(254, 113, 2, 0.6), transparent)',
                  my: 1,
                }} 
              />
            </Box>
          </Box>
        </Drawer>
        
        <Main>
          <Box sx={{ 
            py: 2,
            px: { xs: 2, sm: 3, md: 4 },
            maxWidth: `${CONTENT_MAX_WIDTH}px`,
            width: '100%',
            mx: 'auto',
            mt: 2,
            background: layoutGradients.pageContainer,
            borderTop: '1px solid rgba(0,0,0,0.05)',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          }}>
            <Outlet />
          </Box>
        </Main>
      </Box>
    </Box>
  );
};

export default Layout; 
