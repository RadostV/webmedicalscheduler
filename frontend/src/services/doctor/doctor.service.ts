import api from '../../config/api.config';
import { AppointmentStatus } from '../../types/shared/appointment.types';
import { Availability, AvailabilityRequest } from '../../types/doctor';
import { DoctorProfile } from '../../types/shared/auth.types';
import axios from 'axios';
import { appointmentService } from '../shared/appointment.service';

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
  getAppointments: () => appointmentService.getAppointments('doctor'),

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

  updateAppointmentStatus: appointmentService.updateAppointmentStatus,
  completeAppointment: appointmentService.completeAppointment,
  deleteAppointment: appointmentService.deleteAppointment,

  async updateProfile(profileData: Partial<DoctorProfile>): Promise<DoctorProfile> {
    const response = await api.patch<DoctorProfile>('/api/doctors/profile', profileData);
    return response.data;
  },

  async deleteProfile(): Promise<void> {
    await api.delete('/api/doctors/profile');
  },

  async uploadPhoto(photo: File): Promise<DoctorProfile> {
    const formData = new FormData();
    formData.append('photo', photo);

    try {
      const response = await api.post<{ photoUrl: string }>('/api/doctors/profile/photo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Photo upload response:', response.data);

      // Get the current profile and update it with the new photo URL
      // Add cache-busting param to force a fresh fetch
      const currentProfile = await api
        .get<DoctorProfile>(`/api/doctors/profile?t=${new Date().getTime()}`)
        .then((res) => res.data);

      const updatedProfile = {
        ...currentProfile,
        photoUrl: response.data.photoUrl,
      };

      console.log('Updated profile with new photo:', updatedProfile);
      return updatedProfile;
    } catch (error) {
      console.error('Error uploading photo:', error);
      throw error;
    }
  },

  async getProfile(): Promise<DoctorProfile> {
    const response = await api.get('/api/doctors/profile');
    return response.data;
  },

  async getDoctorProfile(doctorId: string): Promise<DoctorProfile> {
    try {
      console.log('Fetching doctor profile for ID:', doctorId);
      const response = await api.get<DoctorProfile>(`/api/doctors/${doctorId}`);
      console.log('Doctor profile found:', response.data);
      return response.data;
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
