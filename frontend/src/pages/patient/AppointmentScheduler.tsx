import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, addDays, isBefore } from "date-fns";
import { useAuth } from "../../contexts/shared/AuthContext";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorMessage from "../../components/shared/ErrorMessage";
import Modal from "../../components/shared/Modal";
import { Doctor } from "../../types/doctor/doctor.types";
import { TimeSlot } from "../../types/shared/appointment.types";

const AppointmentScheduler: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  // State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState({
    doctor: false,
    date: false,
    time: false,
  });

  // Fetch doctors on mount
  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // Mock data for now
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockDoctors: Doctor[] = [
          {
            id: "2",
            userId: "2",
            specialty: "Cardiology",
            name: "Dr. Jane Smith",
          },
          {
            id: "3",
            userId: "3",
            specialty: "Dermatology",
            name: "Dr. John Doe",
          },
          {
            id: "4",
            userId: "4",
            specialty: "Pediatrics",
            name: "Dr. Sarah Johnson",
          },
        ];

        setDoctors(mockDoctors);
      } catch (err) {
        setError("Failed to fetch doctors. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [token]);

  // Fetch time slots when doctor and date are selected
  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchTimeSlots();
    } else {
      setTimeSlots([]);
      setSelectedTime("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDoctor, selectedDate]);

  const fetchTimeSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;

    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data for now
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockTimeSlots: TimeSlot[] = [
        { time: "09:00", available: true },
        { time: "09:30", available: true },
        { time: "10:00", available: false },
        { time: "10:30", available: true },
        { time: "11:00", available: true },
        { time: "11:30", available: false },
        { time: "13:00", available: true },
        { time: "13:30", available: true },
        { time: "14:00", available: true },
        { time: "14:30", available: false },
        { time: "15:00", available: true },
      ];

      setTimeSlots(mockTimeSlots);
    } catch (err) {
      setError("Failed to fetch available time slots. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorChange = (event: SelectChangeEvent) => {
    setSelectedDoctor(event.target.value);
    setFormErrors({ ...formErrors, doctor: false });
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
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
      // TODO: Replace with actual API call
      // Mock appointment creation for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Close modal and redirect to appointments page
      setModalOpen(false);
      navigate("/patient/appointments");
    } catch (err) {
      setError("Failed to schedule appointment. Please try again later.");
      console.error(err);
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

  // Filter out past dates
  const today = new Date();
  const filterDate = (date: Date) => {
    return !isBefore(date, today);
  };

  // Get doctor name for confirmation message
  const selectedDoctorName =
    doctors.find((doctor) => doctor.id === selectedDoctor)?.name || "";

  // Format date and time for confirmation message
  const formattedDate = selectedDate
    ? format(selectedDate, "MMMM d, yyyy")
    : "";
  const formattedTime = selectedTime
    ? format(new Date(`2000-01-01T${selectedTime}`), "h:mm a")
    : "";

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Schedule an Appointment
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={formErrors.doctor}>
              <InputLabel id="doctor-select-label">Select Doctor</InputLabel>
              <Select
                labelId="doctor-select-label"
                id="doctor-select"
                value={selectedDoctor}
                label="Select Doctor"
                onChange={handleDoctorChange}
              >
                {doctors.map((doctor) => (
                  <MenuItem key={doctor.id} value={doctor.id}>
                    {doctor.name} - {doctor.specialty}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.doctor && (
                <FormHelperText>Please select a doctor</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Select Date
              </Typography>
              <Box
                sx={{
                  ".react-datepicker-wrapper": {
                    width: "100%",
                  },
                  ".react-datepicker__input-container input": {
                    width: "100%",
                    padding: "16.5px 14px",
                    borderRadius: "4px",
                    border: formErrors.date
                      ? "1px solid #d32f2f"
                      : "1px solid rgba(0, 0, 0, 0.23)",
                    fontSize: "1rem",
                  },
                }}
              >
                <DatePicker
                  selected={selectedDate}
                  onChange={handleDateChange}
                  minDate={today}
                  maxDate={addDays(today, 30)}
                  placeholderText="Select a date"
                  filterDate={filterDate}
                  dateFormat="MMMM d, yyyy"
                />
              </Box>
              {formErrors.date && (
                <FormHelperText error>Please select a date</FormHelperText>
              )}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <FormControl
              fullWidth
              disabled={!selectedDoctor || !selectedDate}
              error={formErrors.time}
            >
              <InputLabel id="time-slot-label">Select Time</InputLabel>
              <Select
                labelId="time-slot-label"
                id="time-slot"
                value={selectedTime}
                label="Select Time"
                onChange={handleTimeChange}
              >
                {timeSlots
                  .filter((slot) => slot.available)
                  .map((slot) => (
                    <MenuItem key={slot.time} value={slot.time}>
                      {format(new Date(`2000-01-01T${slot.time}`), "h:mm a")}
                    </MenuItem>
                  ))}
              </Select>
              {formErrors.time && (
                <FormHelperText>Please select a time</FormHelperText>
              )}
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                variant="outlined"
                sx={{ mr: 2 }}
                onClick={() => navigate("/patient/appointments")}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleScheduleClick}
                disabled={loading}
              >
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
