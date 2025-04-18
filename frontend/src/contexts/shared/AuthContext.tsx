import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthState, User, LoginRequest, AuthResponse } from '../../types/shared/auth.types';
import api from '../../config/api.config';
import { authService } from '../../services/shared/auth.service';
import { Box, CircularProgress } from '@mui/material';

interface RegisterRequest {
  username: string;
  password: string;
  type: 'patient' | 'doctor';
  specialty?: string;
}

// Define the interface for the context value
interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  register: (data: RegisterRequest) => Promise<void>;
  updateUser: (updatedUser: User) => void;
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
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' };

// Auth reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const currentUser = authService.getCurrentUser();

        if (token && currentUser) {
          // Set the token in the API configuration
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { user: currentUser, token },
          });
        } else {
          // Clear any stale data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGIN_FAILURE', payload: '' });
        }
      } catch (error) {
        // Clear any invalid data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGIN_FAILURE', payload: '' });
      } finally {
        setInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  // Don't render children until auth is initialized
  if (!initialized) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'LOGIN_REQUEST' });

    try {
      const response = await api.post<{
        token: string;
        user: User;
      }>('/api/auth/login', credentials);

      const { token, user } = response.data;

      // Set the token in the API configuration
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Store token and user in local storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Update state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to login';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      return;
    }
  };

  // Logout function
  const logout = (): void => {
    // Remove token from API configuration
    delete api.defaults.headers.common['Authorization'];

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Update state
    dispatch({ type: 'LOGOUT' });

    // Redirect to login page
    navigate('/login', { replace: true });
  };

  // Register function
  const register = async (data: RegisterRequest): Promise<void> => {
    dispatch({ type: 'LOGIN_REQUEST' });

    try {
      const response = await authService.register(data);

      // Store token and user in local storage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Update state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to register';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  const updateUser = (updatedUser: User) => {
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: { user: updatedUser, token: localStorage.getItem('token') || '' },
    });
  };

  // Provide the context value
  const value = {
    ...state,
    login,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook to use auth context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
