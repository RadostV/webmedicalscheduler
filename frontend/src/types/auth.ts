export interface LoginCredentials {
  username: string;
  password: string;
}

export interface User {
  id: number;
  username: string;
  type: 'patient' | 'doctor';
}

export interface AuthResponse {
  token: string;
  user: User;
} 