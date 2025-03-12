import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Collapse,
  Link,
  Snackbar,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import ErrorMessage from '../../components/shared/ErrorMessage';
import { Appointment } from '../../types/shared/appointment.types';
import { patientService } from '../../services/patient/patient.service';
import { API_BASE_URL } from '../../config/api.config';

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

interface ExpandableRowProps {
  appointment: Appointment;
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({ appointment }) => {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('token');

  const handlePrescriptionClick = (event: React.MouseEvent) => {
    if (!token) {
      event.preventDefault();
      setError('Please log in to view the prescription');
      return;
    }

    // Check if the prescription file exists
    if (!appointment.hasPrescription) {
      event.preventDefault();
      setError('Prescription not found');
      return;
    }
  };

  return (
    <>
      <TableRow>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell>{appointment.doctor?.name}</TableCell>
        <TableCell>{format(new Date(appointment.dateTime), 'MMMM d, yyyy')}</TableCell>
        <TableCell>{format(new Date(appointment.dateTime), 'h:mm a')}</TableCell>
        <TableCell>
          <Chip label={appointment.status} color={getStatusColor(appointment.status) as any} size="small" />
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Medical Details
              </Typography>
              <Table size="small">
                <TableBody>
                  {appointment.consultationAnalysis && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', width: '200px' }}>
                        Consultation Analysis
                      </TableCell>
                      <TableCell>{appointment.consultationAnalysis}</TableCell>
                    </TableRow>
                  )}
                  {appointment.description && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Description
                      </TableCell>
                      <TableCell>{appointment.description}</TableCell>
                    </TableRow>
                  )}
                  {appointment.hasPrescription && (
                    <TableRow>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        Prescription
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`${API_BASE_URL}/api/doctors/appointments/${appointment.id}/prescription?token=${token}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={handlePrescriptionClick}
                        >
                          View Prescription (PDF)
                        </Link>
                      </TableCell>
                    </TableRow>
                  )}
                  {!appointment.consultationAnalysis && !appointment.description && !appointment.hasPrescription && (
                    <TableRow>
                      <TableCell colSpan={2}>
                        <Typography variant="body2" color="text.secondary">
                          No medical details available
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

const AppointmentList: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const appointmentsList = await patientService.getAppointments();
        setAppointments(appointmentsList);
        setError(null);
      } catch (err) {
        setError('Failed to fetch appointments. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading appointments..." />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">My Appointments</Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/patient/schedule')}>
          Schedule New Appointment
        </Button>
      </Box>

      {appointments.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography>No appointments scheduled.</Typography>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate('/patient/schedule')}>
            Schedule Your First Appointment
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell style={{ width: '50px' }} />
                <TableCell>Doctor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments
                .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
                .map((appointment) => (
                  <ExpandableRow key={appointment.id} appointment={appointment} />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AppointmentList;
