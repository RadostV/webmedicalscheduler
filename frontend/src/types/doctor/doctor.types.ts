export interface Doctor {
  id: string;
  userId: string;
  specialty: string;
  name?: string;
}

export interface Availability {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // Format: "HH:MM" (24-hour)
  endTime: string; // Format: "HH:MM" (24-hour)
}

export interface AvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface DayAvailability {
  day: string; // Day name (e.g., "Monday")
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  id?: string;
} 