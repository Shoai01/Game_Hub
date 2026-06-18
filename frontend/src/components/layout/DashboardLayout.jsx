import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Container,
  Divider,
} from '@mui/material';
import {
  LogoutOutlined,
  PersonOutlined,
  SportsEsportsOutlined,
} from '@mui/icons-material';
import { useState } from 'react';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
    navigate('/login');
  };

  const handleProfile = () => {
    handleMenuClose();
    navigate('/profile');
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* ── Top Navigation Bar ── */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {/* Logo */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => navigate('/dashboard')}
          >
            <SportsEsportsOutlined
              sx={{ fontSize: 28, color: 'primary.main' }}
            />
            <Typography
              variant="h6"
              sx={{
                color: 'primary.main',
                fontWeight: 800,
                letterSpacing: '-0.5px',
              }}
            >
              GameHub
            </Typography>
          </Box>

          {/* User Menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="body2"
              sx={{
                color: 'text.primary',
                fontWeight: 600,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {user?.username}
            </Typography>
            <IconButton onClick={handleMenuOpen} size="small" id="user-menu-button">
              <Avatar
                src={user?.avatar}
                alt={user?.username}
                sx={{ width: 36, height: 36, border: '2px solid', borderColor: 'primary.light' }}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 180,
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  },
                },
              }}
            >
              <MenuItem onClick={handleProfile} id="menu-profile">
                <ListItemIcon>
                  <PersonOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profile</ListItemText>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout} id="menu-logout">
                <ListItemIcon>
                  <LogoutOutlined fontSize="small" />
                </ListItemIcon>
                <ListItemText>Logout</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* ── Main Content ── */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
