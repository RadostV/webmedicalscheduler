import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Box,
} from '@mui/material';
import { format } from 'date-fns';
import { patientService } from '../../services/patient/patient.service';
import { Appointment } from '../../types/shared/appointment.types';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'scheduled':
      return 'primary';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const fetchedAppointments = await patientService.getAppointments();
        setAppointments(fetchedAppointments);
        setError(null);
      } catch (err) {
        setError('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Appointments
      </Typography>

      {appointments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No appointments found.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Details</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell>{appointment.doctor?.name || 'Unknown Doctor'}</TableCell>
                  <TableCell>{format(new Date(appointment.dateTime), 'MMMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(appointment.dateTime), 'h:mm a')}</TableCell>
                  <TableCell>
                    <Chip
                      label={appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      color={getStatusColor(appointment.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box>
                      {appointment.consultationAnalysis && (
                        <Typography variant="body2" color="textSecondary">
                          Analysis: {appointment.consultationAnalysis}
                        </Typography>
                      )}
                      {appointment.description && (
                        <Typography variant="body2" color="textSecondary">
                          Description: {appointment.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default Appointments;
