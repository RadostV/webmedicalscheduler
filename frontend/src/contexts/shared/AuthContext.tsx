import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { AuthState, User, LoginRequest, AuthResponse } from '../../types/shared/auth.types';
import api from '../../config/api.config';
import { authService } from '../../services/shared/auth.service';

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
        ...initialState,
      };
    default:
      return state;
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: currentUser, token: localStorage.getItem('token') || '' },
      });
    }
  }, []);

  // Login function
  const login = async (credentials: LoginRequest): Promise<void> => {
    dispatch({ type: 'LOGIN_REQUEST' });

    try {
      const response = await api.post<{
        token: string;
        user: User;
      }>('/auth/login', credentials);

      // Store token and user in local storage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      // Update state
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: response.data.user, token: response.data.token },
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to login';
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: errorMessage,
      });
      throw new Error(errorMessage);
    }
  };

  // Logout function
  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
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
