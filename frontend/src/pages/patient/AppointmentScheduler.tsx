import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  SelectChangeEvent,
  Grid,
  FormHelperText,
  TextField,
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, addDays, isBefore, getDay, startOfMonth, endOfMonth } from 'date-fns';
import { useAuth } from '../../contexts/shared/AuthContext';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import Modal from '../../components/shared/Modal';
import { Doctor } from '../../types/doctor';
import { TimeSlot } from '../../services/patient/patient.service';
import { patientService } from '../../services/patient/patient.service';
import { doctorService } from '../../services/doctor/doctor.service';
import { Availability } from '../../types/doctor';

const AppointmentScheduler: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preSelectedDoctor = location.state?.selectedDoctor;

  // State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(preSelectedDoctor?.userId || '');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [symptoms, setSymptoms] = useState<string>('');
  const [consultationAnalysis, setConsultationAnalysis] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [formErrors, setFormErrors] = useState({
    doctor: false,
    date: false,
    time: false,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Function to check available slots for a date range
  const checkAvailableDates = useCallback(
    async (startDate: Date, endDate: Date) => {
      if (!selectedDoctor) return;

      const dates = new Set<string>();
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        try {
          const formattedDate = format(currentDate, 'yyyy-MM-dd');
          const slots = await patientService.getDoctorSlots(selectedDoctor, formattedDate);
          if (slots.length > 0) {
            dates.add(formattedDate);
          }
        } catch (err) {
          // If no slots are available, just continue to the next date
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setAvailableDates(dates);
    },
    [selectedDoctor]
  );

  // Check available dates when month changes or doctor changes
  const handleMonthChange = useCallback(
    (date: Date) => {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      checkAvailableDates(start, end);
    },
    [checkAvailableDates]
  );

  useEffect(() => {
    if (selectedDoctor) {
      const today = new Date();
      handleMonthChange(today);
    } else {
      setAvailableDates(new Set());
    }
  }, [selectedDoctor, handleMonthChange]);

  // Filter dates based on availability
  const filterDate = (date: Date) => {
    // Don't allow past dates
    if (isBefore(date, new Date())) {
      return false;
    }

    // If no doctor is selected, don't allow any dates
    if (!selectedDoctor) {
      return false;
    }

    // Check if the date has available slots
    const formattedDate = format(date, 'yyyy-MM-dd');
    return availableDates.has(formattedDate);
  };

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        const doctorsList = await patientService.getDoctors();
        setDoctors(doctorsList);

        // If we have a pre-selected doctor but it's not in the list, add it
        if (preSelectedDoctor && !doctorsList.find((d) => d.userId === preSelectedDoctor.userId)) {
          setDoctors((prev) => [
            ...prev,
            {
              id: preSelectedDoctor.id,
              userId: preSelectedDoctor.userId,
              name: preSelectedDoctor.name,
              specialty: preSelectedDoctor.specialty,
            },
          ]);
        }

        setError(null);
      } catch (err) {
        setError('Failed to fetch doctors. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [preSelectedDoctor]);

  // Fetch doctor's availability when selected
  useEffect(() => {
    const fetchDoctorAvailability = async () => {
      if (!selectedDoctor) {
        setTimeSlots([]);
        return;
      }

      setLoading(true);
      try {
        // We don't need to fetch availability here anymore since we're using the slots endpoint
        setTimeSlots([]);
        setError(null);
      } catch (err) {
        setError("Failed to fetch doctor's availability. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorAvailability();
  }, [selectedDoctor]);

  const fetchTimeSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;

    setLoading(true);
    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const slots = await patientService.getDoctorSlots(selectedDoctor, formattedDate);

      // Convert slots to TimeSlot format with proper typing
      const timeSlots: TimeSlot[] = slots.map((time: string) => ({
        time,
        available: true,
      }));

      setTimeSlots(timeSlots);
      setError(null);
    } catch (err: any) {
      // Don't show error message for no availability, just clear the slots
      if (err.response?.status === 404 && err.response?.data?.error === 'No availability found for this day') {
        setTimeSlots([]);
        setError(null);
      } else {
        setError('Failed to fetch available time slots. Please try again later.');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [selectedDoctor, selectedDate]);

  // Fetch time slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
      setSelectedTime('');
    }
  }, [selectedDoctor, selectedDate, fetchTimeSlots]);

  const handleDoctorChange = (event: SelectChangeEvent) => {
    setSelectedDoctor(event.target.value);
    setSelectedDate(null);
    setSelectedTime('');
    setFormErrors({ ...formErrors, doctor: false });
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setSelectedTime('');
    setFormErrors({ ...formErrors, date: false });
  };

  const handleTimeChange = (event: SelectChangeEvent) => {
    setSelectedTime(event.target.value);
    setFormErrors({ ...formErrors, time: false });
  };

  const validateForm = () => {
    const errors = {
      doctor: !selectedDoctor,
      date: !selectedDate,
      time: !selectedTime,
    };

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleScheduleClick = () => {
    if (validateForm()) {
      setModalOpen(true);
    }
  };

  const confirmAppointment = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) return;

    setLoading(true);
    try {
      // Create a new date object with the selected date
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(':');

      // Set the time components
      dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      // Create form data for file upload
      const formData = new FormData();
      formData.append('doctorId', selectedDoctor);
      formData.append('dateTime', dateTime.toISOString());
      formData.append('symptoms', symptoms);
      formData.append('consultationAnalysis', consultationAnalysis);
      formData.append('description', description);
      if (prescriptionFile) {
        formData.append('prescriptionFile', prescriptionFile);
      }

      console.log('Scheduling appointment:', {
        doctorId: selectedDoctor,
        dateTime: dateTime.toISOString(),
        localTime: dateTime.toString(),
        selectedTime,
        symptoms,
        consultationAnalysis,
        description,
        prescriptionFile: prescriptionFile?.name,
      });

      const response = await patientService.scheduleAppointment(formData);

      console.log('Appointment scheduled:', response);

      // Show success message
      setSuccessMessage('Appointment scheduled successfully');
      setModalOpen(false);

      // Redirect after a short delay to show the success message
      setTimeout(() => {
        navigate('/patient/appointments');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Failed to schedule appointment. Please try again later.';
      setError(errorMessage);
      console.error('Error scheduling appointment:', err);
      setModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading && doctors.length === 0) {
    return <LoadingSpinner message="Loading doctors..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  // Get doctor name for confirmation message
  const selectedDoctorName = doctors.find((doctor) => doctor.userId === selectedDoctor)?.name || '';

  // Format date and time for confirmation message
  const formattedDate = selectedDate ? format(selectedDate, 'MMMM d, yyyy') : '';
  const formattedTime = selectedTime ? format(new Date(`2000-01-01T${selectedTime}`), 'h:mm a') : '';

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Schedule an Appointment
      </Typography>

      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Select Doctor
            </Typography>
            <FormControl fullWidth error={formErrors.doctor}>
              <Select
                labelId="doctor-select-label"
                id="doctor-select"
                value={selectedDoctor}
                onChange={handleDoctorChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a doctor
                </MenuItem>
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.userId}>
                    {doctor.name} - {doctor.specialty}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.doctor && <FormHelperText>Please select a doctor</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Select Date
            </Typography>
            <Box
              sx={{
                '.react-datepicker-wrapper': {
                  width: '100%',
                },
                '.react-datepicker__input-container input': {
                  width: '100%',
                  padding: '16.5px 14px',
                  borderRadius: '4px',
                  border: formErrors.date ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
                  fontSize: '1rem',
                },
              }}
            >
              <DatePicker
                selected={selectedDate}
                onChange={handleDateChange}
                minDate={new Date()}
                maxDate={addDays(new Date(), 30)}
                placeholderText="Select a date"
                filterDate={filterDate}
                dateFormat="MMMM d, yyyy"
                onMonthChange={handleMonthChange}
              />
            </Box>
            {formErrors.date && <FormHelperText error>Please select a date</FormHelperText>}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Select Time
            </Typography>
            <FormControl fullWidth disabled={!selectedDoctor || !selectedDate} error={formErrors.time}>
              <Select
                labelId="time-slot-label"
                id="time-slot"
                value={selectedTime}
                onChange={handleTimeChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select a time
                </MenuItem>
                {timeSlots
                  .filter((slot) => slot.available)
                  .map((slot) => (
                    <MenuItem key={slot.time} value={slot.time}>
                      {format(new Date(`2000-01-01T${slot.time}`), 'h:mm a')}
                    </MenuItem>
                  ))}
              </Select>
              {formErrors.time && <FormHelperText>Please select a time</FormHelperText>}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Symptoms
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Describe your symptoms"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Consultation Analysis
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={consultationAnalysis}
              onChange={(e) => setConsultationAnalysis(e.target.value)}
              placeholder="Enter consultation analysis"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Description
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional description or notes"
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Prescription (PDF)
            </Typography>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="prescription-file"
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.type === 'application/pdf') {
                  setPrescriptionFile(file);
                }
              }}
            />
            <label htmlFor="prescription-file">
              <Button variant="outlined" component="span">
                Upload Prescription
              </Button>
            </label>
            {prescriptionFile && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Selected file: {prescriptionFile.name}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button variant="outlined" sx={{ mr: 2 }} onClick={() => navigate('/patient/appointments')}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleScheduleClick} disabled={loading}>
                Schedule Appointment
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Modal
        open={modalOpen}
        title="Confirm Appointment"
        message={`You are about to schedule an appointment with ${selectedDoctorName} on ${formattedDate} at ${formattedTime}. Do you want to proceed?`}
        onConfirm={confirmAppointment}
        onCancel={() => setModalOpen(false)}
      />
    </Box>
  );
};

export default AppointmentScheduler;
