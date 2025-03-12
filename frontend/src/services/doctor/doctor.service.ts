import api from '../../config/api.config';
import { Appointment, AppointmentStatus } from '../../types/shared/appointment.types';
import { Availability, AvailabilityRequest } from '../../types/doctor';
import { DoctorProfile } from '../../types/shared/auth.types';
import axios from 'axios';

export const doctorService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get<any[]>('/api/doctors/appointments');
    return response.data.map((appointment) => ({
      id: appointment.id.toString(),
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      dateTime: appointment.dateTime,
      status: appointment.status,
      consultationAnalysis: appointment.consultationAnalysis || '',
      description: appointment.description || '',
      hasPrescription: appointment.prescriptionFile != null,
      patientName: appointment.patient?.username || 'Unknown Patient',
      doctor: {
        id: appointment.doctorId.toString(),
        userId: appointment.doctorId.toString(),
        name: appointment.doctorName || 'Unknown Doctor',
        specialty: appointment.specialty || '',
      },
    }));
  },

  async getAvailability(): Promise<Availability[]> {
    const response = await api.get<Availability[]>('/api/doctors/availability');
    return response.data;
  },

  async getDoctorAvailability(doctorId: string): Promise<Availability[]> {
    try {
      const response = await api.get<Availability[]>(`/api/doctors/${doctorId}/availability`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async setAvailability(availabilityData: AvailabilityRequest): Promise<Availability> {
    const response = await api.post<Availability>('/api/doctors/availability', availabilityData);
    return response.data;
  },

  async deleteAvailability(availabilityId: string): Promise<void> {
    await api.delete(`/api/doctors/availability/${availabilityId}`);
  },

  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<Appointment> {
    const response = await api.patch<Appointment>(`/api/doctors/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  async updateProfile(profileData: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const response = await api.patch<DoctorProfile>('/api/doctors/profile', profileData);
    return response.data;
  },

  async uploadPhoto(photo: File): Promise<DoctorProfile> {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await api.post('/api/doctors/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const currentProfile = await this.getProfile();
    return {
      ...currentProfile,
      photoUrl: response.data.doctor.photoUrl,
    };
  },

  async getProfile(): Promise<DoctorProfile> {
    const response = await api.get('/api/doctors/profile');
    return response.data;
  },

  async completeAppointment(appointmentId: string, formData: FormData): Promise<Appointment> {
    const response = await api.patch<Appointment>(`/api/doctors/appointments/${appointmentId}/complete`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
