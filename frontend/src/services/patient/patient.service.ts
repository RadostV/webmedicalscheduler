import api from '../../config/api.config';
import { Doctor } from '../../types/doctor';
import { appointmentService } from '../shared/appointment.service';

export interface TimeSlot {
  time: string; // Format: "HH:mm"
  available: boolean;
}

export const patientService = {
  getAppointments: () => appointmentService.getAppointments('patient'),
  scheduleAppointment: appointmentService.scheduleAppointment,

  async getDoctors(): Promise<Doctor[]> {
    const response = await api.get<Doctor[]>('/api/doctors');
    return response.data;
  },

  async getDoctorSlots(doctorId: string, date: string): Promise<string[]> {
    const response = await api.get<string[]>(`/api/doctors/${doctorId}/slots`, {
      params: { date },
    });
    return response.data;
  },
};
