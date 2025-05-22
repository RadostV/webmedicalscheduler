import api from '../../config/api.config';
import { Appointment } from '../../types/shared/appointment.types';

export const appointmentService = {
  async getAppointments(userType: 'doctor' | 'patient'): Promise<Appointment[]> {
    const endpoint = userType === 'doctor' ? '/api/doctors/appointments' : '/api/patients/appointments';
    const response = await api.get<any[]>(endpoint);

    return response.data.map((appointment) => {
      const hasPrescription = Boolean(
        appointment.prescriptionFile ||
          appointment.prescriptionUrl ||
          appointment.prescription ||
          appointment.hasPrescription
      );

      return {
        id: appointment.id.toString(),
        patientId: appointment.patientId.toString(),
        doctorId: appointment.doctorId.toString(),
        dateTime: appointment.dateTime,
        status: appointment.status,
        consultationAnalysis: appointment.consultationAnalysis || '',
        description: appointment.description || '',
        hasPrescription,
        // For doctors, show patient name; for patients, show doctor details
        ...(userType === 'doctor'
          ? {
              patientName: appointment.patient?.username || 'Unknown Patient',
            }
          : {
              doctor: {
                id: appointment.doctor?.id.toString() || '',
                userId: appointment.doctor?.userId.toString() || '',
                name: appointment.doctor?.name || 'Unknown Doctor',
                specialty: appointment.doctor?.specialty || '',
              },
            }),
      };
    });
  },

  async updateAppointmentStatus(appointmentId: string, status: string): Promise<Appointment> {
    const response = await api.patch<Appointment>(`/api/doctors/appointments/${appointmentId}/status`, { status });
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

  async deleteAppointment(appointmentId: string): Promise<void> {
    await api.delete(`/api/doctors/appointments/${appointmentId}`);
  },

  async scheduleAppointment(formData: FormData): Promise<Appointment> {
    const response = await api.post<Appointment>('/api/patients/appointments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};
