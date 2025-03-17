import React from 'react';
import { Link } from 'react-router-dom';
import { List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';

const PatientNavigation: React.FC = () => {
  return (
    <List>
      <ListItemButton component={Link} to="/patient/appointments">
        <ListItemIcon>
          <CalendarTodayIcon />
        </ListItemIcon>
        <ListItemText primary="My Appointments" />
      </ListItemButton>
      <ListItemButton component={Link} to="/patient/search-doctors">
        <ListItemIcon>
          <SearchIcon />
        </ListItemIcon>
        <ListItemText primary="Search Doctors" />
      </ListItemButton>
    </List>
  );
};

export default PatientNavigation;
