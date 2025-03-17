import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/shared/AuthContext';
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import Login from './pages/shared/Login';
import Register from './pages/shared/Register';
import Home from './pages/shared/Home';
import PatientPortal from './pages/patient/PatientPortal';
import DoctorPortal from './pages/doctor/DoctorPortal';
import ProtectedRoute from './components/shared/ProtectedRoute';

// Create themes
const patientTheme = createTheme({
  palette: {
    primary: {
      main: '#4caf50', // Light green
      light: '#81c784',
      dark: '#388e3c',
    },
    secondary: {
      main: '#a5d6a7',
      light: '#c8e6c9',
      dark: '#66bb6a',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          '&.MuiButton-contained': {
            backgroundColor: '#4caf50',
            '&:hover': {
              backgroundColor: '#388e3c',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#e8f5e9',
            color: '#4caf50',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#f1f8e9',
        },
      },
    },
  },
});

const doctorTheme = createTheme({
  palette: {
    primary: {
      main: '#64b5f6', // Light blue
      light: '#90caf9',
      dark: '#42a5f5',
    },
    secondary: {
      main: '#bbdefb',
      light: '#e3f2fd',
      dark: '#90caf9',
    },
    success: {
      main: '#4caf50',
      light: '#81c784',
      dark: '#388e3c',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          '&.MuiButton-contained': {
            backgroundColor: '#64b5f6',
            '&:hover': {
              backgroundColor: '#42a5f5',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-colorSuccess': {
            backgroundColor: '#e3f2fd',
            color: '#64b5f6',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#f5f9ff',
        },
      },
    },
  },
});

const defaultTheme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const theme = user?.type === 'patient' ? patientTheme : user?.type === 'doctor' ? doctorTheme : defaultTheme;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/patient/*"
          element={
            <ProtectedRoute requiredRole="patient">
              <PatientPortal />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/*"
          element={
            <ProtectedRoute requiredRole="doctor">
              <DoctorPortal />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Home />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer position="bottom-right" autoClose={5000} />
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
