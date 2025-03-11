import React, { useState, useEffect, useCallback } from "react";
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
import { Doctor } from "../../types/doctor";
import { TimeSlot } from "../../types/appointment";
import { patientService } from "../../services/patient/patient.service";

const AppointmentScheduler: React.FC = () => {
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
        const doctorsList = await patientService.getDoctors();
        setDoctors(doctorsList);
        setError(null);
      } catch (err) {
        setError("Failed to fetch doctors. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const fetchTimeSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) return;

    setLoading(true);
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const slots = await patientService.getDoctorSlots(
        selectedDoctor,
        formattedDate
      );

      // Convert slots to TimeSlot format with proper typing
      const timeSlots: TimeSlot[] = slots.map((time: string) => ({
        time,
        available: true,
      }));

      setTimeSlots(timeSlots);
      setError(null);
    } catch (err) {
      setError("Failed to fetch available time slots. Please try again later.");
      console.error(err);
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
      setSelectedTime("");
    }
  }, [selectedDoctor, selectedDate, fetchTimeSlots]);

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
      const dateTime = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":");
      dateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

      await patientService.scheduleAppointment({
        doctorId: selectedDoctor,
        dateTime: dateTime.toISOString(),
      });

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
    doctors.find((doctor) => doctor.userId === selectedDoctor)?.name || "";

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
                  <MenuItem key={doctor.id} value={doctor.userId}>
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
