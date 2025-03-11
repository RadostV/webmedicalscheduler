export interface Doctor {
  id: string;
  userId: string;
  name: string;
  specialty: string;
}

export interface Availability {
  id: string;
  doctorId: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  startTime: string; // Format: "HH:mm"
  endTime: string; // Format: "HH:mm"
}

export interface AvailabilityRequest {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
} 