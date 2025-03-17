import api from '../../config/api.config';
import { Appointment } from '../../types/shared/appointment.types';
import { Doctor } from '../../types/doctor';

export interface TimeSlot {
  time: string; // Format: "HH:mm"
  available: boolean;
}

export const patientService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get<any[]>('/api/patients/appointments');
    return response.data.map((appointment) => ({
      id: appointment.id.toString(),
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      dateTime: appointment.dateTime,
      status: appointment.status,
      consultationAnalysis: appointment.consultationAnalysis || '',
      description: appointment.description || '',
      hasPrescription: appointment.prescriptionFile != null,
      doctor: {
        id: appointment.doctor?.id.toString() || '',
        userId: appointment.doctor?.userId.toString() || '',
        name: appointment.doctor?.name || 'Unknown Doctor',
        specialty: appointment.doctor?.specialty || '',
      },
    }));
  },

  async scheduleAppointment(formData: FormData): Promise<Appointment> {
    const response = await api.post<Appointment>('/api/patients/appointments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

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
