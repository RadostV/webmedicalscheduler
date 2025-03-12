import api from '../../config/api.config';
import { LoginRequest, AuthResponse, User } from '../../types/shared/auth.types';

interface ApiResponse {
  token: string;
  user: {
    id: number;
    username: string;
    type: 'patient' | 'doctor';
    doctorProfile?: {
      id: number;
      specialty: string;
      education: string;
      qualification: string;
      description: string;
      siteUrl?: string;
      phone: string;
      email: string;
      location: string;
      languages: string;
    };
  };
}

interface RegisterRequest {
  username: string;
  password: string;
  type: 'patient' | 'doctor';
  specialty?: string;
  education?: string;
  qualification?: string;
  description?: string;
  siteUrl?: string;
  phone?: string;
  email?: string;
  location?: string;
  languages?: string;
}

const convertUser = (apiUser: ApiResponse['user']): User => ({
  ...apiUser,
  id: apiUser.id.toString(),
  doctorProfile: apiUser.doctorProfile
    ? {
        ...apiUser.doctorProfile,
        id: apiUser.doctorProfile.id.toString(),
      }
    : undefined,
});

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse>('/api/auth/login', credentials);
    return {
      token: response.data.token,
      user: convertUser(response.data.user),
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse>('/api/auth/register', data);
    return {
      token: response.data.token,
      user: convertUser(response.data.user),
    };
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    const user = JSON.parse(userStr);
    return convertUser(user);
  },

  setAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};
