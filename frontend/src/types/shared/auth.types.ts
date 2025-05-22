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

export interface PatientProfile {
  id: string;
  userId: string;
  name: string;
  dateOfBirth?: string;
  gender?: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  bloodType?: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact?: string;
  photoUrl?: string;
}

export interface User {
  id: string;
  username: string;
  type: UserType;
  doctorProfile?: DoctorProfile;
  patientProfile?: PatientProfile;
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
