import api from '../../config/api.config';
import { Appointment, AppointmentStatus } from '../../types/shared/appointment.types';
import { Availability, AvailabilityRequest } from '../../types/doctor';
import { DoctorProfile } from '../../types/shared/auth.types';
import axios from 'axios';

export const doctorService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/doctors/appointments');
    return response.data;
  },

  async getAvailability(): Promise<Availability[]> {
    const response = await api.get<Availability[]>('/doctors/availability');
    return response.data;
  },

  async getDoctorAvailability(doctorId: string): Promise<Availability[]> {
    try {
      const response = await api.get<Availability[]>(`/doctors/${doctorId}/availability`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // If no availability is found, return an empty array instead of throwing an error
        return [];
      }
      throw error;
    }
  },

  async setAvailability(availabilityData: AvailabilityRequest): Promise<Availability> {
    const response = await api.post<Availability>('/doctors/availability', availabilityData);
    return response.data;
  },

  async deleteAvailability(availabilityId: string): Promise<void> {
    await api.delete(`/doctors/availability/${availabilityId}`);
  },

  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<Appointment> {
    console.log('Updating appointment status:', { appointmentId, status });
    try {
      const response = await api.patch<Appointment>(`/doctors/appointments/${appointmentId}/status`, { status });
      console.log('Update appointment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in updateAppointmentStatus:', error);
      throw error;
    }
  },

  async updateProfile(profileData: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const response = await api.patch<DoctorProfile>('/doctors/profile', profileData);
    return response.data;
  },

  async uploadPhoto(photo: File): Promise<DoctorProfile> {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await api.post('/doctors/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Get the current doctor profile to ensure we have all the fields
    const currentProfile = await this.getProfile();

    // Return the updated doctor profile with the new photo URL
    return {
      ...currentProfile,
      photoUrl: response.data.doctor.photoUrl,
    };
  },

  async getProfile(): Promise<DoctorProfile> {
    try {
      const response = await api.get('/doctors/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      throw error;
    }
  },
};
