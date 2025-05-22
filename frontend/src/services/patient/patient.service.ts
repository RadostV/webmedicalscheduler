import api from '../../config/api.config';
import { Appointment } from '../../types/shared/appointment.types';
import { PatientProfile, DoctorProfile } from '../../types/shared/auth.types';

export interface TimeSlot {
  time: string; // Format: "HH:mm"
  available: boolean;
}

class PatientService {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get('/api/patients/appointments');
    return response.data;
  }

  async scheduleAppointment(formData: FormData): Promise<Appointment> {
    const response = await api.post('/api/patients/appointments', formData);
    return response.data;
  }

  async getDoctors() {
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/patients/doctors?t=${timestamp}`);
    return response.data;
  }

  async getDoctorProfile(doctorId: string): Promise<DoctorProfile> {
    const timestamp = new Date().getTime();
    const response = await api.get(`/api/patients/doctors/${doctorId}?t=${timestamp}`);
    return response.data;
  }

  async getDoctorSlots(doctorId: string, date: string): Promise<string[]> {
    const response = await api.get(`/api/patients/doctors/${doctorId}/slots`, {
      params: { date },
    });
    return response.data;
  }

  async getProfile(): Promise<PatientProfile> {
    const response = await api.get('/api/patients/profile');
    return response.data;
  }

  async getPatientProfile(userId: string): Promise<PatientProfile> {
    const response = await api.get(`/api/patients/profile/${userId}`);
    return response.data;
  }

  async updateProfile(profileData: Partial<PatientProfile>): Promise<PatientProfile> {
    const response = await api.patch('/api/patients/profile', profileData);
    return response.data;
  }

  async uploadPhoto(file: File): Promise<PatientProfile> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post('/api/patients/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  }
}

export const patientService = new PatientService();
