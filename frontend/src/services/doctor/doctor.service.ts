import api from '../../config/api.config';
import { Appointment, AppointmentStatus } from '../../types/shared/appointment.types';
import { Availability, AvailabilityRequest } from '../../types/doctor';
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
  }
}; 