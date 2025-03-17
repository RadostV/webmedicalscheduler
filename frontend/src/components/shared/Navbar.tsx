import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { useAuth } from '../../contexts/shared/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout();
  };

  const handleProfileClick = () => {
    setAnchorEl(null);
    if (user?.type === 'patient') {
      navigate('/patient/appointments', { replace: true });
    } else {
      const profilePath = `/${user!.type}/profile`;
      if (location.pathname !== profilePath) {
        navigate(profilePath, { replace: true });
      }
    }
  };

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
          onClick={(e) => {
            if (location.pathname === '/') {
              e.preventDefault();
            }
          }}
        >
          Medical Scheduler
        </Typography>

        {user ? (
          <>
            {user.type === 'patient' && (
              <Box sx={{ mr: 2 }}>
                <Button
                  color="inherit"
                  component={Link}
                  to="/patient/appointments"
                  onClick={(e) => {
                    if (location.pathname === '/patient/appointments') {
                      e.preventDefault();
                    }
                  }}
                >
                  My Appointments
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/patient/search-doctors"
                  onClick={(e) => {
                    if (location.pathname === '/patient/search-doctors') {
                      e.preventDefault();
                    }
                  }}
                >
                  Find a Doctor
                </Button>
              </Box>
            )}
            {user.type === 'doctor' && (
              <Box sx={{ mr: 2 }}>
                <Button
                  color="inherit"
                  component={Link}
                  to="/doctor/schedule"
                  onClick={(e) => {
                    if (location.pathname === '/doctor/schedule') {
                      e.preventDefault();
                    }
                  }}
                >
                  My Schedule
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/doctor/availability"
                  onClick={(e) => {
                    if (location.pathname === '/doctor/availability') {
                      e.preventDefault();
                    }
                  }}
                >
                  Set Availability
                </Button>
              </Box>
            )}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
              <Typography variant="body1" sx={{ mr: 1 }}>
                Welcome, {user.username}
              </Typography>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
            </Box>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <Box>
            <Button
              color="inherit"
              component={Link}
              to="/login"
              onClick={(e) => {
                if (location.pathname === '/login') {
                  e.preventDefault();
                }
              }}
            >
              Login
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/register"
              onClick={(e) => {
                if (location.pathname === '/register') {
                  e.preventDefault();
                }
              }}
            >
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
