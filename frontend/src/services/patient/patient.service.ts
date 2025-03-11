import api from '../../config/api.config';
import { Appointment, AppointmentRequest } from '../../types/appointment';
import { Doctor } from '../../types/doctor';

export const patientService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/patients/appointments');
    return response.data;
  },

  async scheduleAppointment(appointmentData: AppointmentRequest): Promise<Appointment> {
    const response = await api.post<Appointment>('/patients/appointments', appointmentData);
    return response.data;
  },

  async getDoctors(): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>('/doctors');
    return response.data;
  },

  async getDoctorSlots(doctorId: string, date: string): Promise<string[]> {
    const response = await api.get<string[]>(`/doctors/${doctorId}/slots`, {
      params: { date }
    });
    return response.data;
  }
}; 