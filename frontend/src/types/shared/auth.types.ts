export type UserType = 'patient' | 'doctor';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  name: string;
  specialty: string;
  education: string;
  qualification: string;
  description: string;
  siteUrl?: string;
  phone: string;
  email: string;
  location: string;
  languages: string;
  photoUrl?: string;
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
