import api from '../../config/api.config';
import { Appointment, AppointmentStatus } from '../../types/shared/appointment.types';
import { Availability, AvailabilityRequest } from '../../types/doctor';
import { DoctorProfile } from '../../types/shared/auth.types';
import axios from 'axios';

interface SearchDoctorsFilters {
  specialty?: string;
  education?: string;
  qualification?: string;
  description?: string;
  phone?: string;
  email?: string;
  location?: string;
  languages?: string;
}

export const doctorService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await api.get<any[]>('/api/doctors/appointments');
    return response.data.map((appointment) => ({
      id: appointment.id.toString(),
      patientId: appointment.patientId.toString(),
      doctorId: appointment.doctorId.toString(),
      dateTime: appointment.dateTime,
      status: appointment.status,
      consultationAnalysis: appointment.consultationAnalysis || '',
      description: appointment.description || '',
      hasPrescription: appointment.prescriptionFile != null,
      patientName: appointment.patient?.username || 'Unknown Patient',
      doctor: {
        id: appointment.doctorId.toString(),
        userId: appointment.doctorId.toString(),
        name: appointment.doctorName || 'Unknown Doctor',
        specialty: appointment.specialty || '',
      },
    }));
  },

  async getAvailability(): Promise<Availability[]> {
    const response = await api.get<Availability[]>('/api/doctors/availability');
    return response.data;
  },

  async getDoctorAvailability(doctorId: string): Promise<Availability[]> {
    try {
      const response = await api.get<Availability[]>(`/api/doctors/${doctorId}/availability`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  async setAvailability(availabilityData: AvailabilityRequest): Promise<Availability> {
    const response = await api.post<Availability>('/api/doctors/availability', availabilityData);
    return response.data;
  },

  async deleteAvailability(availabilityId: string): Promise<void> {
    await api.delete(`/api/doctors/availability/${availabilityId}`);
  },

  async updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<Appointment> {
    const response = await api.patch<Appointment>(`/api/doctors/appointments/${appointmentId}/status`, { status });
    return response.data;
  },

  async updateProfile(profileData: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const response = await api.patch<DoctorProfile>('/api/doctors/profile', profileData);
    return response.data;
  },

  async uploadPhoto(photo: File): Promise<DoctorProfile> {
    const formData = new FormData();
    formData.append('photo', photo);

    const response = await api.post('/api/doctors/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const currentProfile = await this.getProfile();
    return {
      ...currentProfile,
      photoUrl: response.data.doctor.photoUrl,
    };
  },

  async getProfile(): Promise<DoctorProfile> {
    const response = await api.get('/api/doctors/profile');
    return response.data;
  },

  async getDoctorProfile(doctorId: string): Promise<DoctorProfile> {
    try {
      console.log('Fetching doctor profile for ID:', doctorId);
      const response = await api.get<DoctorProfile[]>('/api/doctors');
      const doctor = response.data.find((d) => d.id === doctorId);

      if (!doctor) {
        throw new Error('Doctor not found');
      }

      console.log('Doctor profile found:', doctor);
      return doctor;
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
        throw new Error(error.response?.data?.message || error.message);
      }
      throw error;
    }
  },

  async completeAppointment(appointmentId: string, formData: FormData): Promise<Appointment> {
    const response = await api.patch<Appointment>(`/api/doctors/appointments/${appointmentId}/complete`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async searchDoctors(filters: SearchDoctorsFilters): Promise<DoctorProfile[]> {
    const response = await api.get<DoctorProfile[]>('/api/doctors');
    return response.data.filter((doctor) => {
      const matchesSpecialty =
        !filters.specialty || doctor.specialty.toLowerCase().includes(filters.specialty.toLowerCase());
      const matchesEducation =
        !filters.education || doctor.education?.toLowerCase().includes(filters.education.toLowerCase());
      const matchesQualification =
        !filters.qualification || doctor.qualification?.toLowerCase().includes(filters.qualification.toLowerCase());
      const matchesDescription =
        !filters.description || doctor.description?.toLowerCase().includes(filters.description.toLowerCase());
      const matchesPhone = !filters.phone || doctor.phone?.toLowerCase().includes(filters.phone.toLowerCase());
      const matchesEmail = !filters.email || doctor.email?.toLowerCase().includes(filters.email.toLowerCase());
      const matchesLocation =
        !filters.location || doctor.location?.toLowerCase().includes(filters.location.toLowerCase());
      const matchesLanguages =
        !filters.languages || doctor.languages?.toLowerCase().includes(filters.languages.toLowerCase());

      return (
        matchesSpecialty &&
        matchesEducation &&
        matchesQualification &&
        matchesDescription &&
        matchesPhone &&
        matchesEmail &&
        matchesLocation &&
        matchesLanguages
      );
    });
  },
};
