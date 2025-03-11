import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/shared/AuthContext";
import { createTheme, ThemeProvider, CssBaseline } from "@mui/material";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import Login from "./pages/shared/Login";
import Home from "./pages/shared/Home";
import PatientPortal from "./pages/patient/PatientPortal";
import DoctorPortal from "./pages/doctor/DoctorPortal";
import ProtectedRoute from "./components/shared/ProtectedRoute";

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
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
          textTransform: "none",
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route
              path="/patient/*"
              element={
                <ProtectedRoute allowedUserTypes={["patient"]}>
                  <PatientPortal />
                </ProtectedRoute>
              }
            />

            <Route
              path="/doctor/*"
              element={
                <ProtectedRoute allowedUserTypes={["doctor"]}>
                  <DoctorPortal />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Home />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <ToastContainer position="bottom-right" autoClose={5000} />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
