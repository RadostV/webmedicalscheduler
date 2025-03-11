export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  type: 'patient' | 'doctor';
  doctorProfile?: {
    id: number;
    specialty: string;
  };
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterRequest {
  username: string;
  password: string;
  type: 'patient' | 'doctor';
  specialty?: string;
} 