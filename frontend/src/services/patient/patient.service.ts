import api from '../../config/api.config';
import { Appointment, AppointmentRequest } from '../../types/appointment';

export const patientService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get<Appointment[]>('/patients/appointments');
    return response.data;
  },

  async scheduleAppointment(appointmentData: AppointmentRequest): Promise<Appointment> {
    const response = await api.post<Appointment>('/patients/appointments', appointmentData);
    return response.data;
  },

  async getDoctors() {
    const response = await api.get('/doctors');
    return response.data;
  },

  async getDoctorSlots(doctorId: number, date: string) {
    const response = await api.get(`/doctors/${doctorId}/slots`, {
      params: { date }
    });
    return response.data;
  }
}; 