export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  dateTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  doctor?: {
    username: string;
  };
  patient?: {
    username: string;
  };
}

export interface AppointmentRequest {
  doctorId: number;
  dateTime: string;
} 