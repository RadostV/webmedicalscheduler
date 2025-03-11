import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/shared/AuthContext";
import EventIcon from "@mui/icons-material/Event";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LogoutIcon from "@mui/icons-material/Logout";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ mb: 4 }}>
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: "none", color: "inherit" }}
        >
          Medical Scheduler
        </Typography>

        {isAuthenticated && user ? (
          <>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="body1" sx={{ mr: 2 }}>
                Welcome, {user.username}
              </Typography>

              {user.type === "patient" ? (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/patient/appointments"
                    startIcon={<EventIcon />}
                    sx={{ mr: 1 }}
                  >
                    My Appointments
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/patient/schedule"
                    startIcon={<CalendarMonthIcon />}
                    sx={{ mr: 1 }}
                  >
                    Schedule New
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/doctor/schedule"
                    startIcon={<CalendarMonthIcon />}
                    sx={{ mr: 1 }}
                  >
                    My Schedule
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/doctor/availability"
                    startIcon={<EventIcon />}
                    sx={{ mr: 1 }}
                  >
                    Set Availability
                  </Button>
                </>
              )}

              <IconButton
                color="inherit"
                onClick={handleLogout}
                aria-label="logout"
              >
                <LogoutIcon />
              </IconButton>
            </Box>
          </>
        ) : (
          <Box>
            <Button color="inherit" component={Link} to="/login" sx={{ mr: 1 }}>
              Login
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/register"
              variant="outlined"
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
