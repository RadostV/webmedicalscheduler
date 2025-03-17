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
  id: apiUser.id.toString(),
  username: apiUser.username,
  type: apiUser.type,
  doctorProfile: apiUser.doctorProfile
    ? {
        id: apiUser.doctorProfile.id.toString(),
        userId: apiUser.id.toString(),
        name: apiUser.username,
        specialty: apiUser.doctorProfile.specialty,
        education: apiUser.doctorProfile.education,
        qualification: apiUser.doctorProfile.qualification,
        description: apiUser.doctorProfile.description,
        siteUrl: apiUser.doctorProfile.siteUrl,
        phone: apiUser.doctorProfile.phone,
        email: apiUser.doctorProfile.email,
        location: apiUser.doctorProfile.location,
        languages: apiUser.doctorProfile.languages,
      }
    : undefined,
});

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse>('/api/auth/login', credentials);
    const { token, user } = response.data;

    // Set the token in axios defaults
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return {
      token,
      user: convertUser(user),
    };
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<ApiResponse>('/api/auth/register', data);
    const { token, user } = response.data;

    // Set the token in axios defaults
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    return {
      token,
      user: convertUser(user),
    };
  },

  logout(): void {
    // Remove token from axios defaults
    delete api.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
      this.logout(); // Clean up if either token or user is missing
      return null;
    }

    try {
      const user = JSON.parse(userStr);
      return convertUser(user);
    } catch (error) {
      this.logout(); // Clean up if user data is invalid
      return null;
    }
  },

  setAuthData(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
};
