import { Doctor } from './doctor';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string; // ISO 8601 format
  status: string;
  symptoms?: string;
  consultationAnalysis?: string;
  description?: string;
  prescriptionFile?: string;
  doctor: {
    id: string;
    userId: string;
    name: string;
    specialty: string;
  };
  patient?: {
    id: string;
    username: string;
  };
}

export interface AppointmentRequest {
  doctorId: string;
  dateTime: string; // ISO 8601 format
  symptoms?: string;
  consultationAnalysis?: string;
  description?: string;
  prescriptionFile?: string;
}

export interface TimeSlot {
  time: string; // Format: "HH:mm"
  available: boolean;
}
