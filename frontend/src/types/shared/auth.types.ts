export type UserType = 'patient' | 'doctor';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface DoctorProfile {
  id: string;
  specialty: string;
}

export interface User {
  id: string;
  username: string;
  type: UserType;
  doctorProfile?: DoctorProfile;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
} 