import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/shared/AuthContext";
import { UserType } from "../../types/shared/auth.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedUserTypes?: UserType[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedUserTypes,
}) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // Check if the user is authenticated
  if (!isAuthenticated) {
    // Redirect to login page and save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If there are specific user types allowed, check if the user has the right type
  if (allowedUserTypes && allowedUserTypes.length > 0 && user) {
    if (!allowedUserTypes.includes(user.type)) {
      // If user doesn't have the right type, redirect to the appropriate portal
      const redirectPath = user.type === "patient" ? "/patient" : "/doctor";
      return <Navigate to={redirectPath} replace />;
    }
  }

  // If all checks pass, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
