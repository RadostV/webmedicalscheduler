import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/shared/AuthContext";
import LoadingSpinner from "../../components/shared/LoadingSpinner";

const Home: React.FC = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user type
  if (user.type === "patient") {
    return <Navigate to="/patient/appointments" replace />;
  } else {
    return <Navigate to="/doctor/schedule" replace />;
  }
};

export default Home;
