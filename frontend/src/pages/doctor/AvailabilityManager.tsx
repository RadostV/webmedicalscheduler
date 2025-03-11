import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Divider,
  SelectChangeEvent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../contexts/shared/AuthContext";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import ErrorMessage from "../../components/shared/ErrorMessage";
import Modal from "../../components/shared/Modal";
import { format } from "date-fns";
import { Availability, DayAvailability } from "../../types/doctor/doctor.types";

const AvailabilityManager: React.FC = () => {
  const { token } = useAuth();
  const [availabilities, setAvailabilities] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedAvailability, setSelectedAvailability] = useState<
    string | null
  >(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState<number | "">("");
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [formErrors, setFormErrors] = useState({
    dayOfWeek: false,
    startTime: false,
    endTime: false,
    timeRange: false,
  });

  // Days of the week mapping
  const daysOfWeek = [
    { value: 0, label: "Sunday" },
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
  ];

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        // TODO: Replace with actual API call
        // Mock data for now
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockAvailabilities: DayAvailability[] = [
          {
            id: "1",
            day: "Monday",
            dayOfWeek: 1,
            startTime: "09:00",
            endTime: "17:00",
          },
          {
            id: "2",
            day: "Tuesday",
            dayOfWeek: 2,
            startTime: "09:00",
            endTime: "17:00",
          },
          {
            id: "3",
            day: "Wednesday",
            dayOfWeek: 3,
            startTime: "09:00",
            endTime: "17:00",
          },
          {
            id: "4",
            day: "Thursday",
            dayOfWeek: 4,
            startTime: "09:00",
            endTime: "12:00",
          },
        ];

        setAvailabilities(mockAvailabilities);
        setError(null);
      } catch (err) {
        setError("Failed to fetch availability. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, [token]);

  const handleDayChange = (event: SelectChangeEvent<number | "">) => {
    setDayOfWeek(event.target.value as number);
    setFormErrors({ ...formErrors, dayOfWeek: false });
  };

  const handleStartTimeChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setStartTime(event.target.value);
    setFormErrors({ ...formErrors, startTime: false, timeRange: false });
  };

  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(event.target.value);
    setFormErrors({ ...formErrors, endTime: false, timeRange: false });
  };

  const validateForm = () => {
    const errors = {
      dayOfWeek: dayOfWeek === "",
      startTime: !startTime,
      endTime: !endTime,
      timeRange: startTime >= endTime,
    };

    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if this day already exists
      const existingIndex = availabilities.findIndex(
        (avail) => avail.dayOfWeek === dayOfWeek
      );

      if (existingIndex >= 0) {
        // Update existing availability
        const updatedAvailabilities = [...availabilities];
        updatedAvailabilities[existingIndex] = {
          ...updatedAvailabilities[existingIndex],
          startTime,
          endTime,
        };
        setAvailabilities(updatedAvailabilities);
      } else {
        // Add new availability
        const newAvailability: DayAvailability = {
          id: `new-${Date.now()}`, // Temporary ID
          day: daysOfWeek.find((day) => day.value === dayOfWeek)?.label || "",
          dayOfWeek: dayOfWeek as number,
          startTime,
          endTime,
        };
        setAvailabilities([...availabilities, newAvailability]);
      }

      // Clear the form
      setDayOfWeek("");
      setStartTime("09:00");
      setEndTime("17:00");

      // Show success message
      setSuccessMessage("Availability saved successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to save availability. Please try again later.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvailability = (id: string) => {
    setSelectedAvailability(id);
    setModalOpen(true);
  };

  const confirmDeleteAvailability = async () => {
    if (!selectedAvailability) return;

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Remove from local state
      setAvailabilities(
        availabilities.filter((avail) => avail.id !== selectedAvailability)
      );

      setModalOpen(false);
      setSelectedAvailability(null);

      // Show success message
      setSuccessMessage("Availability removed successfully");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError("Failed to remove availability. Please try again later.");
      console.error(err);
    }
  };

  if (loading && availabilities.length === 0) {
    return <LoadingSpinner message="Loading availability settings..." />;
  }

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, "h:mm a");
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Availability
      </Typography>

      {error && <ErrorMessage message={error} />}

      {successMessage && (
        <Box sx={{ mb: 2 }}>
          <ErrorMessage message={successMessage} title="Success" />
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Set Availability
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <FormControl
                fullWidth
                error={formErrors.dayOfWeek}
                sx={{ mb: 2 }}
              >
                <InputLabel id="day-of-week-label">Day of Week</InputLabel>
                <Select
                  labelId="day-of-week-label"
                  id="day-of-week"
                  value={dayOfWeek}
                  label="Day of Week"
                  onChange={handleDayChange}
                >
                  {daysOfWeek.map((day) => (
                    <MenuItem key={day.value} value={day.value}>
                      {day.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.dayOfWeek && (
                  <Typography variant="caption" color="error">
                    Please select a day
                  </Typography>
                )}
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    id="start-time"
                    label="Start Time"
                    type="time"
                    value={startTime}
                    onChange={handleStartTimeChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={formErrors.startTime || formErrors.timeRange}
                    helperText={formErrors.startTime ? "Required" : ""}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    id="end-time"
                    label="End Time"
                    type="time"
                    value={endTime}
                    onChange={handleEndTimeChange}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    error={formErrors.endTime || formErrors.timeRange}
                    helperText={formErrors.endTime ? "Required" : ""}
                  />
                </Grid>
              </Grid>

              {formErrors.timeRange && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ display: "block", mt: 1 }}
                >
                  End time must be after start time
                </Typography>
              )}

              <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end" }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Availability"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Current Availability
            </Typography>

            {availabilities.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Start Time</TableCell>
                      <TableCell>End Time</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availabilities
                      .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                      .map((availability) => (
                        <TableRow key={availability.id}>
                          <TableCell>{availability.day}</TableCell>
                          <TableCell>
                            {formatTime(availability.startTime)}
                          </TableCell>
                          <TableCell>
                            {formatTime(availability.endTime)}
                          </TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleDeleteAvailability(availability.id!)
                              }
                            >
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="body1">No availability set.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Modal
        open={modalOpen}
        title="Delete Availability"
        message="Are you sure you want to remove this availability? This action cannot be undone."
        onConfirm={confirmDeleteAvailability}
        onCancel={() => {
          setModalOpen(false);
          setSelectedAvailability(null);
        }}
        confirmText="Yes, Delete"
        cancelText="No, Keep It"
      />
    </Box>
  );
};

export default AvailabilityManager;
