import api from '../../config/api.config';
import { Appointment, AppointmentStatus } from '../../types/shared/appointment.types';
import { Availability, AvailabilityRequest } from '../../types/doctor';

export const doctorService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/doctors/appointments');
    return response.data;
  },

  async getAvailability(): Promise<Availability[]> {
    const response = await api.get<Availability[]>('/doctors/availability');
    return response.data;
  },

  async setAvailability(availabilityData: AvailabilityRequest): Promise<Availability> {
    const response = await api.post<Availability>('/doctors/availability', availabilityData);
    return response.data;
  },

  async deleteAvailability(availabilityId: string): Promise<void> {
    await api.delete(`/doctors/availability/${availabilityId}`);
  },

  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<void> {
    await api.patch(`/doctors/appointments/${appointmentId}/status`, { status });
  }
}; 