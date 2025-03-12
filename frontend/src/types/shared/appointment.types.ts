export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  dateTime: string; // ISO format date string
  status: AppointmentStatus;
  patientName?: string;
  doctorName?: string;
  consultationAnalysis?: string;
  description?: string;
  hasPrescription?: boolean;
  doctor?: {
    id: string;
    userId: string;
    name: string;
    specialty: string;
  };
}

export interface AppointmentRequest {
  doctorId: string;
  dateTime: string; // ISO format date string
}

export interface TimeSlot {
  time: string; // Format: "HH:MM" (24-hour)
  available: boolean;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  patientId: string;
  doctorId: string;
}
