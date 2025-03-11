import React, { createContext, useContext, useReducer, useEffect } from "react";
import { AuthState, User, LoginRequest } from "../../types/shared/auth.types";

// Define the interface for the context value
interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

// Initial state for auth
const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: false,
  error: null,
};

// Create the context
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Action types
type AuthAction =
  | { type: "LOGIN_REQUEST" }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Setup the reducer with the initial state
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: parsedUser, token },
        });
      } catch (error) {
        // Handle invalid stored user
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: "LOGIN_REQUEST" });

    try {
      // TODO: Replace with actual API call
      // Mocking API response for now
      const response = await new Promise<{
        token: string;
        user: User;
      }>((resolve) => {
        setTimeout(() => {
          if (
            credentials.username === "patient" &&
            credentials.password === "password"
          ) {
            resolve({
              token: "patient-mock-token",
              user: { id: "1", username: "patient", type: "patient" },
            });
          } else if (
            credentials.username === "doctor" &&
            credentials.password === "password"
          ) {
            resolve({
              token: "doctor-mock-token",
              user: { id: "2", username: "doctor", type: "doctor" },
            });
          } else {
            throw new Error("Invalid credentials");
          }
        }, 1000);
      });

      // Store token and user in local storage
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      // Update state
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user: response.user, token: response.token },
      });
    } catch (error) {
      dispatch({
        type: "LOGIN_FAILURE",
        payload: error instanceof Error ? error.message : "Failed to login",
      });
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: "LOGOUT" });
  };

  // Provide the context value
  const value = {
    ...state,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
