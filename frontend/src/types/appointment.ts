import { Doctor } from './doctor';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string; // ISO 8601 format
  status: 'scheduled' | 'completed' | 'cancelled';
  doctor?: Doctor;
  patient?: {
    id: string;
    username: string;
  };
}

export interface AppointmentRequest {
  doctorId: string;
  dateTime: string; // ISO 8601 format
}

export interface TimeSlot {
  time: string; // Format: "HH:mm"
  available: boolean;
} 