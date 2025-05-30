import React, { useState, useEffect, useMemo } from 'react';
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
  SelectChangeEvent,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import SuccessMessage from '../../components/shared/SuccessMessage';
import Modal from '../../components/shared/Modal';
import { format } from 'date-fns';
import { doctorService } from '../../services/doctor/doctor.service';
import { Availability } from '../../types/doctor';

interface DayAvailability extends Availability {
  day: string;
}

const AvailabilityManager: React.FC = () => {
  const [availabilities, setAvailabilities] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState<number | ''>('');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('17:00');
  const [formErrors, setFormErrors] = useState({
    dayOfWeek: false,
    startTime: false,
    endTime: false,
    timeRange: false,
  });

  // Days of the week mapping - wrapped in useMemo to prevent re-creation on each render
  const daysOfWeek = useMemo(
    () => [
      { value: 0, label: 'Monday' },
      { value: 1, label: 'Tuesday' },
      { value: 2, label: 'Wednesday' },
      { value: 3, label: 'Thursday' },
      { value: 4, label: 'Friday' },
      { value: 5, label: 'Saturday' },
      { value: 6, label: 'Sunday' },
    ],
    []
  );

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      try {
        const availabilityList = await doctorService.getAvailability();

        // Convert to DayAvailability format with proper type conversion
        const dayAvailabilities: DayAvailability[] = availabilityList.map((avail) => ({
          ...avail,
          id: avail.id.toString(),
          doctorId: avail.doctorId.toString(),
          day: daysOfWeek[avail.dayOfWeek].label,
        }));

        setAvailabilities(dayAvailabilities);
        setError(null);
      } catch (err) {
        setError('Failed to fetch availability. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailability();
  }, []);

  const handleDayChange = (event: SelectChangeEvent<number | ''>) => {
    setDayOfWeek(event.target.value as number);
    setFormErrors({ ...formErrors, dayOfWeek: false });
  };

  const handleStartTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStartTime(event.target.value);
    setFormErrors({ ...formErrors, startTime: false, timeRange: false });
  };

  const handleEndTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEndTime(event.target.value);
    setFormErrors({ ...formErrors, endTime: false, timeRange: false });
  };

  const validateForm = () => {
    const errors = {
      dayOfWeek: dayOfWeek === '',
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
      const newAvailability = await doctorService.setAvailability({
        dayOfWeek: dayOfWeek as number,
        startTime,
        endTime,
      });

      // Convert to DayAvailability format with proper type conversion
      const dayAvailability: DayAvailability = {
        ...newAvailability,
        id: newAvailability.id.toString(),
        doctorId: newAvailability.doctorId.toString(),
        day: daysOfWeek[newAvailability.dayOfWeek].label,
      };

      // Update local state
      const existingIndex = availabilities.findIndex((avail) => avail.dayOfWeek === dayOfWeek);

      if (existingIndex >= 0) {
        // Update existing availability
        const updatedAvailabilities = [...availabilities];
        updatedAvailabilities[existingIndex] = dayAvailability;
        setAvailabilities(updatedAvailabilities);
      } else {
        // Add new availability
        setAvailabilities([...availabilities, dayAvailability]);
      }

      // Clear the form
      setDayOfWeek('');
      setStartTime('09:00');
      setEndTime('17:00');

      // Show success message
      setSuccessMessage('Availability saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to save availability. Please try again later.');
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
      await doctorService.deleteAvailability(selectedAvailability);

      // Remove from local state
      setAvailabilities(availabilities.filter((avail) => avail.id !== selectedAvailability));

      setModalOpen(false);
      setSelectedAvailability(null);

      // Show success message
      setSuccessMessage('Availability removed successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to remove availability. Please try again later.');
      console.error(err);
    }
  };

  if (loading && availabilities.length === 0) {
    return <LoadingSpinner message="Loading availability settings..." />;
  }

  // Format time for display
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, 'h:mm a');
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Availability
      </Typography>

      {error && <ErrorMessage message={error} />}

      {successMessage && (
        <Box sx={{ mb: 2 }}>
          <SuccessMessage message={successMessage} />
        </Box>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Set Availability
            </Typography>

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <FormControl fullWidth error={formErrors.dayOfWeek} sx={{ mb: 2 }}>
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
                    helperText={formErrors.startTime ? 'Required' : ''}
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
                    helperText={formErrors.endTime ? 'Required' : ''}
                  />
                </Grid>
              </Grid>

              {formErrors.timeRange && (
                <Typography variant="caption" color="error" sx={{ display: 'block', mt: 1 }}>
                  End time must be after start time
                </Typography>
              )}

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" color="primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Availability'}
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
                          <TableCell>{formatTime(availability.startTime)}</TableCell>
                          <TableCell>{formatTime(availability.endTime)}</TableCell>
                          <TableCell>
                            <IconButton color="error" onClick={() => handleDeleteAvailability(availability.id!)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
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
